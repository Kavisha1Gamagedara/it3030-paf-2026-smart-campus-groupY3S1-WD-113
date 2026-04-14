import React, { useEffect, useState } from 'react';
import ResourceForm from './ResourceForm';

const ResourceCatalogue = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');
  const [editingResource, setEditingResource] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8080/api/facilities';
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterLocation) params.append('location', filterLocation);
      if (filterMinCapacity) params.append('minCapacity', filterMinCapacity);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/facilities/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchResources();
      } else {
        alert('Failed to delete resource. It might be in use (booked).');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Network error. Is the backend running?');
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, filterLocation, filterMinCapacity]);

  return (
    <div className="facilities-container">
      <h1>Facilities Resource Catalogue</h1>
      <p>Welcome to the facilities management module.</p>

      {editingResource ? (
        <ResourceForm
          initialData={editingResource}
          onSuccess={() => {
            setEditingResource(null);
            fetchResources();
          }}
          onCancel={() => setEditingResource(null)}
        />
      ) : (
        <ResourceForm onSuccess={fetchResources} />
      )}

      <div className="catalogue-section">
        <div className="filters-container">
          <h3>Search & Filter</h3>
          <div className="filters-row">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Lecture Hall">Lecture Hall</option>
              <option value="Lab">Lab</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Equipment">Equipment</option>
            </select>
            <input
              type="text"
              placeholder="Filter by Location"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
            <input
              type="number"
              placeholder="Min Capacity"
              value={filterMinCapacity}
              onChange={(e) => setFilterMinCapacity(e.target.value)}
            />
            <button onClick={fetchResources}>Search</button>
          </div>
        </div>

        <h3>Matched Resources</h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="resource-list">
            {resources.map((res) => (
              <div key={res.id} className="resource-card">
                <h4>{res.name}</h4>
                <div className="resource-meta">
                  <span className="badge type-badge">{res.type}</span>
                  <span className={`badge status-badge ${res.status.toLowerCase()}`}>
                    {res.status}
                  </span>
                </div>
                <p><strong>Location:</strong> {res.location}</p>
                <p><strong>Capacity:</strong> {res.capacity}</p>
                {res.availabilityWindows && (
                  <p><strong>Availability:</strong> {res.availabilityWindows}</p>
                )}
                <div className="card-actions">
                  <button onClick={() => setEditingResource(res)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(res.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {resources.length === 0 && <p>No resources found matching your criteria.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCatalogue;
