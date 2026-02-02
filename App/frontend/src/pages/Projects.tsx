import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../types/Project";

const API_URL = "http://localhost:4000";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setProjects)
      .catch(() => setError("Failed to load projects"));
  }, [navigate, token]);

  return (
    <main className="projects">
      <h2>Projects</h2>

      {error && <p className="error">{error}</p>}

      <div className="projects-list">
        {projects.map((p) => (
          <div
            key={p.id}
            className="project-card"
            onClick={() => navigate(`/projects/${p.id}`)}
          >
            <h3>{p.title}</h3>
            <p>{p.description}</p>

            {/* STATUS ONLY */}
            {role === "admin" && (
              <span
                className={
                  p.restricted ? "admin-badge" : "public-badge"
                }
              >
                {p.restricted ? "Admin only" : "Public"}
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Projects;
