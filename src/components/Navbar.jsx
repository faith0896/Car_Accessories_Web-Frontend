import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../Images/logo.jpg";

export default function Navbar({ onLoginClick, isLoggedIn, onLogoutClick }) {
  const [popupMessage, setPopupMessage] = useState("");
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const onAdminDashboard =
    location.pathname === "/admin" || location.pathname.startsWith("/admin/");

  const handleProtectedClick = (e, page) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setPopupMessage(
        `Cannot access ${page.charAt(0).toUpperCase() + page.slice(1)} without signing in, please login.`
      );
    }
  };

  // ✅ Determine which link should be highlighted based on current route
  const getActiveLink = () => {
    if (location.pathname.startsWith("/cart")) return "cart";
    if (location.pathname.startsWith("/orders")) return "orders";
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/login")) return "login";
    if (location.pathname.startsWith("/register")) return "register";
    return "shop";
  };

  const activeLink = getActiveLink();

  return (
    <>
      <nav className="navbar">
        <div className="left-section">
          <div className="logo-box">
            <img src={logo} alt="Logo" className="logo-img" />
          </div>
        </div>

        <Link to="/" className="site-name">
          Car Accessories
        </Link>

        <div className="right-links">
          {!(isAdmin() && onAdminDashboard) && (
            <>
              <Link
                to="/shop"
                className={`tooltip-container ${activeLink === "shop" ? "active-page" : ""}`}
              >
                Shop
                
              </Link>

              <Link
                to="/cart"
                onClick={(e) => handleProtectedClick(e, "cart")}
                className={`tooltip-container cart-link ${activeLink === "cart" ? "active-page" : ""}`}
              >
                Cart{" "}
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                
              </Link>

              <Link
                to="/orders"
                onClick={(e) => handleProtectedClick(e, "orders")}
                className={`tooltip-container ${activeLink === "orders" ? "active-page" : ""}`}
              >
                Orders
                
              </Link>

              <div className="nav-divider"></div>
            </>
          )}

          {isLoggedIn ? (
            <span
              onClick={onLogoutClick}
              className={`tooltip-container logout-link ${activeLink === "logout" ? "active-page" : ""}`}
              style={{ cursor: "pointer" }}
            >
              Logout
              
            </span>
          ) : (
            <span
              onClick={onLoginClick}
              className={`tooltip-container login-link ${activeLink === "login" ? "active-page" : ""}`}
              style={{ cursor: "pointer" }}
            >
              Login
              
            </span>
          )}
        </div>
      </nav>

      <nav className="bottom-bar"></nav>

      {popupMessage && (
        <div className="popup-overlay" onClick={() => setPopupMessage("")}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <p>{popupMessage}</p>
            <div className="popup-actions">
              <button className="close-btn" onClick={() => setPopupMessage("")}>
                Close
              </button>
              <button
                className="login-btn"
                onClick={() => {
                  setPopupMessage("");
                  onLoginClick();
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --nav-blue: #09c;
          --nav-blue-dark: #0073aa;
          --nav-height: 84px;
        }

        body {
          margin: 0;
          padding-top: var(--nav-height);
          padding-bottom: var(--nav-height);
        }

        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--nav-height);
          background: var(--nav-blue);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 1000;
        }

        .logo-box {
          width: 200px;
          display: flex;
          align-items: center;
        }

        .logo-img {
          width: 100%;
          object-fit: contain;
        }

        .site-name {
          font-size: 1.8rem;
          font-weight: bold;
          text-decoration: none;
          color: #fff;
          flex-grow: 1;
          text-align: center;
          user-select: none;
        }

        .right-links {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 1rem;
          font-weight: 500;
          position: relative;
        }

        .right-links a, .right-links span {
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          padding: 5px 8px;
          border-radius: 4px;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
        }

        .right-links a:hover, .right-links span:hover {
          color: #e4e4e4;
        }

        /* ✅ Active page highlight: darker blue, no border */
        .active-page {
          background-color: #0073aa;
        }
          
        /* ✅ Active page full background and highlight */
        .active-page {
          background-color: #0073aa;
          position: relative;
          z-index: 2;
        }

        /* ✅ Simple active link highlight only — no overlay blocking clicks */
        .active-page {
          background-color: #0073aa;
          color: #fff;
        }



        .cart-badge {
          background: #d1c4e9;
          color: #333;
          font-size: 12px;
          font-weight: bold;
          border-radius: 50%;
          padding: 2px 6px;
          margin-left: 6px;
          vertical-align: top;
        }

        .tooltip-container {
          position: relative;
          display: inline-block;
        }

        .tooltip-text {
          visibility: hidden;
          opacity: 0;
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          background: #e0e0e0;
          color: #333;
          font-size: 0.8rem;
          padding: 4px 8px;
          border-radius: 6px;
          white-space: nowrap;
          transition: opacity 0.3s;
          pointer-events: none;
          user-select: none;
          z-index: 1500;
        }

        .tooltip-container:hover .tooltip-text {
          visibility: visible;
          opacity: 1;
        }

        .nav-divider {
          height: 28px;
          width: 1px;
          background: #bbb;
          margin: 0 12px;
        }

        .popup-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .popup-box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          max-width: 350px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .popup-box p {
          margin-bottom: 16px;
          font-size: 1rem;
          color: #333;
        }

        .popup-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .close-btn, .login-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .close-btn {
          background: #ddd;
          color: #333;
        }

        .close-btn:hover {
          background: #ccc;
        }

        .login-btn {
          background: #c5cae9;
          color: #fff;
        }

        .login-btn:hover {
          background: #b3bde0;
        }

        .bottom-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          background: #09c;
          z-index: 1000;
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </>
  );
}
