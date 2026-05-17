import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getAgentStats, getMetrics } from "../utils/api";
import { useAuth } from "../store/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const socket = io("/", { transports: ["websocket"] });

export default function Dashboard() {
  const { user } = useAuth();
  const [agentStats, setAgentStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [rewardChart, setRewardChart] = useState([]);

  useEffect(() => {
    getAgentStats().then(r => {
      setAgentStats(r.data);
      const history = r.data.recentHistory || [];
      setRewardChart(history.slice(-15).reverse().map((h, i) => ({ step: i + 1, reward: h.reward, action: h.action })));
    });
    if (user?.role === "admin") getMetrics().then(r => setMetrics(r.data));

    socket.on("live_feed", (data) => {
      setLiveFeed(prev => [data, ...prev].slice(0, 8));
    });
    return () => socket.off("live_feed");
  }, [user]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Agent Dashboard</h1>
        <p className="page-subtitle mono">User: {user?.username} · Role: {user?.role} · Real-time RL monitoring</p>
      </div>

      {agentStats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Reward</div>
            <div className="stat-value">{agentStats.agentState?.totalReward?.toFixed(1) || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Epsilon (ε)</div>
            <div className="stat-value">{agentStats.agentState?.epsilon?.toFixed(3) || "1.000"}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Interactions</div>
            <div className="stat-value">{agentStats.recentHistory?.length || 0}</div>
          </div>
          {metrics && <>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{metrics.totalUsers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Reward</div>
              <div className="stat-value">{metrics.avgReward}</div>
            </div>
          </>}
        </div>
      )}

      <div className="grid-2" style={{gap:"1.5rem"}}>
        {/* Reward Chart */}
        <div className="card">
          <h3 style={{marginBottom:"1rem",fontSize:"0.9rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Reward History</h3>
          {rewardChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rewardChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="step" stroke="var(--muted)" tick={{fontSize:11}} />
                <YAxis stroke="var(--muted)" tick={{fontSize:11}} />
                <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"8px",color:"var(--text)"}} />
                <Line type="monotone" dataKey="reward" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p style={{color:"var(--muted)",fontSize:"0.85rem",padding:"2rem 0",textAlign:"center"}}>No interactions yet. Browse items and click/like to train your agent!</p>}
        </div>

        {/* Live Feed */}
        <div className="card">
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1rem"}}>
            <h3 style={{fontSize:"0.9rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Live Feed</h3>
            <div className="live-badge"><div className="live-dot" /><span style={{fontSize:"0.7rem",color:"var(--accent)"}}>LIVE</span></div>
          </div>
          {liveFeed.length === 0 ? <p style={{color:"var(--muted)",fontSize:"0.85rem"}}>Waiting for interactions...</p>
          : liveFeed.map((f, i) => (
            <div key={i} style={{padding:"0.5rem 0",borderBottom:"1px solid var(--border)",fontSize:"0.82rem",display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"var(--muted)"}} className="mono">{f.userId?.slice(-6)}</span>
              <span className="badge badge-accent">{f.action}</span>
              <span style={{color:"var(--accent3)"}} className="mono">+{f.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent interactions table */}
      {agentStats?.recentHistory?.length > 0 && (
        <div className="card" style={{marginTop:"1.5rem"}}>
          <h3 style={{marginBottom:"1rem",fontSize:"0.9rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Recent Interactions</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.83rem"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--border)"}}>
                {["Item ID","Action","Reward","Time"].map(h=><th key={h} style={{textAlign:"left",padding:"0.5rem 0.5rem",color:"var(--muted)",fontWeight:700,fontSize:"0.75rem",textTransform:"uppercase"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {agentStats.recentHistory.slice(0,10).map((h,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"0.5rem",color:"var(--muted)"}} className="mono">{h.itemId?.slice(-8)}</td>
                  <td style={{padding:"0.5rem"}}><span className="badge badge-accent">{h.action}</span></td>
                  <td style={{padding:"0.5rem",color:h.reward>=0?"var(--success)":"var(--danger)"}} className="mono">{h.reward}</td>
                  <td style={{padding:"0.5rem",color:"var(--muted)"}}>{new Date(h.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
