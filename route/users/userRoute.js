const express = require("express");
const { addUser,loginUser, loginWithGoogle,updateUserProfile,upload,verifyOtp } = require("../../controller/userController");
const verifyUserJwt = require("../../middleware/verifyUserJwt");
const multer = require("multer");

const userRouter = express.Router();
userRouter.post("/add", addUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login",loginWithGoogle);
userRouter.put("/userProfile-update", verifyUserJwt, upload.single("profileImage"), updateUserProfile);
userRouter.get("/verify-otp", verifyOtp); 




module.exports = userRouter;
