import React, { useState } from "react";
import Sidebar from "./sidebar.js";
import Dashboard from "./Dashboard";
import Restaurants from "./Restaurants";

function App() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard />;
      case "restaurants":
        return <Restaurants />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar setActiveMenu={setActiveMenu} />
      <div style={{ flex: 1 }}>{renderContent()}</div>
    </div>
  );
}

export default App;
