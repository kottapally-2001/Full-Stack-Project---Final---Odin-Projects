import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginDTO, LoginSchema, LoginResponseDTO } from "../dtos/auth.dto";

const API_URL = "http://localhost:4000";

const UserLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginDTO>({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const login = async () => {
    const parsed = LoginSchema.safeParse(form);

    if (!parsed.success) {
      setError(
        Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] || ""
      );
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data: LoginResponseDTO = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", form.username);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Something went wrong");
    }
  };

  return (
    <div className="auth-page">
      <h2>Login</h2>

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

      {error && <p className="error">{error}</p>}

      {/* ✅ BUTTON MUST USE .primary */}
      <button className="primary" onClick={login}>
        Login
      </button>

      {/* ✅ REGISTER LINK (THIS WAS MISSING) */}
      <p className="auth-footer">
        New user?{" "}
        <span
          className="auth-link"
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </div>
  );
};

export default UserLogin;
