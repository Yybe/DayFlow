import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Admin.css';

const AdminLeave = () => {
    const [filter, setFilter] = useState('pending');
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        const allRequests = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        setLeaveRequests(allRequests);
    }, []);

    const handleAction = (id, newStatus) => {
        const allRequests = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        const updatedRequests = allRequests.map(req => {
            if (req.id === id) {
                return { ...req, status: newStatus };
            }
            return req;
        });

        saveToStorage(STORAGE_KEYS.LEAVE_REQUESTS, updatedRequests);
        setLeaveRequests(updatedRequests);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredRequests = filter === 'all'
        ? leaveRequests
        : leaveRequests.filter(r => r.status === filter);

    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === 'pending').length,
        approved: leaveRequests.filter(r => r.status === 'approved').length,
        rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="dashboard-title">Leave Approvals</h1>
                    <p className="subtitle">Manage and review employee leave applications</p>
                </div>
                <div className="stats-pills">
                    <button
                        className={`pill ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Total <span>{stats.total}</span>
                    </button>
                    <button
                        className={`pill pending ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending <span>{stats.pending}</span>
                    </button>
                    <button
                        className={`pill approved ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved <span>{stats.approved}</span>
                    </button>
                    <button
                        className={`pill rejected ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected <span>{stats.rejected}</span>
                    </button>
                </div>
            </div>

            <div className="requests-grid">
                {filteredRequests.map(request => (
                    <Card key={request.id} className={`request-card-enhanced ${request.status}`}>
                        <div className="card-top">
                            <div className="employee-info-main">
                                <div className="avatar-circle">
                                    {request.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h3>{request.userName}</h3>
                                    <span>ID: {request.empId}</span>
                                </div>
                            </div>
                            <span className={`status-tag ${request.status}`}>
                                {request.status}
                            </span>
                        </div>

                        <div className="leave-details-grid">
                            <div className="detail-item">
                                <label>Type</label>
                                <p>{request.type}</p>
                            </div>
                            <div className="detail-item">
                                <label>Duration</label>
                                <p>{request.days} Day(s)</p>
                            </div>
                            <div className="detail-item">
                                <label>From</label>
                                <p>{formatDate(request.startDate)}</p>
                            </div>
                            <div className="detail-item">
                                <label>To</label>
                                <p>{formatDate(request.endDate)}</p>
                            </div>
                        </div>

                        <div className="request-reason-box">
                            <label>Reason for Leave</label>
                            <p>{request.reason}</p>
                        </div>

                        <div className="card-footer-info">
                            Applied on {formatDate(request.appliedDate || request.appliedOn)}
                        </div>

                        {request.status === 'pending' && (
                            <div className="request-action-buttons">
                                <Button
                                    variant="secondary"
                                    onClick={() => handleAction(request.id, 'rejected')}
                                    className="reject-btn-modern"
                                >
                                    Decline
                                </Button>
                                <Button
                                    onClick={() => handleAction(request.id, 'approved')}
                                    className="approve-btn-modern"
                                >
                                    Approve Request
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}

                {filteredRequests.length === 0 && (
                    <div className="no-data-state">
                        <div className="empty-icon">📂</div>
                        <h3>No records found</h3>
                        <p>There are no {filter} leave requests at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLeave;
