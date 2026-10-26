const BE_NODE_MODULES = "C:\\Users\\PC\\StudioProjects\\BayanihanLink-BE\\node_modules";
module.paths.unshift(BE_NODE_MODULES);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  accountType: { type: String, default: "AFFECTED_INDIVIDUAL" },
  isVerified: { type: Boolean, default: true },
  role: { type: String, enum: ["ADMIN", "OFFICER", "AFFECTED_INDIVIDUAL"], default: "AFFECTED_INDIVIDUAL" },
  authToken: { type: String }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedOfficer() {
  try {
    const mongoUri = "mongodb://127.0.0.1:27017/bayanihanlink";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    const email = "officer@dswd.gov.ph";
    const existing = await User.findOne({ email });

    const passwordHash = await bcrypt.hash("officerdswdgov123", 10);
    const authToken = "token_" + Math.random().toString(36).substring(2);

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
