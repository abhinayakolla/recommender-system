import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import { useAuth } from "../store/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your RL agent session</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@mtech.edu" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          <button className="btn btn-primary" style={{width:"100%",marginTop:"0.5rem"}} disabled={loading}>{loading?"Signing in...":"Sign In"}</button>
        </form>
        <p style={{marginTop:"1.5rem",fontSize:"0.85rem",color:"var(--muted)",textAlign:"center"}}>
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </p>
        <p style={{marginTop:"0.75rem",fontSize:"0.75rem",color:"var(--muted)",textAlign:"center"}}>Demo: admin@mtech.edu / admin123</p>
      </div>
    </div>
  );
}
