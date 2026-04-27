import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getIncidentById, addComment, uploadAttachments } from "../../api/incidentApi";

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    getIncidentById(id).then(setTicket);
  }, [id]);

  async function submitComment() {
    const updated = await addComment(id, comment);
    setTicket(updated);
    setComment("");
  }

  async function submitFiles() {
    const updated = await uploadAttachments(id, files);
    setTicket(updated);
    setFiles([]);
  }

  if (!ticket) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="page-subtitle">Loading incident details...</p>
    </div>
  );

  const statusClass =
    ticket.status === "RESOLVED" ? "hub-badge-active" :
    ticket.status === "IN_PROGRESS" ? "hub-badge-maintenance" :
    "hub-badge-oos";

  return (
    <div className="page fade-in">

      {/* Header */}
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Incidents / {ticket.id}</p>
          <h2 className="page-title">{ticket.title}</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <span className={`hub-badge ${statusClass}`}>{ticket.status}</span>
            <span className="badge">{ticket.priority}</span>
            <span className="tag">{ticket.category}</span>
          </div>
        </div>
        <button className="ghost-button" onClick={() => navigate("/incidents")}>
          ← Back
        </button>
      </div>

      {/* Description */}
      <div className="quick-access" style={{ marginBottom: 20 }}>
        <h3 className="section-title">Description</h3>
        <p style={{ color: "var(--text)", lineHeight: 1.7 }}>{ticket.description}</p>
      </div>

      {/* Comments */}
      <div className="file-table-section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0 }}>Comments</h3>
        </div>

        {ticket.comments?.length === 0 || !ticket.comments ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No comments yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {ticket.comments.map(c => (
              <div key={c.id} className="card" style={{ padding: "12px 16px" }}>
                <p style={{ margin: 0, fontSize: 14 }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            className="modern-input"
            placeholder="Write a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="primary-button" onClick={submitComment}>
            Post
          </button>
        </div>
      </div>

      {/* Attachments */}
      <div className="file-table-section">
        <div className="section-header">
          <h3 className="section-title" style={{ margin: 0 }}>Attachments</h3>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="file"
            multiple
            onChange={e => setFiles(e.target.files)}
            style={{ flex: 1, fontSize: 14, color: "var(--muted)" }}
          />
          <button className="primary-button" onClick={submitFiles}>
            Upload
          </button>
        </div>
      </div>

    </div>
  );
}