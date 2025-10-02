import React, { useEffect, useState } from "react";
import API_BASE_URL from "./config";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}users.php`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
