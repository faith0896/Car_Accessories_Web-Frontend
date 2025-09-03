import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/Api.js";

export default function Login({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("BUYER"); // Used for optional UI filtering
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      // ❌ Don't send role to backend — it shouldn't be trusted
      const response = await loginUser({ email, password });

      const userData = response.data;

      // ✅ Use the role returned by the backend only
      const actualRole = userData.role?.toUpperCase();

      if (!actualRole) {
        setError("User role not found. Please contact admin.");
        return;
      }

      if (actualRole !== selectedRole) {
        setError(`You're registered as a ${actualRole}. Please login accordingly.`);
        return;
      }

      onLogin(userData);
      onClose();

      if (actualRole === "ADMIN") {
        navigate("/admin");
      } else if (actualRole === "BUYER") {
        navigate("/");
      } else {
        setError("Unauthorized role.");
      }

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
      <div style={styles.overlay}>
        <div style={styles.loginBox}>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
          <h2 style={styles.title}>Login</h2>
          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
                style={styles.input}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                style={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {/* Optional role selection for UI feedback */}
            <div style={styles.roleContainer}>
              <label style={styles.roleLabel}>
                <input
                    type="radio"
                    name="role"
                    value="BUYER"
                    checked={selectedRole === "BUYER"}
                    onChange={() => setSelectedRole("BUYER")}
                />
                Buyer
              </label>
              <label style={styles.roleLabel}>
                <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={selectedRole === "ADMIN"}
                    onChange={() => setSelectedRole("ADMIN")}
                />
                Admin
              </label>
            </div>

            <button style={styles.button} type="submit">Login</button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{" "}
            <span
                style={styles.registerLink}
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new Event("open-register"));
                }}
            >
            Register
          </span>
          </p>
        </div>
      </div>
  );
}

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  loginBox: { position: "relative", background: "#fff", padding: "30px", borderRadius: "12px", width: "350px", textAlign: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.4)", borderTop: "6px solid #ffcc00" },
  title: { marginBottom: "20px", color: "#000" },
  input: { width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "1rem" },
  roleContainer: { marginBottom: "15px", display: "flex", justifyContent: "space-around" },
  roleLabel: { fontSize: "1rem", cursor: "pointer" },
  button: { width: "100%", padding: "12px", background: "#ffcc00", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", transition: "0.3s" },
  registerLink: { fontSize: "0.9rem", color: "#007BFF", cursor: "pointer" },
  switchText: { marginTop: "15px" },
  error: { color: "red", fontSize: "0.85rem", marginBottom: "1rem" },
  closeBtn: { position: "absolute", top: "10px", right: "12px", fontSize: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "#000" },
};
