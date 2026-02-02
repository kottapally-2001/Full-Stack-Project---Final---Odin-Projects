import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:4000";

const AddProject = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    gitUrl: "",
    previewUrl: "",
    restricted: false,
  });

  const submit = async () => {
    await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    navigate("/projects");
  };

  return (
    <div className="auth-page">
      <h2>Add Project</h2>

      <input
        placeholder="Title"
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <input
        placeholder="Description"
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <input
        placeholder="GitHub URL"
        onChange={(e) => setForm({ ...form, gitUrl: e.target.value })}
      />

      <input
        placeholder="Preview URL"
        onChange={(e) =>
          setForm({ ...form, previewUrl: e.target.value })
        }
      />

      <div className="restricted-row">
        <label className="restricted-label">
          <input
            type="checkbox"
            checked={form.restricted}
            onChange={(e) =>
              setForm({ ...form, restricted: e.target.checked })
            }
          />
          <span>Restricted (Admin only)</span>
        </label>

        <button className="primary" onClick={submit}>
          Save
        </button>
      </div>
    </div>
  );
};

export default AddProject;
