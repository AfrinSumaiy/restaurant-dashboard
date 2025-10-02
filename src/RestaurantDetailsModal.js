import React, { useState, useMemo } from "react";

const RestaurantDetailsModal = ({ restaurant, orders, onClose }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    amountRange: { min: "", max: "" },
    sortBy: "date_desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  const safeRestaurant = useMemo(() => {
    return (
      restaurant || {
        id: 0,
        name: "Unknown Restaurant",
        location: "N/A",
        cuisine: "N/A",
      }
    );
  }, [restaurant]);

  const restaurantOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }

    let filtered = orders.filter((order) => {
      if (!order || typeof order.restaurant_id === "undefined") {
        return false;
      }
      return order.restaurant_id === safeRestaurant.id;
    });

    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter((order) => {
        if (!order.order_time) return false;
        return new Date(order.order_time) >= startDate;
      });
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end + "T23:59:59");
      filtered = filtered.filter((order) => {
        if (!order.order_time) return false;
        return new Date(order.order_time) <= endDate;
      });
    }

    if (filters.amountRange.min) {
      const minAmount = parseFloat(filters.amountRange.min);
      filtered = filtered.filter((order) => {
        if (typeof order.order_amount === "undefined") return false;
        return order.order_amount >= minAmount;
      });
    }
    if (filters.amountRange.max) {
      const maxAmount = parseFloat(filters.amountRange.max);
      filtered = filtered.filter((order) => {
        if (typeof order.order_amount === "undefined") return false;
        return order.order_amount <= maxAmount;
      });
    }

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_asc":
          return new Date(a.order_time || 0) - new Date(b.order_time || 0);
        case "date_desc":
          return new Date(b.order_time || 0) - new Date(a.order_time || 0);
        case "amount_asc":
          return (a.order_amount || 0) - (b.order_amount || 0);
        case "amount_desc":
          return (b.order_amount || 0) - (a.order_amount || 0);
        default:
          return new Date(b.order_time || 0) - new Date(a.order_time || 0);
      }
    });

    return filtered;
  }, [orders, safeRestaurant.id, filters]);

  const resetFilters = () => {
    setFilters({
      dateRange: { start: "", end: "" },
      amountRange: { min: "", max: "" },
      sortBy: "date_desc",
    });
  };

  const totalRevenue = restaurantOrders.reduce(
    (sum, order) => sum + (order.order_amount || 0),
    0
  );
  const averageOrderValue =
    restaurantOrders.length > 0 ? totalRevenue / restaurantOrders.length : 0;

  const minOrder =
    restaurantOrders.length > 0
      ? Math.min(...restaurantOrders.map((order) => order.order_amount || 0))
      : 0;
  const maxOrder =
    restaurantOrders.length > 0
      ? Math.max(...restaurantOrders.map((order) => order.order_amount || 0))
      : 0;

  const firstOrderDate =
    restaurantOrders.length > 0
      ? new Date(
          Math.min(
            ...restaurantOrders.map((order) => new Date(order.order_time || 0))
          )
        )
      : new Date();
  const lastOrderDate =
    restaurantOrders.length > 0
      ? new Date(
          Math.max(
            ...restaurantOrders.map((order) => new Date(order.order_time || 0))
          )
        )
      : new Date();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2 className="modal-title">{safeRestaurant.name}</h2>
              <p className="modal-subtitle">Order Details & Analytics</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{safeRestaurant.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cuisine Type</span>
                <span className="info-value">{safeRestaurant.cuisine}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Orders</span>
                <span className="info-value highlight">
                  {restaurantOrders.length}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Revenue</span>
                <span className="info-value highlight">
                  ₹{totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Avg Order Value</span>
                <span className="info-value highlight">
                  ₹{averageOrderValue.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="orders-section">
              <div className="section-header">
                <h3 className="section-title">
                  Order History ({restaurantOrders.length} orders)
                </h3>
                <button
                  className="filters-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? "▲ Hide Filters" : "▼ Show Filters"}
                </button>
                {/* </div> */}
              </div>
              <div className="section-header">
                {showFilters && (
                  <div className="filters-section">
                    <h4 className="filters-title">Filter & Sort Orders</h4>
                    <div className="filters-row">
                      <div className="filter-group">
                        <label className="filter-label">Start Date</label>
                        <input
                          type="date"
                          className="filter-input"
                          value={filters.dateRange.start}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                start: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">End Date</label>
                        <input
                          type="date"
                          className="filter-input"
                          value={filters.dateRange.end}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              dateRange: {
                                ...prev.dateRange,
                                end: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Min Amount (₹)</label>
                        <input
                          type="number"
                          className="filter-input"
                          placeholder="0"
                          value={filters.amountRange.min}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              amountRange: {
                                ...prev.amountRange,
                                min: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Max Amount (₹)</label>
                        <input
                          type="number"
                          className="filter-input"
                          placeholder="10000"
                          value={filters.amountRange.max}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              amountRange: {
                                ...prev.amountRange,
                                max: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-label">Sort By</label>
                        <select
                          className="filter-select"
                          value={filters.sortBy}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              sortBy: e.target.value,
                            }))
                          }
                        >
                          <option value="date_desc">Date (Newest First)</option>
                          <option value="date_asc">Date (Oldest First)</option>
                          <option value="amount_desc">
                            Amount (High to Low)
                          </option>
                          <option value="amount_asc">
                            Amount (Low to High)
                          </option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <button className="reset-btn" onClick={resetFilters}>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Table */}
              <div className="table-container">
                {restaurantOrders.length > 0 ? (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th className="table-header">Order ID</th>
                        <th className="table-header">Date & Time</th>
                        <th className="table-header amount-header">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurantOrders.map((order, index) => (
                        <tr
                          key={order.id || order.order_id || index}
                          className="table-row"
                        >
                          <td className="table-cell order-id">
                            #{order.id || order.order_id || "N/A"}
                          </td>
                          <td className="table-cell">
                            {order.order_time ? (
                              <>
                                {new Date(order.order_time).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                                <br />
                                <span className="time-text">
                                  {new Date(
                                    order.order_time
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </span>
                              </>
                            ) : (
                              "Date not available"
                            )}
                          </td>
                          <td className="table-cell order-id">
                            ₹{(order.order_amount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No orders found for this restaurant.</p>
                    {filters.dateRange.start ||
                    filters.dateRange.end ||
                    filters.amountRange.min ||
                    filters.amountRange.max ? (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          marginTop: "8px",
                          color: "#6c757d",
                        }}
                      >
                        Try adjusting your filters or click "Reset"
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Order Statistics */}
            {restaurantOrders.length > 0 && (
              <div className="stats-section">
                <h3 className="section-title">Order Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">₹{minOrder.toFixed(2)}</div>
                    <div className="stat-label">Minimum Order</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">₹{maxOrder.toFixed(2)}</div>
                    <div className="stat-label">Maximum Order</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {firstOrderDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="stat-label">First Order</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {lastOrderDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="stat-label">Last Order</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 1000px;
          max-width: 98%;
          max-height: 98%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid #e9ecef;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          flex-shrink: 0;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: white;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0;
          color: white;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          padding: 20px 24px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .info-label {
          font-size: 0.75rem;
          color: #6c757d;
          font-weight: 500;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
        }

        .info-value.highlight {
          color: #28a745;
          font-size: 0.9rem;
        }

        .orders-section {
          padding: 0;
        }

        .section-header {
          padding: 5px 24px 0;
        }

        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .filters-toggle-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background 0.2s;
          font-weight: 500;
        }

        .filters-toggle-btn:hover {
          background: #5a6268;
        }

        .filters-section {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .filters-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 16px 0;
        }

        .filters-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          min-width: 120px;
          flex: 1;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #495057;
          margin-bottom: 6px;
          white-space: nowrap;
        }

        .filter-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.8rem;
          background: white;
          width: 100%;
          box-sizing: border-box;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .reset-btn {
          padding: 8px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
          font-weight: 500;
          height: 34px;
          white-space: nowrap;
        }

        .reset-btn:hover {
          background: #c82333;
        }

        .table-container {
          padding: 0 24px 20px;
          max-height: 400px;
          overflow-y: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .table-header {
          padding: 12px;
          text-align: left;
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
        }

        .amount-header {
          text-align: right;
        }

        .table-row {
          border-bottom: 1px solid #e9ecef;
          transition: background 0.15s;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .table-cell {
          padding: 12px;
          color: #495057;
        }

        .order-id {
          font-weight: 500;
          color: #667eea;
        }

        .time-text {
          font-size: 0.7rem;
          color: #6c757d;
        }

        .amount-cell {
          text-align: right;
          font-weight: 600;
          color: #28a745;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .stats-section {
          padding: 20px 24px;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 0.7rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Custom Scrollbar Styling */
        .modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        .table-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .table-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .filters-row {
            gap: 12px;
          }

          .filter-group {
            min-width: 100px;
          }
        }

        @media (max-width: 768px) {
          .filters-row {
            flex-direction: column;
            gap: 12px;
          }

          .filter-group {
            min-width: 100%;
            width: 100%;
          }

          .reset-btn {
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetailsModal;
