import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/CarAccessories",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH
export const registerUser = (userData) => api.post("/auth/register", userData);
export const loginUser = (credentials) =>
  api.post("/auth/login", {
    username: credentials.username || credentials.email,
    password: credentials.password,
  });
export const getBuyerByEmail = (email) => api.get(`/buyer/read/${email}`);
export const getLoggedUser = () => api.get("/auth/me");

// PRODUCT
export const getProducts = () => api.get("/product/all");
export const getProductById = (productId) => api.get(`/product/${productId}`);

// CART
export const createCart = (cartData) => api.post("/cart/checkout", cartData);
export const updateCartItem = (cartId, cartItemId, data) =>
  api.put(`/cart/${cartId}/items/${cartItemId}`, data);
export const deleteCartItem = (cartId, productId) =>
  api.delete(`/cart/${cartId}/items/${productId}`);
export const getCart = (buyerId) => api.get(`/cart/by-buyer/${buyerId}`);

// ORDER
export const getOrdersByBuyerId = (buyerId) => api.get(`/orders/buyer/${buyerId}`);
export const createOrder = (orderData) => api.post("/order/create", orderData);
export const getAllOrders = () => api.get("/order/All");
export const getOrderById = (orderId) => api.get(`/order/${orderId}`);

// PAYMENT
export const createPayment = (paymentData) => api.post("/payment/create", paymentData);

// Default export the axios instance if you want (optional)
export default api;
