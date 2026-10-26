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

async function verifyOfficer() {
  try {
    const mongoUri = "mongodb://127.0.0.1:27017/bayanihanlink";
    await mongoose.connect(mongoUri);
    const officer = await User.findOne({ email: "officer@dswd.gov.ph" });
    console.log("Officer found:", officer ? {
      email: officer.email,
      role: officer.role,
      isVerified: officer.isVerified,
      hasPasswordHash: !!officer.passwordHash
    } : "Not found");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyOfficer();
