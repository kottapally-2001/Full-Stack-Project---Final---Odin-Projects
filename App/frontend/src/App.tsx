import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import UserRegister from "./pages/UserRegister";
import UserLogin from "./pages/UserLogin";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Users from "./pages/Users";
import ProjectDetails from "./pages/ProjectDetails";
import AddProject from "./pages/AddProject";
import "./App.css";

/* ================= Protected Route ================= */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

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
            <div className="logo-circle">SK</div>
            <span>Saicharan Kottapally</span>
          </div>

          <div className="nav-actions">
            <span className="logged-user">
              👤 {username} ({role})
            </span>

            <button className="nav-btn" onClick={() => navigate("/projects")}>
              Projects
            </button>

            {role === "admin" && (
              <button
                className="nav-btn"
                onClick={() => navigate("/projects/new")}
              >
                + Add Project
              </button>
            )}

            {role === "admin" && (
              <button className="nav-btn" onClick={() => navigate("/users")}>
                Users
              </button>
            )}

            <button className="nav-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </nav>
      )}

      {/* ROUTES */}
      <Routes>
        {/* DEFAULT → REGISTER FIRST */}
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

        {/* PUBLIC */}
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <UserRegister />}
        />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <UserLogin />}
        />

        {/* PROTECTED */}
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

        {/* ADMIN */}
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

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
