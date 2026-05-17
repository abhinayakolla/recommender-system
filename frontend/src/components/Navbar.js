import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">RL<span>Rec</span> <span style={{color:"var(--muted)",fontWeight:400,fontSize:"0.7rem"}}>M.Tech Project</span></NavLink>
      {user && (
        <div className="nav-links">
          <NavLink to="/dashboard" className={({isActive})=>`nav-link${isActive?" active":""}`}>Dashboard</NavLink>
          <NavLink to="/recommendations" className={({isActive})=>`nav-link${isActive?" active":""}`}>Recommendations</NavLink>
          <NavLink to="/items" className={({isActive})=>`nav-link${isActive?" active":""}`}>Browse</NavLink>
          {user.role === "admin" && <NavLink to="/agents" className={({isActive})=>`nav-link${isActive?" active":""}`}>Agents</NavLink>}
          <NavLink to="/profile" className={({isActive})=>`nav-link${isActive?" active":""}`}>{user.username}</NavLink>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      )}
    </nav>
  );
}
