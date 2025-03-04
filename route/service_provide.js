const express = require('express');
const checkJwt = require('../middleware/checkToken');  // Token validation middleware

const cors = require('cors');
const Full_range_service = require('../model/full_range_sevice_provider');

const serviceProvide = express.Router();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Encrypted-Data'],
    credentials: true,
};

serviceProvide.use(cors(corsOptions));
serviceProvide.options('*', cors(corsOptions));

// API to add a new Role
serviceProvide.use("/add", checkJwt, async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            throw new Error("Role name is required");
        }

        // Check if role with the same name exists
        const existingRole = await Full_range_service.findOne({ name, action: '0' });

        if (existingRole) {
            throw new Error("Role with this name already exists");
        }

        const roleInstance = new Full_range_service({ name });
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
serviceProvide.get("/view", checkJwt, async (req, res) => {
  
    try {
        const roles = await Full_range_service.find({ action: "0" });  // Fetch roles with action '0' (active)
        res.status(200).json({ status: "true", data: roles });
    } catch (err) {
        return res.status(500).json({ status: "false", message: err.message });
    }
});

// Edit an existing Role
serviceProvide.put("/edit", checkJwt, async (req, res) => {
    const { name, newName } = req.body;

    try {
        // Check if the new role name already exists
        const existingRole = await Full_range_service.findOne({ name: newName, action: "0" });

        if (existingRole) {
            return res.status(400).json({
                status: "false",
                message: "Role with this name already exists"
            });
        }

        // Proceed with updating the role name
        const roleInstance = await Full_range_service.findOne({ name });

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
serviceProvide.delete("/delete", checkJwt, async (req, res) => {
    const { _id } = req.body;

    try {
        if (!_id) {
            throw new Error("Serivce ID is required");
        }

        const roleInstance = await Full_range_service.findOne({ _id });

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

module.exports = serviceProvide;
