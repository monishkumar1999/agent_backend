
const AgentModel = require("../model/agent/agentModel");
const bcrypt = require("bcrypt");
const { jwt_secret_key } = require("../utils/constant");
const jwt = require("jsonwebtoken");

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

        await newAgent.save();

        return res.status(200).json({ message: "Agent registered successfully", agent: newAgent });
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
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password Before Saving:", password);

        const isMatch = await bcrypt.compare(password, agent.password);


        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: agent._id, email: agent.email, role: "agent" },
            jwt_secret_key,
            { expiresIn: "5d" }
        );

        // Set cookie options
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false, // Change to true in production
            sameSite: "Strict",
            maxAge: 3600000, // 1 hour expiration
        });

        return res.status(200).json({ message: "Login successful", agent, token });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
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

// const updateAgnetDetails=(req,res)=>{

//     const otherDetailsSchema = new mongoose.Schema({
//         aboutAgent: { type: String, required: true },
//         aboutAgency: { type: String, required: true },
//         NegotiationStyle: { type: String, required: true },
//         describes_agent: { type: String, required: true },
//         agency_name: { type: String, required: true },
//         Branch: { type: String, required: true },
//         location_Address: { type: String, required: true },
//         agencyType: { type: String, required: true },
//         services_provided: { type: String, required: true },
//         method_of_sale: { type: String, required: true },
//         buyer_agency_agreement: { type: String, required: true },
//         sales_team_count: { type: Number, required: true },
//         postCode_cover: {
//             type: [String],
//             required: true,
//             validate: {
//                 validator: function (v) {
//                     return v.every(code => /^[0-9]{4,6}$/.test(code));
//                 },
//                 message: "Each postal code must be a valid 4-6 digit number"
//             }
//         },
//         specialization: { type: String, required: true },
//         agent_work_type: { type: String, required: true },
//         videoCall_offer: { type: String, enum: ['Yes', 'No'], required: true },
//         videoCallTech: { type: String, required: true },
//         digital_solution: { type: String, required: true },
//         fees_structure: {
//             min: { type: Number, required: true },
//             max: { type: Number, required: true }
//         }
//     }, { _id: false });
    
// }

const updateAgentDetails = async (req, res) => {
    try {

        const agentId  = req.agent.id; 
        const updateData = req.body; 
       
        const updatedAgent = await AgentModel.findByIdAndUpdate(
            agentId, 
            { agentDetails: updateData }, 
            { new: true, runValidators: true } // Return updated doc & apply validation
        );

        if (!updatedAgent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        return res.status(200).json({ message: "Agent details updated successfully", agent: updatedAgent });
    } catch (error) {
        console.error("Update Agent Error:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


module.exports = { addAgent, loginAgent, loginwithGoogle,updateAgentDetails };
