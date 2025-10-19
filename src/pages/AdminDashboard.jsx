import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api, { getAllUsers, getOrdersByBuyerId, getProducts, getAllOrders } from "../services/Api.js";

function AdminDashboard() {
  const { user, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [users, setUsers] = useState([]);
  // Quick mock fallback used when backend is unavailable so admin UI remains usable
  const MOCK_USERS = [
    { userId: 1, username: 'admin', name: 'Super Admin', email: 'admin@caraccessories.com', role: 'ADMIN' },
    { userId: 2, username: 'jdoe', name: 'John Doe', email: 'jdoe@example.com', role: 'BUYER' },
  ];
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // track selected user for orders

  const BASE_URL = api.defaults.baseURL || "http://localhost:8080/CarAccessories";

  // Redirect non-admins, but wait until auth is restored to avoid logging out on refresh
  useEffect(() => {
    if (loading) return; // still restoring auth from storage

    const token = localStorage.getItem("token");
    // If there is a token we should wait for AuthContext to restore the user;
    // only redirect when there's no token or when the user is present but not admin.
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    if (user && !isAdmin()) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, logout, navigate, loading]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProducts();
    }
  }, [user]);

  // Fetch Orders for a specific user (server-side filtered)
  const fetchOrders = async (userId) => {
    // If no userId requested, fetch all orders instead
    if (!userId) return fetchAllOrders();
    setError("");
    setOrdersLoading(true);
    try {
      const response = await getOrdersByBuyerId(userId);
      // getOrdersByBuyerId returns data in response.data
      setOrders(response.data || []);
      setSelectedUser(userId);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
      // try to load orders from localStorage as a fallback
      const local = localStorage.getItem('orders');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          // filter by userId or buyerId or buyer.userId
          const filtered = (parsed || []).filter(o => {
            return (o.buyer && (o.buyer.userId == userId || o.buyer.userId == String(userId))) || (o.buyerId == userId) || (o.buyerId == String(userId));
          });
          setOrders(filtered);
        } catch (e) {
          console.error('Failed to parse local orders', e);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch all orders (admin)
  const fetchAllOrders = async () => {
    setError("");
    // clear previous orders to avoid displaying stale data while fetching
    setOrders([]);
    setOrdersLoading(true);
    try {
      const resp = await getAllOrders();
      console.log('fetchAllOrders response:', resp && resp.data);
      setOrders(resp.data || []);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error fetching all orders', err);
      // fallback
      try {
        const r = await api.get('/order/all');
        console.log('fetchAllOrders fallback response:', r && r.data);
        setOrders(r.data || []);
        setSelectedUser(null);
      } catch (err2) {
        console.error('Fallback fetch all orders failed', err2);
        // Final fallback: try localStorage
        const local = localStorage.getItem('orders');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setOrders(parsed || []);
            setSelectedUser(null);
            setError('Using orders from localStorage (backend unavailable)');
          } catch (e) {
            console.error('Failed to parse local orders', e);
            setError('Failed to fetch orders');
            setOrders([]);
          }
        } else {
          setError('Failed to fetch orders');
          setOrders([]);
        }
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  // Helper to view orders for a specific user object (handles mock/localStorage orders)
  const handleViewOrders = (userObj) => {
    // If we have orders loaded already, try filtering locally first
    const tryFilterLocal = (ordersList) => {
      return (ordersList || []).filter(o => {
        // match by buyer.userId, buyerId, or buyer.email
        if (o.buyer) {
          if (o.buyer.userId && String(o.buyer.userId) === String(userObj.userId)) return true;
          if (o.buyer.email && userObj.email && o.buyer.email === userObj.email) return true;
        }
        if (o.buyerId && String(o.buyerId) === String(userObj.userId)) return true;
        if (o.buyerEmail && userObj.email && o.buyerEmail === userObj.email) return true;
        return false;
      });
    };

    // Try filtering current state orders
    if (Array.isArray(orders) && orders.length > 0) {
      const filtered = tryFilterLocal(orders);
      setOrders(filtered);
      setSelectedUser(userObj.userId);
      return;
    }

    // Try to fetch from backend by userId
    if (userObj && userObj.userId) {
      fetchOrders(userObj.userId);
      return;
    }

    // As last resort, try localStorage orders
    const local = localStorage.getItem('orders');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const filtered = tryFilterLocal(parsed);
        setOrders(filtered);
        setSelectedUser(userObj.userId);
        setError('Using orders from localStorage');
      } catch (e) {
        console.error('Failed to parse local orders', e);
        setError('Failed to load orders for user');
        setOrders([]);
      }
    } else {
      setError('No orders available for this user');
      setOrders([]);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
  setError("");
  try {
    console.log("🛰 Calling:", api.defaults.baseURL + "/api/users/all");
    const response = await getAllUsers();
    console.log("✅ Response status:", response.status);
    console.log("✅ Response data:", response.data);
    setUsers(response.data || []);
  } catch (err) {
    console.error("❌ Error fetching users:", err);

    if (err.response) {
      console.error("💥 Response status:", err.response.status);
      console.error("💥 Response data:", err.response.data);
    } else {
      console.error("🚫 No response received (network or CORS issue)");
    }

    setError("Failed to fetch users");
    // If backend fails (500) use a safe mock to keep the admin UI functional
    // This is temporary — remove when backend is fixed
    setUsers(MOCK_USERS);
  }
};


  // Fetch Products
  const fetchProducts = async () => {
    setError("");
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Add Product
  const handleAddProduct = async () => {
    if (
      !name ||
      !brand ||
      !category ||
      !size ||
      !material ||
      !price ||
      !stockQuantity ||
      !description ||
      !imageFile
    ) {
      setError("Please fill in all fields including the image.");
      return;
    }

  setProductLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("size", size);
    formData.append("material", material);
    formData.append("price", parseFloat(price));
    formData.append("stockQuantity", parseInt(stockQuantity));
    formData.append("description", description);
    formData.append("file", imageFile);

    try {
      await api.post(`/product/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product added successfully!");
      setName("");
      setBrand("");
      setCategory("");
      setSize("");
      setMaterial("");
      setPrice("");
      setStockQuantity("");
      setDescription("");
      setImageFile(null);
      document.querySelector('input[type="file"]').value = "";
      fetchProducts();
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
        logout();
      } else {
        setError("Failed to add product. Please try again.");
      }
    } finally {
      setProductLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/users/${userId}`);
      alert("User deleted successfully.");
      fetchUsers();
      if (selectedUser === userId) setOrders([]); // clear orders if deleted
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/product/delete/${productId}`);
      alert("Product deleted successfully.");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product.");
    }
  };

  // Styles
  const styles = {
    container: { display: "flex", gap: "2rem", padding: "2rem", color: "#000", fontFamily: 'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    panel: {
      flex: 1,
      backgroundColor: "#f0f0f0",
      padding: "1rem",
      borderRadius: "8px",
      maxHeight: "80vh",
      overflowY: "auto",
    },
    form: {
      marginBottom: "2rem",
      padding: "1rem",
      backgroundColor: "#fafafa",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    input: {
      width: "100%",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      borderRadius: "4px",
      border: "1px solid #ccc",
    },
    button: {
      width: "100%",
      padding: "0.7rem",
      backgroundColor: "#09c",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.5rem",
      padding: "0.5rem",
      backgroundColor: "#fff",
      borderRadius: "4px",
      flexDirection: "column",
    },
    deleteBtn: {
      backgroundColor: "#09c",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "0.4rem 0.8rem",
      cursor: "pointer",
    },
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Admin Dashboard</h1>

      {error && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "1rem",
            margin: "1rem auto",
            maxWidth: "600px",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Add Product Section */}
      <div style={styles.form}>
        <h2>Add New Product</h2>
        <input style={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={styles.input} placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        <input style={styles.input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input style={styles.input} placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} />
        <input style={styles.input} placeholder="Material" value={material} onChange={(e) => setMaterial(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Stock Quantity" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
        <input style={styles.input} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input style={styles.input} type="file" accept="image/*" onChange={handleImageChange} />
        <button style={{ ...styles.button, opacity: productLoading ? 0.7 : 1 }} onClick={handleAddProduct} disabled={productLoading}>
          {productLoading ? "Adding Product..." : "Add Product"}
        </button>
      </div>

      <div style={styles.container}>
        {/* Users Panel */}
        <div style={styles.panel}>
          <h3>Users</h3>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((u) => {
              const isSuperAdmin = (u.name === 'Super Admin' || u.username === 'admin' || u.email === 'admin@caraccessories.com');
              return (
                <div key={u.userId} style={styles.listItem}>
                  <span>{u.username || u.name} ({u.email})</span>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {/* Delete removed intentionally to preserve history */}
                    {!isSuperAdmin && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleViewOrders(u)}
                      >
                        View Orders
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>No users found.</p>
          )}
        </div>

        {/* Products Panel */}
        <div style={styles.panel}>
          <h3>Products</h3>
          {products.map((p) => (
            <div key={p.productId} style={styles.listItem}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <img src={`${BASE_URL}/product/image/${p.productId}`} alt={p.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />
                <span>
                  <strong>{p.name}</strong>
                  <br />
                  <small>Brand: {p.brand}, Category: {p.category}, Stock: {p.stockQuantity}</small>
                </span>
              </div>
              {/* Delete removed intentionally to preserve history */}
            </div>
          ))}
        </div>

        {/* Orders Panel */}
        <div style={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Orders {selectedUser ? `(User ID: ${selectedUser})` : "(Select a user)"}</h3>
          </div>
          {ordersLoading ? (<p>Loading orders...</p>) : Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order) => {
              // Compute total amount: prefer backend totalPrice when available, otherwise sum line items.
              const getOrderItems = (o) => {
                return o.orderDetails || o.items || o.orderItems || [];
              };

              const totalAmount = (() => {
                const backendTotal = Number(order.totalPrice);
                if (!isNaN(backendTotal) && backendTotal > 0) return backendTotal;
                const items = getOrderItems(order);
                if (!items || items.length === 0) return Number(order.totalPrice) || 0;
                return items.reduce((sum, item) => {
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.price) || Number(item.product?.price) || Number(item.unitPrice) || 0;
                  return sum + qty * price;
                }, 0);
              })();

              return (
                <div key={order.orderId || order.id} style={styles.listItem}>
                  <div>
                    <strong>Order NO: {order.orderNumber || order.orderId || order.id}</strong>
                    <br />
                     <small>
                       Date: {order.orderDate ? new Date(order.orderDate).toLocaleString() : "Unknown"}
                     </small>

                    {/* Products list */}
                    {(() => {
                      const items = getOrderItems(order);
                      if (!items || items.length === 0) return null;
                      return (
                        <div style={{ marginTop: "0.5rem" }}>
                          <div style={{ fontWeight: 600 }}>Products:</div>
                          {items.map((item, idx) => {
                            const product = item.product || null;
                            const productName = product?.name || item.productName || item.name || item.title || "Product";
                            const quantity = item.quantity || item.qty || 1;
                            const pricePerItem = item.price || product?.price || item.unitPrice || 0;
                            const lineTotal = quantity * pricePerItem;

                            return (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                                <span>{productName} × {quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                      Total Amount: R{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>{selectedUser ? "No orders found for this user." : "No orders loaded. Click a user to view their orders."}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
