import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "../../config";
import "./style.scss";

const backend_url = config.backend_url

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${backend_url}/dealer/get-orders`);
      const fetchedOrders = response.data.orders || [];
      setOrders(fetchedOrders);

      // Automatically select the topmost order
      if (fetchedOrders.length > 0) {
        setSelectedOrder(fetchedOrders[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = (orderId) => {
    setOrderToDelete(orderId);
    setShowPopup(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      await axios.delete(`${backend_url}/dealer/delete-order/${orderToDelete}`);
      const updatedOrders = orders.filter((order) => order._id !== orderToDelete);
      setOrders(updatedOrders);
      setSelectedOrder(updatedOrders[0] || null);

      setShowPopup(false);
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    }
  };

  const cancelDeleteOrder = () => {
    setShowPopup(false);
    setOrderToDelete(null);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {/*<h2>Orders</h2>*/}
      <div className="orders-container">
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <p>Are you sure you want to delete this order?</p>
              <div className="popup-actions">
                <a className="confirm-button" onClick={confirmDeleteOrder}>
                  Yes
                </a>
                <a className="cancel-button" onClick={cancelDeleteOrder}>
                  No
                </a>
              </div>
            </div>
          </div>
        )}
        <div className="orders-sub">
          {selectedOrder ? (
            <>
              <div className="title">Product List</div>
              {orders
                .filter((order) => order.DealerCode === selectedOrder.DealerCode)
                .map((order) => (
                  <div key={order._id} className="order-box">
                    <div className="order-dets-top">
                      <div className="order-dets-top-left">
                        <p>{order._id}</p>
                        <p>{new Date(order.OrderDate).toLocaleDateString()}</p>
                        <p>
                          {order.Products.length}N | {order.TotalPrice.toLocaleString()} INR
                        </p>
                        <div
                          className={`order-status ${order.OrderStatus.toLowerCase()}`}
                        >
                          {order.OrderStatus.toUpperCase()}
                        </div>
                      </div>
                      <div className="order-dets-top-right">
                        {order.OrderStatus.toUpperCase() === "PENDING" && (
                          <>
                            <a>Edit</a>
                            <a onClick={() => handleDeleteOrder(order._id)}>Delete</a>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="order-dets-bottom">
                      {order.Products.map((product) => (
                        <div key={product._id} className="order-products">
                          <div className="order-products-left">
                            <p className="product-name">
                              {product.Model} | {product.ProductCode}
                            </p>
                            <p className="product-price">
                              {product.Quantity} x {product.Price.toLocaleString()} INR
                            </p>
                          </div>
                          <div className="order-products-right">
                            <p className="order-total">
                              {(product.Quantity * product.Price).toLocaleString()} INR
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </>
          ) : null}
        </div>

        <div className="orders-list">
          <div className="title">Dealers</div>
          {orders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${selectedOrder?._id === order._id ? "selected" : ""}`}
              onClick={() => setSelectedOrder(order)}
            >
              <p>
                <strong>Dealer Code:</strong> {order.DealerCode}
              </p>
              <p>
                <strong>Dealer Name:</strong> {order.DealerName}
              </p>
              <p>
                <strong>Remarks:</strong> {order.Remarks}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Orders;
