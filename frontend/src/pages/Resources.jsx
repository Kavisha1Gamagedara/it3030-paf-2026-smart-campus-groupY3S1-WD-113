import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8081/api/resources';

export default function Resources() {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 0,
        location: '',
        availabilityWindows: '08:00-17:00',
        status: 'ACTIVE',
        description: ''
    });

    // Fetch resources on load
    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch resources');
            const data = await response.json();
            setResources(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingResource ? 'PUT' : 'POST';
        const url = editingResource ? `${API_BASE_URL}/${editingResource.id}` : API_BASE_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save resource');
            
            setIsModalOpen(false);
            setEditingResource(null);
            setFormData({ name: '', type: 'LECTURE_HALL', capacity: 0, location: '', availabilityWindows: '08:00-17:00', status: 'ACTIVE', description: '' });
            fetchResources();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete resource');
            fetchResources();
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditModal = (resource) => {
        setEditingResource(resource);
        setFormData(resource);
        setIsModalOpen(true);
    };

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title" style={{ margin: 0 }}>Campus Resources</h1>
                    <p className="subtitle">Manage lecture halls, labs, and equipment</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingResource(null); setIsModalOpen(true); }}>
                    + Add Resource
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading resources...</div>
            ) : error ? (
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <p style={{ color: '#ef4444', margin: 0 }}>Error: {error}</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Make sure your backend is running on http://localhost:8081</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Capacity</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                                        No resources found. Add your first one!
                                    </td>
                                </tr>
                            ) : (
                                resources.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}><strong>{res.name}</strong></td>
                                        <td style={{ padding: '1rem' }}><span className="tag">{res.type}</span></td>
                                        <td style={{ padding: '1rem' }}>{res.location}</td>
                                        <td style={{ padding: '1rem' }}>{res.capacity}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ 
                                                color: res.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                ● {res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem' }} onClick={() => openEditModal(res)}>Edit</button>
                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', color: '#ef4444' }} onClick={() => handleDelete(res.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Simple Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
                        <h2 style={{ marginTop: 0 }}>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Resource Name</label>
                                <input type="text" name="name" className="input" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Type</label>
                                    <select name="type" className="input" value={formData.type} onChange={handleInputChange}>
                                        <option value="LECTURE_HALL">Lecture Hall</option>
                                        <option value="LAB">Lab</option>
                                        <option value="MEETING_ROOM">Meeting Room</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Capacity</label>
                                    <input type="number" name="capacity" className="input" value={formData.capacity} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Location</label>
                                <input type="text" name="location" className="input" value={formData.location} onChange={handleInputChange} required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                                <select name="status" className="input" value={formData.status} onChange={handleInputChange}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="OUT_OF_SERVICE">Out of Service</option>
                                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Resource</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
