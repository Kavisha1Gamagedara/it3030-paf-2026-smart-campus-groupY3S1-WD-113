import { useState } from "react";
import { createIncident } from "../../api/incidentApi";
import { useNavigate } from "react-router-dom";

export default function CreateIncident() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("LOW");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await createIncident({ title, description, category, priority });
    navigate("/incidents");
  }

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Incidents / New</p>
          <h2 className="page-title">Create Incident Ticket</h2>
        </div>
      </div>

      <div className="quick-access" style={{ maxWidth: 600 }}>
        <div className="input-group">
          <label className="input-label">Title</label>
          <input
            className="modern-input"
            placeholder="Enter incident title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Description</label>
          <textarea
            className="modern-input"
            placeholder="Describe the incident in detail..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            style={{ resize: "vertical" }}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Category</label>
          <input
            className="modern-input"
            placeholder="e.g. Network, Hardware, Software"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Priority</label>
          <select
            className="modern-input"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="LOW">🟢 Low</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="HIGH">🟠 High</option>
            <option value="CRITICAL">🔴 Critical</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            className="primary-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
          <button
            className="ghost-button"
            onClick={() => navigate("/incidents")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}