 const express=require('express');
const { addAgent, loginAgent,loginwithGoogle,updateAgentDetails, verifyOtp } = require('../../controller/AgentController');
const verifyAgentJwt = require('../../utils/agent/verifyAgent');

const agentRouter = express.Router();


agentRouter.post("/register",addAgent)
agentRouter.get("/login",loginAgent)
agentRouter.post("/google-login",loginwithGoogle)
agentRouter.post("/verify-otp", verifyOtp);
agentRouter.put("/add-agent-details",verifyAgentJwt,updateAgentDetails);


module.exports=agentRouter;