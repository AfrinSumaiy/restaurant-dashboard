import React, { useState, useEffect, useMemo } from "react";
import RestaurantDetailsModal from "./RestaurantDetailsModal";

// Custom hook for API calls
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

export default function Restaurants() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // API data
  const { data: restaurants, loading: restaurantsLoading } =
    useApiData("restaurants");
  const { data: orders, loading: ordersLoading } = useApiData("orders");

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    let filtered = restaurants;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchLower) ||
          restaurant.location.toLowerCase().includes(searchLower) ||
          restaurant.cuisine.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
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
  }, [restaurants, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCloseModal = () => {
    setSelectedRestaurant(null);
  };

  if (restaurantsLoading || ordersLoading) {
    return (
      <div className="loading-container">
        <div>Loading restaurants data...</div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Restaurants Management</h1>
            <p className="page-subtitle">
              View and manage all restaurant details and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="controls-card">
        <div className="controls-header">
          <h3 className="section-title">
            Restaurants Directory ({filteredRestaurants.length} restaurants)
          </h3>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search restaurants by name, location, or cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="restaurants-card">
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
                <tr key={restaurant.id} className="table-row">
                  <td className="table-cell">{restaurant.id}</td>
                  <td className="table-cell name-cell">{restaurant.name}</td>
                  <td className="table-cell">{restaurant.location}</td>
                  <td className="table-cell">{restaurant.cuisine}</td>
                  <td className="table-cell">
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(restaurant)}
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

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <RestaurantDetailsModal
          restaurant={selectedRestaurant}
          orders={orders}
          onClose={handleCloseModal}
        />
      )}

      <style jsx>{`
        .restaurants-page {
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
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

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: white;
        }

        .page-subtitle {
          font-size: 0.875rem;
          opacity: 0.9;
          margin: 0;
          color: white;
        }

        .controls-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .search-container {
          display: flex;
          align-items: center;
        }

        .search-input {
          padding: 8px 16px;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-size: 0.8rem;
          width: 400px;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .restaurants-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          max-height: 600px;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .controls-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .search-input {
            width: 100%;
          }

          .table-container {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
