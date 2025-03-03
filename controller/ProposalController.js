const AgentModel = require("../model/agent/agentModel");
const { UserProposalModel } = require("../model/users/UsersProposal");

const addProposal = async (req, res) => {
    try {
        const userId = req.user?.id; // Ensure userId exists
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access" });
        }

        const {
            propertyType,
            noOfBedRooms,
            price_range,
            pincode,
            property_buying_plain,
            purpose_purchase,
            communicate_preferred,
            location
        } = req.body;

        // Validate required fields
        if (!propertyType) return res.status(400).json({ success: false, message: "Property type is required." });
        if (!noOfBedRooms) return res.status(400).json({ success: false, message: "Number of bedrooms is required." });
        if (!price_range || price_range.min === undefined || price_range.max === undefined) {
            return res.status(400).json({ success: false, message: "Price range (min & max) is required." });
        }
        if (!pincode || !Array.isArray(pincode) || pincode.length === 0) {
            return res.status(400).json({ success: false, message: "At least one pincode is required as an array." });
        }
        if (!property_buying_plain) return res.status(400).json({ success: false, message: "Property buying plan is required." });
        if (!purpose_purchase) return res.status(400).json({ success: false, message: "Purpose of purchase is required." });
        if (!communicate_preferred) return res.status(400).json({ success: false, message: "Preferred communication method is required." });
        if (!location) return res.status(400).json({ success: false, message: "Location is required." });

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
            location
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

        const { pincode, price_range } = proposal;
        if (!price_range || typeof price_range !== 'object' || isNaN(price_range.min) || isNaN(price_range.max)) {
            return res.status(400).json({ success: false, message: "Invalid price range" });
        }

        // Convert pincode to numbers
        const pincodeNumbers = pincode.map(pc => parseInt(pc, 10)).filter(pc => !isNaN(pc));


        // Find matching agents
        const matchingAgents = await AgentModel.find({
            "agentDetails.postCode_cover": { $in: pincodeNumbers }, 
            // "agentDetails.fees_structure.min": { $lte: price_range.min },
            // "agentDetails.fees_structure.max": { $gte: price_range.max },
            action: "0", 
            isSubscription: "1"
        });

        return res.status(200).json({
            success: true,
            message: "Matching agents found",
            agents: matchingAgents
        });

    } catch (error) {
        console.error("Error fetching agents:", error.message, error.stack);
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


const mongoose = require("mongoose"); // Ensure you import mongoose

const viewAgentDetails = async (req, res) => {
    try {
        const { agentId } = req.params;

        // Check if agentId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({
                status: "false",
                message: "Invalid Agent ID format",
            });
        }

        const agentDetails = await AgentModel.findOne({ _id: agentId });

        if (!agentDetails) {
            return res.json({
                status: "false",
                message: "No data found",
            });
        }

        res.json({
            status: "true",
            data: agentDetails,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "false",
            message: "Server error",
            error: error.message,
        });
    }
};


module.exports = { addProposal, getAgentsByProposal, proposalRequestGiveToAgent,getUserProposals,viewAgentDetails };
