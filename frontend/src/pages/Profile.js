import React, { useState } from "react";
import { updateMe } from "../utils/api";
import { useAuth } from "../store/AuthContext";

const ALL_PREFS = ["AI/ML","Backend","Frontend","Database","DevOps","Data Engineering"];

export default function Profile() {
  const { user, loginUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || "", preferences: user?.preferences || [] });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePref = (pref) => {
    setForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref) ? prev.preferences.filter(p=>p!==pref) : [...prev.preferences, pref]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg("");
    try {
      const res = await updateMe(form);
      loginUser(localStorage.getItem("token"), { ...user, ...res.data });
      setMsg("Profile updated successfully!");
    } catch (err) { setMsg(err.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{maxWidth:"600px"}}>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account and agent preferences</p>
      </div>

      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",fontSize:"0.85rem"}}>
          <div><div style={{color:"var(--muted)",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",marginBottom:"0.25rem"}}>Email</div><div>{user?.email}</div></div>
          <div><div style={{color:"var(--muted)",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",marginBottom:"0.25rem"}}>Role</div><span className={`badge ${user?.role==="admin"?"badge-amber":"badge-accent"}`}>{user?.role}</span></div>
          <div><div style={{color:"var(--muted)",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",marginBottom:"0.25rem"}}>User ID</div><div className="mono" style={{fontSize:"0.75rem",color:"var(--muted)"}}>{user?._id}</div></div>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:"1.5rem",fontSize:"0.9rem",fontWeight:700}}>Update Profile</h3>
        {msg && <div className={`alert ${msg.includes("success")?"alert-success":"alert-error"}`}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label">Category Preferences (influences RL agent)</label>
            <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginTop:"0.25rem"}}>
              {ALL_PREFS.map(pref => (
                <button key={pref} type="button"
                  onClick={()=>togglePref(pref)}
                  className={`btn btn-sm ${form.preferences.includes(pref)?"btn-primary":"btn-secondary"}`}>
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Saving...":"Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}
