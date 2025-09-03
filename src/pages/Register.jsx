import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/Api";

export default function Register({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    role: "USER",
    adminCode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, password, role, address, phoneNumber, adminCode } = formData;

    if (!name || !email || !password || !role || !address || !phoneNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "ADMIN" && !adminCode) {
      setError("Admin code is required for ADMIN role.");
      return;
    }

    try {
      await registerUser(formData);
      alert("Registration successful! Please login.");
      onClose?.();
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("User already exists or server error.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.registerBox}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        <h2 style={styles.title}>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            style={styles.input}
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            name="address"
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <input
            style={styles.input}
            name="phoneNumber"      // camelCase here
            type="text"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <select
            style={styles.input}
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="BUYER">Buyer</option>
            <option value="ADMIN">Admin</option>
          </select>

          {formData.role === "ADMIN" && (
            <input
              style={styles.input}
              name="adminCode"       // camelCase here
              type="text"
              placeholder="Admin Code"
              value={formData.adminCode}
              onChange={handleChange}
            />
          )}

          <button style={styles.button} type="submit">Register</button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span
            style={styles.link}
            onClick={() => {
              onClose();
              navigate("/login");
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  registerBox: {
    position: "relative",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
    borderTop: "6px solid #ffcc00",
  },
  title: {
    marginBottom: "20px",
    color: "#000",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#ffcc00",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "0.3s",
  },
  switchText: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#000",
  },
  link: {
    color: "#007BFF",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "12px",
    fontSize: "1.5rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#000",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
};
