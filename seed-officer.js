require("dotenv").config({ path: "C:\\Users\\PC\\StudioProjects\\BayanihanLink-BE\\.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("C:\\Users\\PC\\StudioProjects\\BayanihanLink-BE\\models\\User");
const { generateToken } = require("C:\\Users\\PC\\StudioProjects\\BayanihanLink-BE\\middleware\\auth");

async function seedOfficer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bayanihanlink");
    console.log("Connected to MongoDB for seeding...");

    const email = "officer@dswd.gov.ph";
    const existing = await User.findOne({ email });

    const passwordHash = await bcrypt.hash("officerdswdgov123", 10);
    const authToken = generateToken();

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = "OFFICER";
      existing.isVerified = true;
      existing.authToken = authToken;
      existing.fullName = "DSWD Relief Officer";
      await existing.save();
      console.log("Officer user updated successfully!");
    } else {
      await User.create({
        fullName: "DSWD Relief Officer",
        email,
        passwordHash,
        contactNumber: "+639111111111",
        address: "DSWD Central Office, Batasan Hills, Quezon City",
        accountType: "AFFECTED_INDIVIDUAL",
        isVerified: true,
        role: "OFFICER",
        authToken
      });
      console.log("Officer user created successfully!");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding officer:", err);
    process.exit(1);
  }
}

seedOfficer();
