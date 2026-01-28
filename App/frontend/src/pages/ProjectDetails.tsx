import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Project } from "../types/Project";

const API_URL = "http://localhost:4000";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Only redirect if token is REALLY missing
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        // ✅ Redirect ONLY if backend rejects token
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login", { replace: true });
          return null;
        }

        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data) setProject(data);
      })
      .catch(() => setError("Project not found"));
  }, [id, navigate]);

  if (error) return <p className="error">{error}</p>;
  if (!project) return <p>Loading...</p>;

 return (
  <section className="projects-page">
    <div className="project-details-board centered">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Text content */}
      <div className="project-info">
        <h2 className="project-title">{project.title}</h2>
        <p className="project-desc">{project.description}</p>

        <div className="actions">
        <a
          href={project.gitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
        >
          GitHub Repo
        </a>
        <a
          href={project.previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
          >
          Live Preview
        </a>
        </div>

      </div>

      {/* Preview */}
      <div className="project-preview center-preview">
        <iframe
          src={project.previewUrl}
          title="Project Preview"
          loading="lazy"
        />
      </div>
    </div>
  </section>
);
};

export default ProjectDetails;
