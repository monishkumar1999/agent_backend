const express = require('express');
const checkJwt = require('../../middleware/checkToken');  // Token validation middleware
const Role = require('../../model/role');
const cors = require('cors');
const DigitalSolutionModel = require('../../model/digitalSolution');

const digitalRoute = express.Router();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Encrypted-Data'],
    credentials: true,
};

digitalRoute.use(cors(corsOptions));
digitalRoute.options('*', cors(corsOptions));

// API to add a new Role
digitalRoute.use("/add", checkJwt, async (req, res) => {
    const { name } = req.body;
 
    try {
        if (!name) {
            throw new Error("Role name is required");
        }

        // Check if role with the same name exists
        const existingRole = await DigitalSolutionModel.findOne({ name, action: '0' });

        
        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        const roleInstance = new DigitalSolutionModel({ name });
        const savedRole = await roleInstance.save();
       
        if (savedRole) {
            res.status(200).json({
                status: "true",
                message: "Role added successfully"
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: err.message
        });
    }
});

// View all Roles
digitalRoute.get("/view", async (req, res) => {

    try {
        const roles = await DigitalSolutionModel.find({ action: "0" });  // Fetch roles with action '0' (active)
        res.status(200).json({ status: "true", data: roles });
    } catch (err) {
        return res.status(500).json({ status: "false", message: err.message });
    }
});

// Edit an existing Role
digitalRoute.put("/edit", checkJwt, async (req, res) => {
    const { name, newName } = req.body;

    try {
        // Check if the new role name already exists
        const existingRole = await DigitalSolutionModel.findOne({ name: newName, action: "0" });

        if (existingRole) {
            return res.status(400).json({
                status: "false",
                message: "Role with this name already exists"
            });
        }

        // Proceed with updating the role name
        const roleInstance = await DigitalSolutionModel.findOne({ name });

        if (!roleInstance) {
            return res.status(404).json({
                status: "false",
                message: "Role not found"
            });
        }

        roleInstance.name = newName;
        await roleInstance.save();

        res.status(200).json({
            status: "true",
            message: "Role updated successfully"
        });
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: err.message
        });
    }
});

// Delete a Role (by setting action to '1' instead of deletion)
digitalRoute.delete("/delete", checkJwt, async (req, res) => {
    const { _id } = req.body;

    try {
        if (!_id) {
            throw new Error("Role ID is required");
        }

        const roleInstance = await DigitalSolutionModel.findOne({ _id });

        if (!roleInstance) {
            return res.status(404).json({
                status: "false",
                message: "Role not found"
            });
        }

        roleInstance.action = '1';  // Mark the role as inactive by setting action to '1'
        await roleInstance.save();

        res.status(200).json({
            status: "true",
            message: "Role action updated to '1'"
        });
    } catch (err) {
        return res.status(500).json({
            status: "false",
            message: err.message
        });
    }
});

module.exports = digitalRoute;
