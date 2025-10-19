import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllOrders, getOrderById, getProductById } from "../services/Api.js";
import placeholder from "../Images/logo.jpg";

const BASE_URL = "http://localhost:8080/CarAccessories";

function resolveImageFromProduct(product) {
  if (!product) return placeholder;
  const productId = product.productId || product.id;
  if (productId) {
    // ✅ Always use your backend endpoint for images
    return `${BASE_URL}/product/image/${productId}`;
  }

  // fallback for unexpected shapes
  const raw = product.imageURL || product.imageUrl || product.image || product.imagePath || "";
  if (!raw) return placeholder;
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("/")) return `${BASE_URL}${raw}`;
  return `${BASE_URL}/uploads/images/${raw}`;
}

function getProductFromItem(item) {
  if (!item) return null;
  if (item.product && typeof item.product === "object") return item.product;
  if (item.productDetail && typeof item.productDetail === "object") return item.productDetail;
  if (item.productId && typeof item.productId === "object" && (item.productId.product || item.productId.name)) return item.productId;
  return null;
}

export default function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchOrders = async () => {
      try {
        const newOrder = location.state?.orderData;
        const user = JSON.parse(localStorage.getItem("user"));
        const buyerId = user?.userId;

        let fetchedOrders = [];

        if (newOrder) {
          try {
            const fullOrder = await getOrderById(newOrder.orderId || newOrder.id);
            fetchedOrders = [fullOrder.data];
          } catch {
            fetchedOrders = [newOrder];
          }
        } else if (buyerId) {
          const response = await import("../services/Api.js").then((m) => m.getOrdersByBuyerId(buyerId));
          fetchedOrders = response.data || [];
        } else {
          setError("No logged-in user. Please log in to view your orders.");
          return;
        }

        const ordersWithProducts = await Promise.all(
          fetchedOrders.map(async (order) => {
            const items = order.orderDetails || order.orderItems || order.items || [];
            const detailedItems = await Promise.all(
              items.map(async (item) => {
                const productId =
                  item.productId ||
                  item.product?.productId ||
                  item.product?.id ||
                  item.productId?.productId ||
                  item.productId?.id;

                if (item.product && (item.product.name || item.product.productId || item.product.id))
                  return item;

                if (!productId) return item;
                try {
                  const productResponse = await getProductById(productId);
                  return { ...item, product: productResponse.data };
                } catch (err) {
                  console.warn("Could not fetch product for order item", productId, err);
                  return item;
                }
              })
            );
            return { ...order, orderDetails: detailedItems };
          })
        );

        setOrders(ordersWithProducts);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    intervalId = setInterval(fetchOrders, 5000);

    const handleOrderCreated = (e) => {
      const created = e?.detail || (e?.detail === undefined ? e : null);
      if (created) {
        setOrders((prev) => [created, ...prev.filter((o) => (o.orderId || o.id) !== (created.orderId || created.id))]);
      }
    };
    window.addEventListener("order-created", handleOrderCreated);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("order-created", handleOrderCreated);
    };
  }, [location.state]);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;
  if (!orders.length) return <p>No orders found.</p>;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? dateStr : date.toLocaleString();
  };

  return (
    <div className="orders-container">
      <h2 className="orders-title">My Orders</h2>
      <div className="orders-body">
        <div className="orders-inner">
          {orders.map((order) => (
            <div key={order.orderId || order.id} className="order-card">
              <div className="order-header">
                <p>{formatDate(order.orderDate)}</p>
                <p>Order NO. {order.orderNumber || order.orderId || order.id}</p>
                {order.returnableUntil && <p>Returnable time: before {formatDate(order.returnableUntil)}</p>}
              </div>

              <div className="order-row">
                <div className="order-left">
                  {order.orderDetails && order.orderDetails.length > 0 && (
                    <div className="order-items">
                      {order.orderDetails.map((item, index) => {
                        const product = getProductFromItem(item) || item.product || null;
                        const productName = product?.name || item.productName || item.name || "Product";
                        const imageSrc = resolveImageFromProduct(product);
                        return (
                          <div key={index} className="order-item">
                            {(product?.shopName || item.shopName) && (
                              <div className="item-shop">{product?.shopName || item.shopName}</div>
                            )}
                            <div className="item-image">
                              <img src={imageSrc} alt={productName} />
                              <div className="item-meta">
                                <p className="item-name">{productName}</p>
                                <p className="item-qty">
                                  {item.quantity || 1} item{(item.quantity || 1) > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="order-separator" aria-hidden></div>

                <div className="order-right">
                  <div className="order-price">R{order.payment?.amount || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        html, body, #root {
                    height: 100%;
                    margin: 0;
                    background-color: #f0f0f0; /* full-page grey background */
                }
        .orders-container {
          font-family: Arial, sans-serif;
          padding: 20px;
          min-height: 100vh;
          background: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .orders-title {
          text-align: center;
          margin-bottom: 12px;
          font-size: 1.8rem;
          font-weight: bold;
          width: 100%;
          max-width: 980px;
          color: grey;
        }
        .orders-body {
          width: 100%;
          max-width: 980px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
        }
        .orders-inner {
          width: 100%;
        }
        .order-card {
          background: #f0f0f0;
          border-radius: 8px;
          padding: 12px;
          margin: 12px auto 20px auto;
          border: 1px solid #cac9c9ff;
          max-width: 980px;
        }
        .order-header {
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #333;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .order-header p {
          margin: 2px 0;
        }
        .order-row {
          display: flex;
          gap: 16px;
          align-items: stretch;
        }
        .order-left {
          flex: 1;
        }
        .order-separator {
          width: 1px;
          background: #e6e6e6;
          border-radius: 1px;
        }
        .order-right {
          width: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .order-price {
          font-size: 1.1rem;
          font-weight: 400;
          color: #111;
        }
        .order-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .order-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border: 1px solid #e6e6e6;
          border-radius: 6px;
          background: #f0f0f0;
        }
        .item-shop {
          width: 140px;
          font-weight: 600;
          font-size: 0.95rem;
          color: #222;
        }
        .item-image {
        background: #f0f0f0;
          display: flex;
          flex-direction: row;
          align-items: center;
          text-align: left;
          flex: 1;
          gap: 12px;
          color: grey;
        }
        .item-image img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 4px;
        }
        .item-meta {
          display: flex;
          flex-direction: column;
        }
        .item-name {
          margin: 0;
          font-size: 0.95rem;
          color: #333;
        }
        .item-qty {
          margin: 0;
          font-size: 0.85rem;
          color: #666;
        }
        @media (max-width: 800px) {
          .order-row {
            flex-direction: column;
          }
          .order-separator {
            display: none;
          }
          .order-right {
            width: 100%;
          }
          .order-item {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
}



