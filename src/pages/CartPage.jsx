import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CartPage({ onClose }) {
  const {
    cartItems = [],
    removeFromCart,
    updateQuantity,
    clearCart,
    userId,
    cartId,
    setCartId,
  } = useCart();

    const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getLocalUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.userId || user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (isAdmin?.()) {
      alert("Admins are not allowed to perform checkout.");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    console.log("Cart items:", cartItems);
  }, [cartItems]);

  const handleQuantityChange = (productId, quantity) => {
    let qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    updateQuantity(productId, qty);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async () => {
    if (isAdmin?.()) {
      alert("Admins are not allowed to checkout.");
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    const localUserId = getLocalUserId();
    if (!localUserId) {
      alert("You must be logged in to checkout.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      clearCart();
      if (onClose) onClose();
      navigate("/payment", {
        state: { cartItems, total: cartTotal },
      });
    } catch (error) {
      alert("Checkout failed: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <div className="cart-box">
          {cartItems.map((item) => (
            <div key={item.productId || item.id} className="cart-item-card">
              <div className="cart-item-left">
                <img
                  src={`http://localhost:8080/CarAccessories/product/image/${
                    item.productId || item.id
                  }`}
                  alt={item.name}
                  className="cart-item-image"
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>R {item.price?.toFixed(2)}</p>
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    className="quantity-input"
                    onChange={(e) =>
                      handleQuantityChange(item.productId || item.id, e.target.value)
                    }
                  />
                  <p className="item-total">
                    R {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.productId || item.id)}
                title="Remove item"
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <h2 className="cart-total">Total: R {cartTotal.toFixed(2)}</h2>

          <div className="checkout-section">
            <p className="delivery-info">
              Order will be delivered in 3–5 working days.
            </p>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          background-color: #f0f0f0;
        }
        .cart-container {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f0f0f0;
          min-height: calc(100vh - 84px);
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .empty-cart {
          text-align: center;
          font-size: 18px;
          color: #555;
          padding: 40px;
        }
        .cart-box {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .cart-item-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 10px;
          background: #fff;
        }
        .cart-item-left {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }
        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }
        .cart-item-info h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }
        .cart-item-info p {
          margin: 2px 0;
          font-size: 14px;
        }
        .quantity-input {
          width: 50px;
          padding: 4px;
          border-radius: 4px;
          border: 1px solid #ccc;
          margin-top: 5px;
        }
        .item-total {
          font-weight: 600;
          margin-top: 5px;
          color: #242424ff;
        }
        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #09c;
          margin-top: 10px;
        }
        .cart-total {
          margin-top: 20px;
          font-weight: 700;
          text-align: right;
        }
        .checkout-section {
          margin-top: 20px;
          text-align: center;
        }
        .delivery-info {
          margin-bottom: 10px;
          color: #666;
          font-size: 14px;
        }
        .checkout-btn {
          background-color: #09c;
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 16px;
        }
        .checkout-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }
        .checkout-btn:hover:not(:disabled) {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
}

