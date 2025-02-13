 const express=require('express');
const { addAgent, loginAgent,loginwithGoogle,updateAgentDetails } = require('../../controller/AgentController');
const verifyAgentJwt = require('../../utils/agent/verifyAgent');

const agentRouter = express.Router();


agentRouter.post("/register",addAgent)
agentRouter.get("/login",loginAgent)
agentRouter.post("/google-login",loginwithGoogle)
agentRouter.put("/add-agent-details",verifyAgentJwt,updateAgentDetails);
agentRouter.post("/check-jwt",verifyAgentJwt)

module.exports=agentRouter;