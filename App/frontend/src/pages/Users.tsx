import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
id: number;
username: string;
role: "admin" | "user";
};

const API_URL = "http://localhost:4000";

const Users = () => {
const navigate = useNavigate();

const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [editingUserId, setEditingUserId] = useState<number | null>(null);
const [roleValue, setRoleValue] = useState<"admin" | "user">("user");

const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

useEffect(() => {
const token = localStorage.getItem("token");
if (!token) {
navigate("/login");
return;
}

fetch(`${API_URL}/users`, {
headers: { Authorization: `Bearer ${token}` },
})
.then((res) => {
if (!res.ok) throw new Error("Failed to fetch users");
return res.json();
})
.then((data: User[]) => {
const sorted = [...data].sort((a, b) => {
  if (a.role === "admin" && b.role !== "admin") return -1;
  if (a.role !== "admin" && b.role === "admin") return 1;
  return a.id - b.id;
});
setUsers(sorted);
setLoading(false);
})
.catch((err) => {
setError(err.message);
setLoading(false);
});
}, [navigate]);

const saveRole = async (userId: number) => {
const token = localStorage.getItem("token");
if (!token) return;

await fetch(`${API_URL}/users/${userId}/role`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({ role: roleValue }),
});

setUsers((prev) =>
[...prev]
.map((u) =>
  u.id === userId ? { ...u, role: roleValue } : u
)
.sort((a, b) => {
  if (a.role === "admin" && b.role !== "admin") return -1;
  if (a.role !== "admin" && b.role === "admin") return 1;
  return a.id - b.id;
})
);

setEditingUserId(null);
};

const deleteUser = async () => {
if (!deleteUserId) return;

const token = localStorage.getItem("token");
if (!token) return;

await fetch(`${API_URL}/users/${deleteUserId}`, {
method: "DELETE",
headers: { Authorization: `Bearer ${token}` },
});

setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
setDeleteUserId(null);
};

if (loading) return <p className="users-loading">Loading users...</p>;
if (error) return <p className="users-error">{error}</p>;

return (
<div className="users-page">
<button className="back-btn" onClick={() => navigate(-1)}>
← Back
</button>

<h2 className="users-title">Users</h2>

<table className="users-table">
<thead>
  <tr>
    <th>S.No</th>
    <th>Username</th>
    <th>Role</th>
  </tr>
</thead>

<tbody>
  {users.map((user, index) => (
    <tr key={user.id}>
      <td>{index + 1}</td>
      <td>{user.username}</td>

      <td className="role-cell">
        {editingUserId === user.id ? (
          <>
            <select
              value={roleValue}
              onChange={(e) =>
                setRoleValue(e.target.value as "admin" | "user")
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button
              className="nav-btn"
              onClick={() => saveRole(user.id)}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <span className={`role-badge ${user.role}`}>
              {user.role}
            </span>

            <button
              className="nav-btn"
              onClick={() => {
                setEditingUserId(user.id);
                setRoleValue(user.role);
              }}
            >
              Edit
            </button>

            <button
              className="admin-delete-btn"
              onClick={() => setDeleteUserId(user.id)}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  ))}
</tbody>
</table>

{deleteUserId && (
<div className="restrict-overlay">
  <div className="restrict-popup">
    <h4>Delete user?</h4>

    <p className="delete-warning">
      This action cannot be undone.
    </p>

    <button
      className="delete-confirm-btn"
      onClick={deleteUser}
    >
      Yes, Delete
    </button>

    <button
      className="restrict-cancel"
      onClick={() => setDeleteUserId(null)}
    >
      Cancel
    </button>
  </div>
</div>
)}
</div>
);
};

export default Users;
