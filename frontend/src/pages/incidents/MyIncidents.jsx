import { useEffect, useState } from "react";
import { getMyIncidents } from "../../api/incidentApi";
import { Link } from "react-router-dom";
import "../../index.css"; // or wherever your CSS file is

export default function MyIncidents() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    getMyIncidents().then(setTickets);
  }, []);

  return (
    <div className="page fade-in">
      <div className="section-header">
        <h2 className="page-title">My Incident Tickets</h2>
        <Link to="/incidents/new">
          <button className="primary-button">+ Create New Ticket</button>
        </Link>
      </div>

      <div className="file-table-section">
        <table className="hub-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "var(--muted)" }}>
                  No incidents found.
                </td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.title}</td>
                  <td>
                    <span className={`hub-badge ${
                      ticket.status === "RESOLVED" ? "hub-badge-active" :
                      ticket.status === "IN_PROGRESS" ? "hub-badge-maintenance" :
                      "hub-badge-oos"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className="badge">{ticket.priority}</span>
                  </td>
                  <td>
                    <Link to={`/incidents/${ticket.id}`}>
                      <button className="ghost-button">View</button>
                    </Link>
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