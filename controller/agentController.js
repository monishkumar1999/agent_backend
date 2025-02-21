
const AgentModel = require("../model/agent/agentModel");
const bcrypt = require("bcrypt");
const { jwt_secret_key } = require("../utils/constant");
const jwt = require("jsonwebtoken");
const { generateOtp, transporter } = require("../utils/email/email");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const addAgent = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const existingAgent = await AgentModel.findOne({
            $or: [{ email }, { phone }],
            action: "0",
        });

        if (existingAgent) {
            return res.status(400).json({ message: "Email or phone already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAgent = new AgentModel({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            action: "0",
        });
        await sendOtp(req, res);
        await newAgent.save();


    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const loginAgent = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        console.log("Login Attempt:", { email, phone });

        const agent = await AgentModel.findOne({
            $or: [{ email }, { phone }],
            action: "0",
        });

        if (!agent) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const isMatch = await bcrypt.compare(password, agent.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        // Generate OTP
        const otpCode = generateOtp();
        const otpExpires = Date.now() + 20 * 60 * 1000; // 20 minutes expiration

        // Update the agent with OTP
        await AgentModel.findByIdAndUpdate(agent._id, { otpCode: otpCode, otpExpires });

        await sendOtp(req, res);

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const sendOtp = async (req, res) => {
    const { email } = req.body;

    console.log(email)
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const otpCode = generateOtp();
        const otpExpires = Date.now() + 20 * 60 * 1000; // 20 minutes validity

        // Store OTP in the database
        await AgentModel.updateOne({ email }, { otpCode: otpCode, otpExpires });


        // Send OTP via email
        await transporter.sendMail({
            from: "digitowls10@gmail.com",
            to: email,
            subject: "Your Verification Code",
            text: `Your OTP is: ${otpCode}`,
        });

        return res.status(200).json({ message: "OTP sent successfully", email });

    } catch (error) {
        console.error("OTP Error:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
    }
};

const loginwithGoogle = async (req, res) => {


    const { email, phone, password } = req.body;

    const agent = await AgentModel.findOne({ email: email, action: '0' })

    console.log(agent)

    if (!agent) {
        return res.json({
            status: "false",
            message: "couldn't find the account"
        })
    }

    const token = jwt.sign(
        { id: agent._id, email: agent.email, role: "agent" },
        jwt_secret_key,
        { expiresIn: "5d" }
    );

    res.cookie("authToken", token, {
        maxAge: 3600000,
    });

    res.status(200).json({
        staus: true,
        message: "Login successful"
    })
}





const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

 
        const agent = await AgentModel.findOne({ email, action: "0" });
        console.log( agent)
        if (!agent) {
            return res.status(400).json({ message: "Agent not found" });
        }

        // Check if OTP is valid
        if (agent.otpCode != otp || Date.now() > agent.otpExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Clear OTP after successful verification
        await AgentModel.findByIdAndUpdate(agent._id, { otp: null, otpExpires: null });

        // Generate JWT token
        const token = jwt.sign(
            { userId: agent._id, email: agent.email, role: "agent" },
            jwt_secret_key,
            { expiresIn: "5d" }
        );
        console.log(token)

        // Set cookie
        res.cookie("auth_token", token, {
          
            maxAge: 3600000,
        });

        return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const saveBase64Image = (base64String, folder = "uploads/agent") => {
    if (!base64String) return null;

    // Ensure the uploads folder exists
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    // Generate a unique filename
    const fileName = `profile-${Date.now()}.png`;
    const filePath = path.join(folder, fileName);

    // Remove metadata if present (data:image/png;base64,)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

    // Convert Base64 to Buffer and save to file
    fs.writeFileSync(filePath, base64Data, "base64");

    return `/uploads/agent/${fileName}`; // Return stored image path
};

const updateAgentDetails = async (req, res) => {
    try {
        const { profile_img, agentDetails, ...updateData } = req.body;
        const agentId = req.agent.id;

        console.log("Update Data:", updateData);
        console.log("Agent Details:", agentDetails);

        // Construct the update payload
        let updatePayload = { $set: updateData };

        // Update nested agentDetails if provided
        if (agentDetails) {
            Object.keys(agentDetails).forEach((key) => {
                updatePayload.$set[`agentDetails.${key}`] = agentDetails[key];
            });
        }

        // Perform the update
        const updatedAgent = await AgentModel.findByIdAndUpdate(
            agentId,
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!updatedAgent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        // Now, save the image if provided
        if (profile_img) {
            const savedImagePath = saveBase64Image(profile_img);
            if (savedImagePath) {
                await AgentModel.findByIdAndUpdate(agentId, { $set: { profile_img: savedImagePath } });
            } else {
                return res.status(400).json({ message: "Invalid image data" });
            }
        }

        // Fetch the latest updated agent data
        const finalAgent = await AgentModel.findById(agentId);

        return res.status(200).json({ message: "Agent details updated successfully", agent: finalAgent });
    } catch (error) {
        console.error("Update Agent Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/agent"); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, "profile-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/; // Allow only images
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            return cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
        }
    },
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
});


module.exports = { addAgent, loginAgent, loginwithGoogle, updateAgentDetails, verifyOtp };
