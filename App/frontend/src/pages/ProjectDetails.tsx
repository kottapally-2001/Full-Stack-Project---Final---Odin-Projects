import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Project } from "../types/Project";

const API_URL = "http://localhost:4000";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  const [showRestrictPopup, setShowRestrictPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${API_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login", { replace: true });
          return null;
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => data && setProject(data))
      .catch(() => setError("Project not found"));
  }, [id, navigate, token]);

  /* UPDATE VISIBILITY */
  const updateVisibility = async (restricted: boolean) => {
    if (!project) return;

    const res = await fetch(`${API_URL}/projects/${project.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ restricted }),
    });

    const updated = await res.json();
    setProject(updated);
    setShowRestrictPopup(false);
  };

  /* DELETE PROJECT */
  const confirmDelete = async () => {
    if (!project) return;

    await fetch(`${API_URL}/projects/${project.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    navigate("/projects");
  };

  if (error) return <p className="error">{error}</p>;
  if (!project) return <p>Loading...</p>;

  return (
    <section className="projects-page">
      <div className="project-details-board centered">

        <div className="project-top-row">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          {role === "admin" && (
            <div className="admin-top-actions">
              <button
                className="admin-toggle-btn"
                onClick={() => setShowRestrictPopup(true)}
              >
                Restrict
              </button>

              <button
                className="admin-delete-btn"
                onClick={() => setShowDeletePopup(true)}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {showRestrictPopup && (
          <div className="restrict-overlay">
            <div className="restrict-popup">
              <h4>Project Visibility</h4>

              <button
                className="restrict-option"
                onClick={() => updateVisibility(true)}
              >
                Admin only
              </button>

              <button
                className="restrict-option"
                onClick={() => updateVisibility(false)}
              >
                Public (Users)
              </button>

              <button
                className="restrict-cancel"
                onClick={() => setShowRestrictPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM POPUP */}
        {showDeletePopup && (
          <div className="restrict-overlay">
            <div className="restrict-popup">
              <h4>Delete Project</h4>
              <p className="delete-warning">
                This action cannot be undone.
              </p>

              <button
                className="delete-confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>

              <button
                className="restrict-cancel"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CONTENT */}
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

            {project.previewUrl && (
              <a
                href={project.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary"
              >
                Live Preview
              </a>
            )}
          </div>
        </div>

        {/* PREVIEW (UNCHANGED) */}
        {project.previewUrl && (
          <div className="project-preview center-preview">
            <iframe
              src={project.previewUrl}
              title="Project Preview"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectDetails;
