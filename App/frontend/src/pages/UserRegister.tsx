import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterDTO, RegisterSchema } from "../dtos/auth.dto";

const API_URL = "http://localhost:4000";

const UserRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterDTO>({
    username: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");

  const register = async () => {
    const parsed = RegisterSchema.safeParse(form);

    if (!parsed.success) {
      setError(
        Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] || ""
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="auth-page">
      <h2>Register</h2>

      <input
        placeholder="Username"
        value={form.username}
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <select
        value={form.role}
        onChange={(e) =>
          setForm({ ...form, role: e.target.value as "admin" | "user" })
        }
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {error && <p className="error">{error}</p>}

      <button className="primary" onClick={register}>
        Register
      </button>
      
      <p className="auth-footer">
        Already have an account?{" "}
        <span
          className="auth-link"
          onClick={() => navigate("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default UserRegister;
