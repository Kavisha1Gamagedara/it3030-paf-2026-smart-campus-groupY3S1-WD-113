import { useEffect, useState } from "react";
import { getAllIncidents, updateIncidentStatus, assignTechnician } from "../../api/incidentApi";
import { Link } from "react-router-dom";
import "../../index.css";

export default function AdminIncidents() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assignInputs, setAssignInputs] = useState({});

  useEffect(() => {
    getAllIncidents()
      .then(data => {
        if (Array.isArray(data)) setTickets(data);
        else { setError("Failed to load tickets."); setTickets([]); }
      })
      .catch(() => setError("Failed to load tickets."))
      .finally(() => setLoading(false));
  }, []);

  function showSuccess(msg) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  function showError(msg) {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  }

  async function handleStatusChange(ticketId, newStatus) {
    const notes =
      newStatus === "RESOLVED" || newStatus === "CLOSED"
        ? window.prompt("Enter resolution notes (optional):") || ""
        : newStatus === "REJECTED"
        ? window.prompt("Enter rejection reason:") || ""
        : "";
    try {
      const updated = await updateIncidentStatus(ticketId, newStatus, notes);
      if (updated && updated.id) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        showSuccess(`Status updated to ${newStatus}`);
      } else {
        showError("Status update failed.");
        console.error("Bad response:", updated);
      }
    } catch (err) {
      showError("Error: " + err.message);
    }
  }

  async function handleAssign(ticketId) {
    const techId = assignInputs[ticketId]?.trim();
    if (!techId) { showError("Please enter a Technician ID."); return; }
    try {
      const updated = await assignTechnician(ticketId, techId);
      if (updated && updated.id) {
        setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
        setAssignInputs(prev => ({ ...prev, [ticketId]: "" }));
        showSuccess(`Technician assigned successfully!`);
      } else {
        showError("Assignment failed.");
        console.error("Bad response:", updated);
      }
    } catch (err) {
      showError("Error: " + err.message);
    }
  }

  const statusClass = (status) =>
    status === "RESOLVED" || status === "CLOSED" ? "hub-badge-active" :
    status === "IN_PROGRESS" ? "hub-badge-maintenance" :
    "hub-badge-oos";

  const nextStatuses = (current) => ({
    "OPEN": ["IN_PROGRESS", "REJECTED"],
    "IN_PROGRESS": ["RESOLVED", "REJECTED"],
    "RESOLVED": ["CLOSED"],
    "CLOSED": [],
    "REJECTED": [],
  }[current] || []);

  if (loading) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p className="page-subtitle">Loading tickets...</p>
    </div>
  );

  return (
    <div className="page fade-in">
      <div className="section-header">
        <div>
          <p className="breadcrumbs">Admin / Incidents</p>
          <h2 className="page-title">All Incident Tickets</h2>
          <p className="page-subtitle">{tickets.length} total tickets</p>
        </div>
      </div>

      {success && (
        <div style={{
          background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0",
          borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>✅ {success}</div>
      )}
      {error && (
        <div style={{
          background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca",
          borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14
        }}>❌ {error}</div>
      )}

      <div className="file-table-section" style={{ overflowX: "auto" }}>
        <table className="hub-table" style={{ minWidth: 750, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ width: "16%" }}>Title</th>
              <th style={{ width: "14%" }}>Reported By</th>
              <th style={{ width: "12%" }}>📞 Contact</th>
              <th style={{ width: "11%" }}>Status</th>
              <th style={{ width: "9%" }}>Priority</th>
              <th style={{ width: "13%" }}>Assigned To</th>
              <th style={{ width: "25%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/incidents/${ticket.id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>
                      {ticket.title}
                    </Link>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 12, wordBreak: "break-all" }}>
                    {ticket.reportedByUserId}
                  </td>
                  {/* Phone number column */}
                  <td style={{ fontSize: 12 }}>
                    {ticket.phone
                      ? <a href={`tel:${ticket.phone}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                          {ticket.phone}
                        </a>
                      : <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td>
                    <span className={`hub-badge ${statusClass(ticket.status)}`} style={{ fontSize: 11 }}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ fontSize: 11 }}>{ticket.priority}</span>
                  </td>
                  <td style={{ fontSize: 12, wordBreak: "break-all" }}>
                    {ticket.assignedTechnicianId
                      ? <span style={{ color: "var(--success)", fontWeight: 600 }}>
                          ✓ {ticket.assignedTechnicianId.substring(0, 12)}...
                        </span>
                      : <span style={{ color: "var(--muted)" }}>Unassigned</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          style={{
                            flex: 1, padding: "4px 8px", fontSize: 11,
                            borderRadius: 8, border: "1px solid var(--border)",
                            background: "#f9f9f9", minWidth: 0
                          }}
                          placeholder="Technician ID"
                          value={assignInputs[ticket.id] || ""}
                          onChange={e => setAssignInputs(prev => ({
                            ...prev, [ticket.id]: e.target.value
                          }))}
                        />
                        <button
                          style={{
                            padding: "4px 10px", fontSize: 11, borderRadius: 8,
                            border: "1px solid var(--border)", background: "#fff",
                            cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600
                          }}
                          onClick={() => handleAssign(ticket.id)}
                        >
                          Assign
                        </button>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {nextStatuses(ticket.status).map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(ticket.id, status)}
                            style={{
                              padding: "4px 10px", fontSize: 11, borderRadius: 8,
                              border: "none", cursor: "pointer", fontWeight: 700,
                              background: status === "REJECTED" ? "#ef4444" :
                                          status === "RESOLVED" ? "#0f4c81" :
                                          status === "CLOSED" ? "#12805c" : "#0f4c81",
                              color: "#fff", whiteSpace: "nowrap"
                            }}
                          >
                            {status}
                          </button>
                        ))}
                        {nextStatuses(ticket.status).length === 0 && (
                          <span style={{ color: "var(--muted)", fontSize: 11 }}>—</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}