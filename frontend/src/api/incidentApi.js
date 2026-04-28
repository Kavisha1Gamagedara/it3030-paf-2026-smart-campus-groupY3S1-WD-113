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

export async function getAllIncidents() {
  const res = await fetch(`${API_BASE}/api/incidents`, {
    credentials: "include",
  });
  return res.json();
}

export async function getAssignedIncidents() {
  const res = await fetch(`${API_BASE}/api/incidents/assigned`, {
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
  Array.from(files).forEach(file => formData.append("files", file));
  const res = await fetch(`${API_BASE}/api/incidents/${ticketId}/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Upload failed");
  }
  return res.json();
}

export async function updateIncidentStatus(ticketId, status, resolutionNotes = "") {
  const res = await fetch(`${API_BASE}/api/incidents/${ticketId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, resolutionNotes }),
  });
  return res.json();
}

export async function assignTechnician(ticketId, technicianId) {
  const res = await fetch(`${API_BASE}/api/incidents/${ticketId}/assign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ technicianId }),
  });
  return res.json();
}

export async function deleteIncident(ticketId) {
  await fetch(`${API_BASE}/api/incidents/${ticketId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function deleteComment(ticketId, commentId) {
  const res = await fetch(
    `${API_BASE}/api/incidents/${ticketId}/comments/${commentId}`,
    { method: "DELETE", credentials: "include" }
  );
  return res.json();
}