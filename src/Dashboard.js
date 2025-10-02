import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import RestaurantDetailsModal from "./RestaurantDetailsModal";

const useApiData = (endpoint) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost/restaurant-dashboard/api/${endpoint}.php`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
};

export default function Dashboard() {
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({
    amountRange: { min: "", max: "" },
    hourRange: { start: "", end: "" },
  });
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedRestaurantDetails, setSelectedRestaurantDetails] =
    useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: restaurants } = useApiData("restaurants");
  const { data: orders, loading: ordersLoading } = useApiData("orders");
  const { data: top3 } = useApiData("top3");

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    window.location.reload();
  };

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    if (restaurantSearch) {
      const searchLower = restaurantSearch.toLowerCase();
      filtered = filtered.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchLower)
      );
    }

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [restaurants, restaurantSearch, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const filteredOrders = useMemo(() => {
    if (!orders.length) return [];

    return orders.filter((order) => {
      const orderDate = new Date(order.order_time);
      const orderHour = orderDate.getHours();
      const orderAmount = order.order_amount;

      const afterStart = dateRange.startDate
        ? orderDate >= new Date(dateRange.startDate)
        : true;
      const beforeEnd = dateRange.endDate
        ? orderDate <= new Date(dateRange.endDate + "T23:59:59")
        : true;

      const matchRestaurant = selectedRestaurant
        ? order.restaurant_id === parseInt(selectedRestaurant)
        : true;

      const amountMin = filters.amountRange.min
        ? parseFloat(filters.amountRange.min)
        : 0;
      const amountMax = filters.amountRange.max
        ? parseFloat(filters.amountRange.max)
        : Infinity;
      const matchAmount = orderAmount >= amountMin && orderAmount <= amountMax;

      const hourStart = filters.hourRange.start
        ? parseInt(filters.hourRange.start)
        : 0;
      const hourEnd = filters.hourRange.end
        ? parseInt(filters.hourRange.end)
        : 23;
      const matchHour = orderHour >= hourStart && orderHour <= hourEnd;

      return (
        afterStart && beforeEnd && matchRestaurant && matchAmount && matchHour
      );
    });
  }, [orders, selectedRestaurant, dateRange, filters]);

  const analytics = useMemo(() => {
    if (!filteredOrders.length) {
      return {
        dailyOrders: [],
        dailyRevenue: [],
        averageOrderValue: 0,
        peakHourData: [],
        totalRevenue: 0,
        totalOrders: 0,
      };
    }

    const dailyOrders = {};
    const dailyRevenue = {};
    const hourlyCounts = {};

    filteredOrders.forEach((order) => {
      const date = order.order_time.split("T")[0];
      const hour = new Date(order.order_time).getHours();

      dailyOrders[date] = (dailyOrders[date] || 0) + 1;

      dailyRevenue[date] = (dailyRevenue[date] || 0) + order.order_amount;

      if (!hourlyCounts[date]) hourlyCounts[date] = {};
      hourlyCounts[date][hour] = (hourlyCounts[date][hour] || 0) + 1;
    });

    const dailyOrdersArray = Object.entries(dailyOrders).map(
      ([date, count]) => ({
        date,
        orders: count,
      })
    );

    const dailyRevenueArray = Object.entries(dailyRevenue).map(
      ([date, revenue]) => ({
        date,
        revenue: Math.round(revenue * 100) / 100,
      })
    );

    const peakHourData = Object.entries(hourlyCounts).map(([date, hours]) => {
      const peakHour = Object.entries(hours).reduce(
        (max, [hour, count]) => (count > max.count ? { hour, count } : max),
        { hour: 0, count: 0 }
      );
      return { date, peakHour: peakHour.hour, orders: peakHour.count };
    });

    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.order_amount,
      0
    );
    const averageOrderValue = totalRevenue / filteredOrders.length;

    return {
      dailyOrders: dailyOrdersArray,
      dailyRevenue: dailyRevenueArray,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      peakHourData,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: filteredOrders.length,
    };
  }, [filteredOrders]);

  const COLORS = ["#667eea", "#f093fb", "#4facfe", "#FFBB28", "#FF8042"];

  if (ordersLoading) {
    return (
      <div className="loading-container">
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Restaurant Analytics Dashboard</h1>
            <p className="dashboard-subtitle">
              Comprehensive insights and analytics for restaurant performance
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            title="Refresh Data"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="filters-card">
        <h3 className="section-title">Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Restaurant</label>
            <select
              className="filter-select"
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              <option value="">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Start Date</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">End Date</label>
            <input
              type="date"
              className="filter-input"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
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
                  amountRange: { ...prev.amountRange, min: e.target.value },
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
                  amountRange: { ...prev.amountRange, max: e.target.value },
                }))
              }
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Start Hour (0-23)</label>
            <input
              type="number"
              className="filter-input"
              placeholder="0"
              min="0"
              max="23"
              value={filters.hourRange.start}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  hourRange: { ...prev.hourRange, start: e.target.value },
                }))
              }
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">End Hour (0-23)</label>
            <input
              type="number"
              className="filter-input"
              placeholder="23"
              min="0"
              max="23"
              value={filters.hourRange.end}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  hourRange: { ...prev.hourRange, end: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card total-orders">
          <div className="summary-content">
            <h3 className="summary-label">Total Orders</h3>
            <div className="summary-value">{analytics.totalOrders}</div>
          </div>
        </div>

        <div className="summary-card total-revenue">
          <div className="summary-content">
            <h3 className="summary-label">Total Revenue</h3>
            <div className="summary-value">₹{analytics.totalRevenue}</div>
          </div>
        </div>

        <div className="summary-card avg-order">
          <div className="summary-content">
            <h3 className="summary-label">Avg Order Value</h3>
            <div className="summary-value">₹{analytics.averageOrderValue}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Daily Orders Count</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis
                dataKey="date"
                fontSize="0.7rem"
                tick={{ fill: "#6c757d" }}
              />
              <YAxis fontSize="0.7rem" tick={{ fill: "#6c757d" }} />
              <Tooltip
                contentStyle={{
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ fill: "#667eea", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
              <XAxis
                dataKey="date"
                fontSize="0.7rem"
                tick={{ fill: "#6c757d" }}
              />
              <YAxis fontSize="0.7rem" tick={{ fill: "#6c757d" }} />
              <Tooltip
                formatter={(value) => [`₹${value}`, "Revenue"]}
                contentStyle={{
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              />
              <Bar dataKey="revenue" fill="#764ba2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Peak Order Hours</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Peak Hour</th>
                  <th className="table-header">Orders</th>
                </tr>
              </thead>
              <tbody>
                {analytics.peakHourData.map((data) => (
                  <tr key={data.date} className="table-row">
                    <td className="table-cell">{data.date}</td>
                    <td className="table-cell">
                      {data.peakHour}:00 - {data.peakHour + 1}:00
                    </td>
                    <td className="table-cell">{data.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top 3 Restaurants</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={top3}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, revenue }) => `${name}: ₹${revenue}`}
                labelStyle={{
                  fontSize: "0.7rem",
                  fontWeight: "500",
                }}
              >
                {top3.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`₹${value}`, "Revenue"]}
                contentStyle={{
                  fontSize: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="restaurants-card">
        <div className="section-header">
          <h3 className="section-title">
            Restaurants List ({filteredRestaurants.length})
          </h3>
          <input
            type="text"
            className="search-input"
            placeholder="Search restaurants by name..."
            value={restaurantSearch}
            onChange={(e) => setRestaurantSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th
                  className="table-header sortable"
                  onClick={() => handleSort("id")}
                >
                  ID{" "}
                  {sortConfig.key === "id" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="table-header sortable"
                  onClick={() => handleSort("name")}
                >
                  Restaurant Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="table-header sortable"
                  onClick={() => handleSort("location")}
                >
                  Location{" "}
                  {sortConfig.key === "location" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="table-header sortable"
                  onClick={() => handleSort("cuisine")}
                >
                  Cuisine{" "}
                  {sortConfig.key === "cuisine" &&
                    (sortConfig.direction === "asc" ? "↑" : "↓")}
                </th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant) => (
                <tr
                  key={restaurant.id}
                  className={`table-row ${
                    selectedRestaurant === restaurant.id.toString()
                      ? "selected"
                      : ""
                  }`}
                >
                  <td className="table-cell">{restaurant.id}</td>
                  <td className="table-cell name-cell">{restaurant.name}</td>
                  <td className="table-cell">{restaurant.location}</td>
                  <td className="table-cell">{restaurant.cuisine}</td>
                  <td className="table-cell">
                    <button
                      className="view-btn"
                      onClick={() => setSelectedRestaurantDetails(restaurant)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRestaurants.length === 0 && (
            <div className="empty-state">
              <p>No restaurants found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {selectedRestaurantDetails && (
        <RestaurantDetailsModal
          restaurant={selectedRestaurantDetails}
          orders={orders}
          onClose={() => setSelectedRestaurantDetails(null)}
        />
      )}

      <style jsx>{`
        .dashboard-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: white;
        }

        .dashboard-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0;
          color: white;
        }

        .refresh-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          font-weight: 500;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .refresh-btn:active {
          transform: translateY(0);
        }

        .filters-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 16px 0;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #495057;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.8rem;
          background: white;
          transition: border-color 0.2s;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .summary-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .total-orders::before {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .total-revenue::before {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .avg-order::before {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .summary-content {
          text-align: center;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #6c757d;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 16px 0;
        }

        .restaurants-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 40px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.8rem;
          width: 300px;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .table-container {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e9ecef;
          border-radius: 6px;
        }

        .data-table {
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

        .table-header.sortable {
          cursor: pointer;
          transition: background 0.2s;
        }

        .table-header.sortable:hover {
          background: #e9ecef;
        }

        .table-row {
          border-bottom: 1px solid #e9ecef;
          transition: background 0.15s;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .table-row.selected {
          background: #f0f8ff;
        }

        .table-cell {
          padding: 12px;
          color: #495057;
        }

        .name-cell {
          font-weight: 500;
          color: #2c3e50;
        }

        .view-btn {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: background 0.2s;
        }

        .view-btn:hover {
          background: #0056b3;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          font-size: 0.875rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 50vh;
          font-size: 1rem;
          color: #6c757d;
        }

        /* Custom Scrollbar */
        .table-container::-webkit-scrollbar {
          width: 6px;
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
      `}</style>
    </div>
  );
}
