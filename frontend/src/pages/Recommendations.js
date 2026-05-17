import React, { useEffect, useState } from "react";
import { getRecommendations, sendFeedback } from "../utils/api";

const ACTIONS = ["click","like","share","save","skip"];

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [epsilon, setEpsilon] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  const load = () => {
    setLoading(true);
    getRecommendations().then(r => { setRecs(r.data.recommendations); setEpsilon(r.data.agentEpsilon); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (item, action, idx) => {
    const nextItem = recs[idx + 1];
    try {
      const res = await sendFeedback({ itemId: item._id, action, nextItemId: nextItem?._id });
      setFeedback(prev => ({ ...prev, [item._id]: { action, reward: res.data.reward } }));
      setEpsilon(res.data.epsilon);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page">
      <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"1rem"}}>
        <div>
          <h1 className="page-title">RL Recommendations</h1>
          <p className="page-subtitle">Your personal agent selects items. Interact to train it.</p>
        </div>
        <div style={{display:"flex",gap:"1rem",alignItems:"center",flexWrap:"wrap"}}>
          <div className="stat-card" style={{padding:"0.75rem 1.25rem",minWidth:"150px"}}>
            <div className="stat-label">Agent Epsilon (ε)</div>
            <div className="stat-value" style={{fontSize:"1.3rem"}}>{epsilon?.toFixed(4)}</div>
          </div>
          <button className="btn btn-secondary" onClick={load}>Refresh Agent</button>
        </div>
      </div>

      <div style={{background:"rgba(0,212,170,0.05)",border:"1px solid rgba(0,212,170,0.2)",borderRadius:"10px",padding:"0.75rem 1rem",marginBottom:"1.5rem",fontSize:"0.82rem",color:"var(--muted)"}}>
        <strong style={{color:"var(--accent)"}}>ε-greedy policy:</strong> ε = {epsilon?.toFixed(4)} → {(epsilon * 100).toFixed(1)}% explore, {((1 - epsilon) * 100).toFixed(1)}% exploit. Click actions below to train the Q-table.
      </div>

      {loading ? <div style={{textAlign:"center",padding:"3rem",color:"var(--muted)"}}>Loading agent recommendations...</div>
      : (
        <div className="grid-3">
          {recs.map((item, idx) => (
            <div key={item._id} className="item-card">
              <img src={item.imageUrl || `https://picsum.photos/seed/${item._id}/400/200`} alt={item.title} />
              <div className="item-card-body">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.4rem"}}>
                  <span className="badge badge-purple">{item.category}</span>
                  <span className="rl-score">RL: {item.rlScore}</span>
                </div>
                <div className="item-card-title">{item.title}</div>
                <div className="item-card-desc">{item.description?.slice(0,80)}...</div>
                {feedback[item._id] && (
                  <div style={{padding:"0.35rem 0.7rem",background:"rgba(0,212,170,0.08)",borderRadius:"6px",marginBottom:"0.5rem",fontSize:"0.78rem",color:"var(--accent)"}}>
                    ✓ {feedback[item._id].action} → reward: {feedback[item._id].reward}
                  </div>
                )}
                <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap"}}>
                  {ACTIONS.map(action => (
                    <button key={action} className="btn btn-secondary btn-sm" onClick={() => handleAction(item, action, idx)}
                      style={feedback[item._id]?.action===action?{borderColor:"var(--accent)",color:"var(--accent)"}:{}}>
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
