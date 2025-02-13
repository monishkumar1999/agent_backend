const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["0", "1"],
      default: "0", // ✅ Corrected action default value
    },
    profileImage: { type: String }, 
    otp:{
        type:String,
    
    },
    otpExpires:{
type:Date
    }
  },
  { timestamps: true }
);

const usersModel = mongoose.model("users", usersSchema);

module.exports = usersModel;
