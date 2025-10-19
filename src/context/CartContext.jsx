import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Listen for logout event to clear cart
  useEffect(() => {
    const handleClearCart = () => {
      clearCart();
    };
    window.addEventListener('clear-cart', handleClearCart);
    return () => window.removeEventListener('clear-cart', handleClearCart);
  }, []);
  const { user, token, loading } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartId, setCartId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const savedOrder = localStorage.getItem("lastOrder");
      return savedOrder ? JSON.parse(savedOrder) : null;
    } catch {
      return null;
    }
  });

  // Set userId once auth is ready
  useEffect(() => {
    if (loading) return;

    if (!user || !token) {
      console.log("No logged-in user detected. Skipping cart setup.");
      return;
    }

    const id = user.userId || user.id || user?._id;
    if (id) setUserId(String(id));
    else console.log("Logged-in user has no userId.", user);
  }, [user, token, loading]);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  const keyOf = (p) => p.productId ?? p.id;

  // Add or update cart item
  const addToCart = async (product) => {
    const id = keyOf(product);
    const existing = cartItems.find((item) => keyOf(item) === id);
    let updatedItems;
    if (existing) {
      updatedItems = cartItems.map((it) =>
        keyOf(it) === id ? { ...it, quantity: it.quantity + 1 } : it
      );
    } else {
      updatedItems = [...cartItems, { ...product, quantity: 1 }];
    }
    setCartItems(updatedItems);
  };

  const removeFromCart = async (productId) => {
    const updated = cartItems.filter((item) => keyOf(item) !== productId);
    setCartItems(updated);
  };

  const updateQuantity = async (productId, quantity) => {
    const updated = cartItems.map((it) =>
      keyOf(it) === productId ? { ...it, quantity: Number(quantity) } : it
    );
    setCartItems(updated);
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const saveLastOrder = (order) => {
    setLastOrder(order);
    try {
      localStorage.setItem("lastOrder", JSON.stringify(order));
    } catch {}
  };

  const clearLastOrder = () => {
    setLastOrder(null);
    localStorage.removeItem("lastOrder");
  };

  const cartCount = (cartItems || []).reduce((acc, it) => acc + (it.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        lastOrder,
        saveLastOrder,
        clearLastOrder,
        cartId,
        setCartId,
        userId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

