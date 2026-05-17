const express = require("express");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all agent states (admin dashboard)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select("username agentState interactionHistory createdAt");
    const agentReport = users.map(u => ({
      userId: u._id,
      username: u.username,
      epsilon: u.agentState.epsilon,
      totalReward: u.agentState.totalReward,
      sessionCount: u.agentState.sessionCount,
      interactionCount: u.interactionHistory.length,
      joinedAt: u.createdAt
    }));
    res.json({ agents: agentReport, totalAgents: agentReport.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET system-level RL performance metrics
router.get("/metrics", protect, async (req, res) => {
  try {
    const users = await User.find({}).select("agentState interactionHistory");
    const totalInteractions = users.reduce((s, u) => s + u.interactionHistory.length, 0);
    const avgReward = users.reduce((s, u) => s + u.agentState.totalReward, 0) / (users.length || 1);
    const avgEpsilon = users.reduce((s, u) => s + u.agentState.epsilon, 0) / (users.length || 1);

    const actionCounts = {};
    users.forEach(u => u.interactionHistory.forEach(i => {
      actionCounts[i.action] = (actionCounts[i.action] || 0) + 1;
    }));

    res.json({ totalInteractions, avgReward: parseFloat(avgReward.toFixed(3)), avgEpsilon: parseFloat(avgEpsilon.toFixed(3)), actionCounts, totalUsers: users.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
