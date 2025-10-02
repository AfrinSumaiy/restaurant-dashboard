import React, { useState } from "react";
import { FaTachometerAlt, FaUtensils, FaBars, FaTimes } from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar({ setActiveMenu, children }) {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, key: "dashboard" },
    {
      name: "RestaurantDetailsModal",
      icon: <FaUtensils />,
      key: "restaurants",
    },
  ];

  return (
    <>
      <div
        className={`sidebar-toggle ${isOpen ? "open" : "closed"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <FaUtensils className="sidebar-icon" />
          {isOpen && <h2 className="sidebar-title">Restaurant Dashboard</h2>}
          {!isOpen && <span className="sidebar-abbr">RD</span>}
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className="menu-item"
              onClick={() => setActiveMenu(item.key)}
            >
              <span className="menu-icon">{item.icon}</span>
              {isOpen && <span className="menu-text">{item.name}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`main-content ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        {children}
      </div>
    </>
  );
}
