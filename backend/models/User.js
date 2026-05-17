const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  agentState: {
    qTable: { type: Map, of: Number, default: {} },
    epsilon: { type: Number, default: 1.0 },
    totalReward: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 }
  },
  interactionHistory: [{
    itemId: String,
    action: String,
    reward: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  preferences: { type: [String], default: [] }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
