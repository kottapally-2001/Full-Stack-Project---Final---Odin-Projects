import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import UserRegister from "./pages/UserRegister";
import UserLogin from "./pages/UserLogin";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import ProjectDetails from "./pages/ProjectDetails";
import AddProject from "./pages/AddProject";
import AiChat from "./pages/AiChat";

import "./App.css";

/* Protected Route */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
const token = localStorage.getItem("token");
return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
const navigate = useNavigate();

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

const [showAdminInfo, setShowAdminInfo] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

/* Close dropdown when clicking outside */
useEffect(() => {
const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.current &&
    !dropdownRef.current.contains(event.target as Node)
  ) {
    setShowAdminInfo(false);
  }
};

document.addEventListener("mousedown", handleClickOutside);
return () =>
  document.removeEventListener("mousedown", handleClickOutside);
}, []);

const logout = () => {
localStorage.clear();
navigate("/login");
};

return (
<div className="app">

  {/* NAVBAR */}
  {token && (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        <div className="logo-circle">PM</div>
        <span>Project Management</span>
      </div>

      <div className="nav-actions">

        {/* USER DROPDOWN */}
        <div className="user-wrapper" ref={dropdownRef}>
          <span
            className="logged-user"
            onClick={() => setShowAdminInfo((prev) => !prev)}
          >
            👤 {username} ({role})
          </span>

          {role === "admin" && showAdminInfo && (
            <div className="admin-dropdown">
              <h4>🛠 Admin Capabilities</h4>
              <ul>
                <li>Create and manage projects</li>
                <li>Control project visibility</li>
                <li>Manage system users</li>
              </ul>
            </div>
          )}
        </div>

        <button
          className="nav-btn"
          onClick={() => navigate("/projects")}
        >
          Projects 📁
        </button>

        {role === "admin" && (
          <>
            <button
              className="nav-btn"
              onClick={() => navigate("/projects/new")}
            >
              ➕ Add Project
            </button>

            <button
              className="nav-btn"
              onClick={() => navigate("/users")}
            >
              Users 👥
            </button>
          </>
        )}

        <button className="nav-btn" onClick={logout}>
          Logout 🚪
        </button>

      </div>
    </nav>
  )}

  {/* ROUTES */}
  <Routes>
    <Route
      path="/"
      element={
        token ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Navigate to="/register" replace />
        )
      }
    />

    <Route
      path="/register"
      element={
        token ? <Navigate to="/dashboard" replace /> : <UserRegister />
      }
    />

    <Route
      path="/login"
      element={
        token ? <Navigate to="/dashboard" replace /> : <UserLogin />
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects"
      element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects/:id"
      element={
        <ProtectedRoute>
          <ProjectDetails />
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects/new"
      element={
        role === "admin" ? (
          <ProtectedRoute>
            <AddProject />
          </ProtectedRoute>
        ) : (
          <Navigate to="/projects" replace />
        )
      }
    />

    <Route
      path="/users"
      element={
        role === "admin" ? (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        ) : (
          <Navigate to="/dashboard" replace />
        )
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>

  {/* FLOATING AI */}
  {token && <AiChat />}

</div>
);
};

export default App;
