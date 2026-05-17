/**
 * Deep Reinforcement Learning - Reward Engine
 * Q-Learning based multi-agent recommendation policy
 * Actions: click=1, like=2, share=3, purchase=5, skip=-0.5, ignore=-1
 */

const REWARD_MAP = {
  click: 1.0,
  like: 2.0,
  share: 3.0,
  purchase: 5.0,
  save: 1.5,
  skip: -0.5,
  ignore: -1.0
};

const ALPHA = 0.1;   // Learning rate
const GAMMA = 0.9;   // Discount factor
const EPSILON_DECAY = 0.995;
const MIN_EPSILON = 0.05;

// Initialize reward from action
function initRewardEngine(action) {
  return REWARD_MAP[action] ?? 0;
}

// Q-Learning update: Q(s,a) ← Q(s,a) + α[r + γ·maxQ(s',a') - Q(s,a)]
function updateQValue(qTable, state, action, reward, nextState) {
  const currentQ = qTable.get(`${state}_${action}`) || 0;
  const nextActions = ["click", "like", "share", "purchase", "save", "skip", "ignore"];
  const maxNextQ = Math.max(...nextActions.map(a => qTable.get(`${nextState}_${a}`) || 0));
  const newQ = currentQ + ALPHA * (reward + GAMMA * maxNextQ - currentQ);
  qTable.set(`${state}_${action}`, newQ);
  return newQ;
}

// Epsilon-greedy policy for action selection
function selectAction(qTable, state, epsilon, availableActions) {
  if (Math.random() < epsilon) {
    return availableActions[Math.floor(Math.random() * availableActions.length)];
  }
  let bestAction = availableActions[0];
  let bestQ = -Infinity;
  for (const action of availableActions) {
    const q = qTable.get(`${state}_${action}`) || 0;
    if (q > bestQ) { bestQ = q; bestAction = action; }
  }
  return bestAction;
}

// Decay epsilon (exploration → exploitation)
function decayEpsilon(epsilon) {
  return Math.max(MIN_EPSILON, epsilon * EPSILON_DECAY);
}

// Compute recommendation score for an item
function scoreItem(qTable, userId, itemId, userPreferences = []) {
  const baseScore = qTable.get(`${userId}_${itemId}_click`) || 0;
  const likeBoost = (qTable.get(`${userId}_${itemId}_like`) || 0) * 2;
  const prefBoost = userPreferences.includes(itemId) ? 1.5 : 0;
  return baseScore + likeBoost + prefBoost;
}

module.exports = {
  initRewardEngine,
  updateQValue,
  selectAction,
  decayEpsilon,
  scoreItem
};
