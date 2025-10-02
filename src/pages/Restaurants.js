import { useEffect, useState } from "react";
import axios from "axios";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("http://restaurant-dashboard/api")
      .then((res) => setRestaurants(res.data));
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Restaurants</h1>
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Search restaurant..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Cuisine</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td className="border p-2">{r.name}</td>
              <td className="border p-2">{r.location}</td>
              <td className="border p-2">{r.cuisine}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
