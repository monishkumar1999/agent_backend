const mongoose = require('mongoose')

const Proposal = mongoose.Schema({
    propertyType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'properties',
        required: true
    },
    noOfBedRooms: {
        type: Number,
        required: true
    },
    price_range: {
        type: String,
        required: true
    },
    pincode: {
        type: [String],
        required: true
    },
    property_buying_plain: {
        type: String,
        required: true
    },
    purpose_purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "purchase_purpose",
        required: true
    },
    communicate_preferred: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "communicatePreferred",
        required: true

    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    action:{
        type:String,
        enum:['0','1'],
        default:'0'
    }
},{timestamps:true})

const UserProposalModel = mongoose.model("userProposal", Proposal)

module.exports={UserProposalModel}