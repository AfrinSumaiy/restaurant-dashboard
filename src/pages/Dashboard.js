import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/orders/analytics")
      .then((res) => setAnalytics(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      <h2 className="text-lg font-semibold mb-2">Daily Revenue</h2>
      <LineChart width={700} height={300} data={analytics}>
        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
      </LineChart>

      <h2 className="text-lg font-semibold mt-6 mb-2">Daily Orders</h2>
      <LineChart width={700} height={300} data={analytics}>
        <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  );
}
