const express = require("express");
const User = require("../models/User");
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");
const { initRewardEngine, updateQValue, decayEpsilon, scoreItem } = require("../rl_engine/rewardEngine");

const router = express.Router();

// GET personalized recommendations for user
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const allItems = await Item.find({});
    const qTable = user.agentState.qTable;

    // Score and rank items using RL agent state
    const scored = allItems.map(item => ({
      item,
      score: scoreItem(qTable, String(user._id), String(item._id), user.preferences)
    })).sort((a, b) => b.score - a.score);

    // Return top 12 with scores
    const recommendations = scored.slice(0, 12).map(s => ({
      ...s.item.toObject(),
      rlScore: parseFloat(s.score.toFixed(3))
    }));

    res.json({ recommendations, agentEpsilon: user.agentState.epsilon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST interaction feedback (trains the agent)
router.post("/feedback", protect, async (req, res) => {
  try {
    const { itemId, action, nextItemId } = req.body;
    const user = await User.findById(req.user.id);
    const reward = initRewardEngine(action);

    const state = String(itemId);
    const nextState = nextItemId || "terminal";
    const qMap = user.agentState.qTable || new Map();

    updateQValue(qMap, String(user._id) + "_" + state, action, reward, String(user._id) + "_" + nextState);

    user.agentState.qTable = qMap;
    user.agentState.epsilon = decayEpsilon(user.agentState.epsilon);
    user.agentState.totalReward += reward;
    user.interactionHistory.push({ itemId, action, reward });

    // Keep only last 100 interactions
    if (user.interactionHistory.length > 100) user.interactionHistory.shift();

    await user.save();
    res.json({ reward, epsilon: user.agentState.epsilon, totalReward: user.agentState.totalReward });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET agent stats for the logged-in user
router.get("/agent-stats", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("agentState interactionHistory username");
    const recentHistory = user.interactionHistory.slice(-20).reverse();
    res.json({ agentState: user.agentState, recentHistory, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
