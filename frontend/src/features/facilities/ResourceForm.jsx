import React, { useState } from 'react';

const ResourceForm = ({ onSuccess, initialData, onCancel }) => {
    const isEdit = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState(initialData?.type || 'Lecture Hall');
    const [capacity, setCapacity] = useState(initialData?.capacity || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [availabilityWindows, setAvailabilityWindows] = useState(initialData?.availabilityWindows || '');
    const [status, setStatus] = useState(initialData?.status || 'ACTIVE');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !capacity || !location) return;

        setSubmitting(true);
        try {
            const url = isEdit
                ? `http://localhost:8080/api/facilities/${initialData.id}`
                : 'http://localhost:8080/api/facilities';

            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                name,
                type,
                capacity: parseInt(capacity) || 0,
                location,
                availabilityWindows,
                status: status.toUpperCase()
            };
            if (isEdit) payload.id = initialData.id;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                if (!isEdit) {
                    setName('');
                    setCapacity('');
                    setLocation('');
                    setAvailabilityWindows('');
                }
                onSuccess();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Failed to save resource:', errorData);
                alert(`Error: ${errorData.message || 'Could not save resource'}`);
            }
        } catch (error) {
            console.error('Error saving resource:', error);
            alert('Network error. Is the backend running?');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <h3>{isEdit ? 'Edit Resource' : 'Add New Resource'}</h3>
            <form onSubmit={handleSubmit} className="resource-form">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Resource Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                        required
                    />
                </div>
                <div className="form-row">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        disabled={submitting}
                    >
                        <option value="Lecture Hall">Lecture Hall</option>
                        <option value="Lab">Lab</option>
                        <option value="Meeting Room">Meeting Room</option>
                        <option value="Equipment">Equipment</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Capacity"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        disabled={submitting}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Location (Building/Room)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={submitting}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Availability Windows (e.g., 08:00-17:00)"
                        value={availabilityWindows}
                        onChange={(e) => setAvailabilityWindows(e.target.value)}
                        disabled={submitting}
                    />
                </div>
                <div className="form-group">
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={submitting}
                    >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Saving...' : (isEdit ? 'Update Resource' : 'Add Resource')}
                    </button>
                    {isEdit && (
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ResourceForm;
