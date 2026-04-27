const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:8081";

export async function createIncident(data) {
  const res = await fetch(`${API_BASE}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyIncidents() {
  const res = await fetch(`${API_BASE}/api/incidents/my`, {
    credentials: "include",
  });
  return res.json();
}

export async function getIncidentById(id) {
  const res = await fetch(`${API_BASE}/api/incidents/${id}`, {
    credentials: "include",
  });
  return res.json();
}

export async function addComment(ticketId, content) {
  const res = await fetch(`${API_BASE}/api/incidents/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function uploadAttachments(ticketId, files) {
  const formData = new FormData();
  for (let file of files) {
    formData.append("files", file);
  }

  const res = await fetch(`${API_BASE}/api/incidents/${ticketId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return res.json();
}