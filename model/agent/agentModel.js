const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the sub-schema for other details
const otherDetailsSchema = new mongoose.Schema({
    aboutAgent: { type: String, required: true },
    aboutAgency: { type: String, required: true },
    NegotiationStyle: { type: String, required: true },
    describes_agent: { type: String, required: true },
    agency_name: { type: String, required: true },
    Branch: { type: String, required: true },
    location_Address: { type: String, required: true },
    agencyType: { type: String, required: true },
    services_provided: { type: String, required: true },
    method_of_sale: { type: String, required: true },
    buyer_agency_agreement: { type: String, required: true },
    sales_team_count: { type: Number, required: true },
    postCode_cover: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.every(code => /^[0-9]{4,6}$/.test(code));
            },
            message: "Each postal code must be a valid 4-6 digit number"
        }
    },
    specialization: { type: String, required: true },
    agent_work_type: { type: String, required: true },
    videoCall_offer: { type: String, enum: ['Yes', 'No'], required: true },
    videoCallTech: { type: String, required: true },
    digital_solution: { type: String, required: true },
    fees_structure: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    }
}, { _id: false });

// Define the main schema
const AgentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    agentDetails: { type: otherDetailsSchema },
    password: { type: String },
    action: { type: String, enum: ['0', '1'], default: '0' }
}, { timestamps: true });

// Ensure email and phone are unique when action = '1'
AgentSchema.pre('save', async function (next) {
    const agent = this;

    // Check if email or phone exists with action = '1'
    const existingAgent = await mongoose.model("Agents").findOne({
        $or: [{ email: agent.email }, { phone: agent.phone }],
        action: '0',
    });

    if (existingAgent) {
        return next(new Error('Email or Phone number already registered'));
    }

    next();
});



// Create the model
const AgentModel = mongoose.model('Agents', AgentSchema);

module.exports = AgentModel;
