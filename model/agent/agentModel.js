const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const otherDetailsSchema = new mongoose.Schema({
    aboutAgent: { type: String, required: true },
    role:{type:String,required:true},
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
    sales_team_count: { type: Number, required: false },
    postCode_cover: {
        type: [Number],
        required: true,
        validate: {
            validator: function (v) {
                return v.every(code => /^[0-9]{4,6}$/.test(code.toString()));
            },
            message: "Each postal code must be a valid 4-6 digit number"
        }
    },
    specialization: { type: String, required: true },
    agent_work_type: { type: String, required: false },
    videoCall_offer: { type: String, enum: ['Yes', 'No'], required: false },
    videoCallTech: { type: String },
    digital_solution: { type: String, required: true },
    fees_structure: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    chargeType: {
        type: String,
        enum: ['Percentage', 'Flat'],
        required: true
    },
  fee:{
    type:String,
    required:true
  }
}, { _id: false });

const dealSchema = new mongoose.Schema({
    proposal_id: {
        type: mongoose.Schema.ObjectId,
        ref: "userproposals"
    },
    isClosed: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    }
});

// Main Agent Schema
const AgentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    agentDetails: { type: otherDetailsSchema },
    password: { type: String },
    action: { type: String, enum: ['0', '1'], default: '0' },
    otpCode: { type: String },
    otpExpires: { type: Date },
    isSubscription: {
        type: String,
        enum: ['0', '1'],
        default: "0"
    },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    profile_img: {
        type: String,
    },
    is_approval: {
        type: String,
        enum: ['0', '1', '2'],
        default: '0'
    },
    deals: {
        type: [dealSchema],
        default: []
    }
}, { timestamps: true });



// Create Model
const AgentModel = mongoose.model('agents', AgentSchema);

module.exports = AgentModel;
