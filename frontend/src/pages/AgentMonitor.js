import React, { useEffect, useState } from "react";
import { getAgents, getMetrics } from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#00d4aa","#7c3aed","#f59e0b","#f85149","#3fb950","#58a6ff","#ff7b72"];

export default function AgentMonitor() {
  const [agents, setAgents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAgents(), getMetrics()]).then(([a, m]) => {
      setAgents(a.data.agents);
      setMetrics(m.data);
    }).finally(() => setLoading(false));
  }, []);

  const actionData = metrics ? Object.entries(metrics.actionCounts || {}).map(([name, value]) => ({ name, value })) : [];

  if (loading) return <div className="page"><div className="loading-screen"><div className="spinner" /></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Agent Monitor</h1>
        <p className="page-subtitle mono">Admin view · Multi-agent system health · Q-Learning convergence</p>
      </div>

      {metrics && (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-label">Total Agents</div><div className="stat-value">{metrics.totalUsers}</div></div>
          <div className="stat-card"><div className="stat-label">Total Interactions</div><div className="stat-value">{metrics.totalInteractions}</div></div>
          <div className="stat-card"><div className="stat-label">Avg Reward</div><div className="stat-value">{metrics.avgReward}</div></div>
          <div className="stat-card"><div className="stat-label">Avg Epsilon</div><div className="stat-value">{metrics.avgEpsilon}</div></div>
        </div>
      )}

      <div className="grid-2" style={{marginBottom:"1.5rem"}}>
        {/* Action Distribution Pie */}
        <div className="card">
          <h3 style={{marginBottom:"1rem",fontSize:"0.85rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Action Distribution</h3>
          {actionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={actionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {actionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"8px"}} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{color:"var(--muted)",padding:"2rem",textAlign:"center",fontSize:"0.85rem"}}>No data yet</p>}
        </div>

        {/* Agent Rewards Bar */}
        <div className="card">
          <h3 style={{marginBottom:"1rem",fontSize:"0.85rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Agent Rewards</h3>
          {agents.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agents.slice(0,8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="username" stroke="var(--muted)" tick={{fontSize:10}} />
                <YAxis stroke="var(--muted)" tick={{fontSize:10}} />
                <Tooltip contentStyle={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"8px",color:"var(--text)"}} />
                <Bar dataKey="totalReward" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{color:"var(--muted)",padding:"2rem",textAlign:"center",fontSize:"0.85rem"}}>No agents yet</p>}
        </div>
      </div>

      {/* Agents Table */}
      <div className="card">
        <h3 style={{marginBottom:"1rem",fontSize:"0.85rem",fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.5px"}}>All Agents</h3>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.83rem"}}>
            <thead>
              <tr style={{borderBottom:"1px solid var(--border)"}}>
                {["Username","Epsilon (ε)","Total Reward","Interactions","Joined"].map(h=><th key={h} style={{textAlign:"left",padding:"0.5rem",color:"var(--muted)",fontWeight:700,fontSize:"0.75rem",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.userId} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"0.65rem 0.5rem",fontWeight:700}}>{a.username}</td>
                  <td style={{padding:"0.65rem 0.5rem",color:"var(--accent)"}} className="mono">{a.epsilon?.toFixed(4)}</td>
                  <td style={{padding:"0.65rem 0.5rem",color:"var(--success)"}} className="mono">{a.totalReward?.toFixed(2)}</td>
                  <td style={{padding:"0.65rem 0.5rem",color:"var(--muted)"}} className="mono">{a.interactionCount}</td>
                  <td style={{padding:"0.65rem 0.5rem",color:"var(--muted)"}}>{new Date(a.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
