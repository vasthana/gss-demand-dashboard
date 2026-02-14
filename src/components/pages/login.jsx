import React, { useState } from "react";
import "../../css/login.css";

const demandOwners = [
  "Neeraj Gupta",
  "Pankaj Kumar Chaudhary",
  "Rajat Jain",
  "Pasunooti Veeralah",
  "Dani Poothokaran",
];

const roles = ["Japan BPS Head", "Director", "Delivery Manager"];

const Login = ({ onLogin }) => {
  const [owner, setOwner] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = () => {
    if (!owner || !role) return;

    onLogin({
      Name: owner,
      Role: role,
      // CSVs will be loaded automatically in Dashboard
    });
  };

  return (
    <div className="login-container">
      <h2>GSS Japan BPS Demand Tracker</h2>

      <div className="login-form-group">
        <label>Demand Owner</label>
        <select value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">Select Demand Owner</option>
          {demandOwners.map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      </div>

      <div className="login-form-group">
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          {roles.map((r, i) => (
            <option key={i}>{r}</option>
          ))}
        </select>
      </div>

      <button className="login-button" onClick={handleLogin}>
        Open Dashboard
      </button>
    </div>
  );
};

export default Login;
