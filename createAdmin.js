require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/user");

async function createAdmin() {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const adminEmail = "admin@phishai.com";
        const adminPassword = "Admin@PhishAI2026";
        const adminName = "PhishAI Admin";

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin account already exists");
            console.log("Email:", existingAdmin.email);
            console.log("Role:", existingAdmin.role);
            console.log("Active:", existingAdmin.isActive);

            await mongoose.disconnect();
            return;
        }

        console.log("Hashing password...");

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            12
        );

        console.log("Creating admin account...");

        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        console.log("");
        console.log("======================================");
        console.log("ADMIN ACCOUNT CREATED");
        console.log("======================================");
        console.log("Name:", admin.name);
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("Active:", admin.isActive);
        console.log("======================================");
        console.log("");

        await mongoose.disconnect();

        console.log("MongoDB Disconnected");

    } catch (error) {
        console.error("");
        console.error("ADMIN CREATION FAILED");
        console.error("Error:", error.message);
        console.error(error.stack);

        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
        }

        process.exit(1);
    }
}

createAdmin();