import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/CarAccessories",
});

// Add Authorization header with Bearer token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");  // Consistent key: "token"
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==============================
// AUTH
// ==============================

export const registerUser = (userData) => api.post("/auth/register", userData);

export const loginUser = (credentials) =>
    api.post("/auth/login", {
        username: credentials.username || credentials.email,
        password: credentials.password,
    });

export const getLoggedUser = () => api.get("/auth/me");
export const createUser = (userData) => api.post("/api/users/create", userData);
export const getAllUsers = () => api.get("/api/users/all");
// ==============================
// BUYER
// ==============================

export const getBuyerByEmail = (email) => api.get(`/buyer/read/${email}`);

// ==============================
// PRODUCT
// ==============================

export const getProducts = () => api.get("/product/all");
export const getProductById = (productId) => api.get(`/product/${productId}`);
export const deleteProduct = (productId) => api.delete(`/product/${productId}`);

// Decrease stock on purchase
export const purchaseProduct = (productId, quantity) =>
    api.post(`/product/purchase/${productId}?quantity=${quantity}`);

// ==============================
// CART
// ==============================

export const createCart = (cartData) => api.post("/cart/checkout", cartData);
export const updateCart = (cartData) => api.post("/cart/update", cartData); // ✅ NEW
export const updateCartItem = (cartId, cartItemId, data) =>
    api.put(`/cart/${cartId}/items/${cartItemId}`, data);
export const deleteCartItem = (cartId, cartItemId) =>
    api.delete(`/cart/${cartId}/items/${cartItemId}`);
export const getCart = (buyerId) => api.get(`/cart/by-buyer/${buyerId}`);

// ==============================
// ORDER
// ==============================

export const getAllOrders = () => api.get("/order/all");
export const getOrdersByBuyerId = (buyerId) => api.get(`/order/buyer/${buyerId}`);
export const createOrder = (orderData) => api.post("/order/create", orderData);
export const getOrderById = (orderId) => api.get(`/order/${orderId}`);

// ==============================
// CART ITEM
// ==============================

export const getCartItemsByCartId = (cartId) => api.get(`/cart-item/cart/${cartId}`);

// ==============================
// PAYMENT
// ==============================

export const createPayment = (paymentData) => api.post("/payment/create", paymentData);

// ==============================
// EXPORT AXIOS INSTANCE
// ==============================

export default api;