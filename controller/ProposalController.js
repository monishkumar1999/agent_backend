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
            communicate_preferred,
            address
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
            address
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

        console.log(proposal)

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
            action: "0", isSubscription: '1'
        });

        console.log(matchingAgents)
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

const proposalRequestGiveToAgent = async (req, res) => {
    try {
        const { proposalId, AgentId } = req.body;
        const userId = req.user._id.toString(); // Get user ID from authenticated request

        console.log(userId);

        // ✅ Check if required fields are present
        if (!proposalId || !AgentId) {
            return res.status(400).json({
                status: false,
                message: "Both 'proposalId' and 'AgentId' are required"
            });
        }

        // ✅ Find the proposal that belongs to this user
        const proposal = await UserProposalModel.findOne({ _id: proposalId, userId: userId });

        if (!proposal) {
            return res.status(404).json({
                status: false,
                message: "Proposal not found or doesn't belong to the user"
            });
        }

        // ✅ Check if the agent exists
        const agent = await AgentModel.findById(AgentId);
        if (!agent) {
            return res.status(404).json({
                status: false,
                message: "Agent not found"
            });
        }

        // ✅ Ensure `acceptAgent` is an array (if not, initialize it)
        if (!Array.isArray(proposal.acceptAgent)) {
            proposal.acceptAgent = [];
        }

        // ✅ Check if the agent is already assigned
        const isAlreadyAssigned = proposal.acceptAgent.some(a => a.agent_id.toString() === AgentId);
        if (isAlreadyAssigned) {
            return res.status(400).json({
                status: false,
                message: "Agent is already assigned to this proposal"
            });
        }

        // ✅ Check if the maximum limit (5 agents) is reached
        if (proposal.acceptAgent.length >= 5) {
            return res.status(400).json({
                status: false,
                message: "Maximum 5 agents can be assigned to a proposal"
            });
        }

        // ✅ Add new agent
        proposal.acceptAgent.push({ agent_id: AgentId });

        // ✅ Save changes
        await proposal.save();

        return res.status(200).json({
            status: true,
            message: "Agent assigned successfully",
            proposal
        });

    } catch (error) {
        console.error("Error in proposalRequestGiveToAgent:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


const getUserProposals = async (req,res) => {

    const userId=req.user._id.toString();

  
    try {
        const proposals = await UserProposalModel.find({ userId })
           

        if(!proposals){

            res.json({
                status:"false",
                message:"no data found"
            })
        }

        res.json({
            status:"false",
            data:proposals
        })
       
        return proposals;
    } catch (error) {
        console.error("Error fetching user proposals:", error);
        return null;
    }
};



module.exports = { addProposal, getAgentsByProposal, proposalRequestGiveToAgent,getUserProposals };
