import React, { useEffect, useState } from 'react';

const formatDateTime = (iso) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString();
    } catch (e) {
        return iso;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString();
    } catch (e) {
        return dateStr;
    }
};

export default function AdminBookingsPanel() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // For Review Modal
    const [reviewingBooking, setReviewingBooking] = useState(null);
    const [reviewStatus, setReviewStatus] = useState('APPROVED');
    const [reviewReason, setReviewReason] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const loadBookings = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/admin/api/bookings', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load bookings');
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch(`/admin/api/bookings/${reviewingBooking.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: reviewStatus, reason: reviewReason })
            });

            if (!res.ok) throw new Error('Failed to update status');
            
            // Refresh local state without full reload
            const updated = await res.json();
            setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
            
            setReviewingBooking(null);
            setReviewReason('');
            setReviewStatus('APPROVED');
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const filteredBookings = bookings.filter(b => 
        statusFilter === 'ALL' || b.status === statusFilter
    );

    return (
        <section className="file-table-section" style={{ marginTop: '32px' }}>
            <div className="section-header">
                <div>
                    <h2 style={{ margin: 0 }}>Booking Management</h2>
                    <p className="helper">Review, approve, or reject campus resource bookings.</p>
                </div>
                <div className="table-actions">
                    <select 
                        className="modern-input" 
                        style={{ padding: '8px 12px', minWidth: '150px' }}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <button type="button" className="btn btn-outline" onClick={loadBookings} disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {error && <p className="status-warn" style={{ marginTop: 0 }}>{error}</p>}
            {loading && !bookings.length && <p className="helper">Loading bookings...</p>}
            {!loading && !bookings.length && !error && <p className="helper">No bookings found.</p>}

            {!!bookings.length && (
                <table className="hub-table" style={{ marginTop: '16px', background: 'white', borderRadius: '8px' }}>
                    <thead>
                        <tr>
                            <th>USER</th>
                            <th>RESOURCE</th>
                            <th>DATE & TIME</th>
                            <th>ATTENDEES</th>
                            <th>STATUS</th>
                            <th>REQUESTED ON</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(b => (
                            <tr key={b.id}>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{b.userName || b.userId || 'Unknown'}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{b.purpose}</div>
                                </td>
                                <td>{b.resourceName || b.resourceId}</td>
                                <td>
                                    <div>{formatDate(b.date)}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{b.startTime} - {b.endTime}</div>
                                </td>
                                <td>{b.attendeeCount || '-'}</td>
                                <td>
                                    <span className={`hub-badge ${
                                        b.status === 'APPROVED' ? 'hub-badge-active' : 
                                        b.status === 'PENDING' ? 'hub-badge-pending' : 
                                        'hub-badge-oos'
                                    }`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>{formatDateTime(b.createdAt)}</td>
                                <td>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ padding: '6px 12px', fontSize: '11px' }}
                                        onClick={() => setReviewingBooking(b)}
                                    >
                                        REVIEW
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Review Modal */}
            {reviewingBooking && (
                <div className="modal-backdrop" onClick={() => setReviewingBooking(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ color: '#0f4c81', margin: '0 0 4px' }}>Review Booking</h2>
                            <p className="helper">Update the status for this request.</p>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 8px', fontWeight: '600' }}>{reviewingBooking.resourceName}</p>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b' }}>Requested by: {reviewingBooking.userName || reviewingBooking.userId}</p>
                            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#64748b' }}>Date: {formatDate(reviewingBooking.date)} ({reviewingBooking.startTime} - {reviewingBooking.endTime})</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Purpose: {reviewingBooking.purpose}</p>
                        </div>

                        <form onSubmit={handleReviewSubmit}>
                            <div className="input-group">
                                <label className="input-label">DECISION</label>
                                <select 
                                    className="modern-input" 
                                    value={reviewStatus} 
                                    onChange={e => setReviewStatus(e.target.value)}
                                >
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Reject</option>
                                    <option value="PENDING">Keep Pending</option>
                                </select>
                            </div>

                            {reviewStatus === 'REJECTED' && (
                                <div className="input-group">
                                    <label className="input-label">REASON FOR REJECTION</label>
                                    <textarea 
                                        className="modern-input" 
                                        value={reviewReason} 
                                        onChange={e => setReviewReason(e.target.value)}
                                        placeholder="Please provide a reason..."
                                        required
                                        style={{ minHeight: '80px', paddingTop: '12px' }}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReviewingBooking(null)}>Cancel</button>
                                <button type="submit" className="hub-search-button" style={{ flex: 2 }} disabled={submittingReview}>
                                    {submittingReview ? 'Saving...' : 'Save Decision'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
