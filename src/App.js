// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CartPage from "./pages/CartPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

function AppContent() {
    const {
        user,
        isAdmin,
        isAuthenticated,
        logout,
        setUser,
        loading: authLoading
    } = useAuth();

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Listen for custom events to open the Register modal
    useEffect(() => {
        const handleOpenRegister = () => {
            setShowLogin(false);
            setShowRegister(true);
        };
        window.addEventListener("open-register", handleOpenRegister);
        return () => window.removeEventListener("open-register", handleOpenRegister);
    }, []);

    // Listen for custom events to open the Login modal
    useEffect(() => {
        const handleOpenLogin = () => {
            setShowRegister(false);
            setShowLogin(true);
        };
        window.addEventListener("open-login", handleOpenLogin);
        return () => window.removeEventListener("open-login", handleOpenLogin);
    }, []);

    const navigate = useNavigate();

    // ✅ Modified logout to redirect to /shop after logging out
    const handleLogout = () => {
        logout();
        navigate("/shop");
    };

    return (
        <>
            <Navbar
                isLoggedIn={isAuthenticated()}
                onLoginClick={() => setShowLogin(true)}
                onLogoutClick={handleLogout} // ✅ updated here
            />

            <Routes>
                <Route path="/" element={<Navigate to="/shop" />} />

                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={isAuthenticated() ? <Checkout /> : <Navigate to="/login" />} />
                <Route path="/orders" element={<Orders />} />

                <Route
                    path="/admin"
                    element={
                        authLoading ? (<div style={{padding:20,textAlign:'center'}}>Loading...</div>) : (isAdmin() ? <AdminDashboard /> : <Navigate to="/shop" />)
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login
                            onLogin={(loggedInUser) => {
                                setUser(loggedInUser);
                                if (loggedInUser.role?.toUpperCase() === "ADMIN") {
                                    navigate("/admin");
                                } else {
                                    navigate("/shop");
                                }
                                setShowLogin(false);
                            }}
                            onClose={() => setShowLogin(false)}
                        />
                    }
                />
                <Route
                    path="/register"
                    element={<Register onClose={() => setShowRegister(false)} />}
                />

                <Route
                    path="/payment"
                    element={isAuthenticated() ? <PaymentPage /> : <Navigate to="/login" />}
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/shop" />} />
            </Routes>

            {showLogin && (
                <Login
                    onLogin={(loggedInUser) => {
                        setUser(loggedInUser);
                        if (loggedInUser.role?.toUpperCase() === "ADMIN") {
                            navigate("/admin");
                        } else {
                            navigate("/shop");
                        }
                        setShowLogin(false);
                    }}
                    onClose={() => setShowLogin(false)}
                />
            )}

            {showRegister && <Register onClose={() => setShowRegister(false)} />}
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

