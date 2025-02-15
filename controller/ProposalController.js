const AgentModel = require("../model/agent/agentModel");
const { UserProposalModel } = require("../model/users/UsersProposal");

const addProposal = async (req, res) => {
    try {
        const userId = req.user.id; // Get user ID from request (ensure authentication middleware is used)

        // Extract data from request body
        const {
            propertyType,
            noOfBedRooms,
            price_range,
            pincode,
            property_buying_plain,
            purpose_purchase,
            communicate_preferred
        } = req.body;

        // Validate required fields
        if (!propertyType || !noOfBedRooms || !price_range || !pincode || !property_buying_plain || !purpose_purchase || !communicate_preferred) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Create a new proposal document
        const newProposal = new UserProposalModel({
            propertyType,
            noOfBedRooms,
            price_range,
            pincode,
            property_buying_plain,
            purpose_purchase,
            communicate_preferred,
            userId,
        });

        // Save to database
        await newProposal.save();

        return res.status(201).json({
            success: true,
            message: "Proposal added successfully",
            data: newProposal,
        });

    } catch (error) {
        console.error("Error adding proposal:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


const getAgentsByProposal = async (req, res) => {
    try {
        const { proposalId } = req.body;

       
        const proposal = await UserProposalModel.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({ success: false, message: "Proposal not found" });
        }

        // Extract relevant fields
        const { pincode, price_range } = proposal;

        // Convert price_range to a number
        const price = parseFloat(price_range);

        if (isNaN(price)) {
            return res.status(400).json({ success: false, message: "Invalid price range" });
        }

        // Step 2: Find agents matching the criteria
        const matchingAgents = await AgentModel.find({
            "agentDetails.postCode_cover": { $in: pincode }, // At least one matching pincode
            "agentDetails.fees_structure.min": { $lte: price }, // Min fee <= price
            "agentDetails.fees_structure.max": { $gte: price }, // Max fee >= price
            action: "0" , isSubscription:'1'
        });
        
        return res.status(200).json({
            success: true,
            message: "Matching agents found",
            agents: matchingAgents
        });

    } catch (error) {
        console.error("Error fetching agents:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


module.exports = { addProposal ,getAgentsByProposal};
