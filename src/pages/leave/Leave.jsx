import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Leave.css';

const Leave = () => {
    const { user } = useAuth();
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState({
        annual: { available: 20, total: 20 },
        sick: { available: 10, total: 10 },
        casual: { available: 7, total: 7 },
        other: { available: 5, total: 5 }
    });

    useEffect(() => {
        if (!user) return;

        const allRequests = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        const myRequests = allRequests
            .filter(r => r.empId === user.employee_id)
            .sort((a, b) => {
                const dateA = new Date(a.appliedDate || a.appliedOn || 0);
                const dateB = new Date(b.appliedDate || b.appliedOn || 0);
                return dateB - dateA;
            });

        setLeaveHistory(myRequests);

        // Calculate balance
        const initialBalance = {
            annual: 20,
            sick: 10,
            casual: 7,
            other: 5
        };

        const approvedRequests = myRequests.filter(r => r.status === 'approved');
        approvedRequests.forEach(r => {
            const type = r.type.toLowerCase().split(' ')[0]; // 'Annual Leave' -> 'annual'
            if (initialBalance[type] !== undefined) {
                initialBalance[type] -= r.days;
            }
        });

        setLeaveBalance({
            annual: { available: initialBalance.annual, total: 20 },
            sick: { available: initialBalance.sick, total: 10 },
            casual: { available: initialBalance.casual, total: 7 },
            other: { available: initialBalance.other, total: 5 }
        });
    }, [user]);

    // Leave request form data
    const [requestForm, setRequestForm] = useState({
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: '',
        halfDay: false
    });

    const [formError, setFormError] = useState('');

    const handleFormChange = (field, value) => {
        setFormError('');
        setRequestForm(prev => {
            const newForm = { ...prev, [field]: value };
            if (field === 'startDate' && newForm.endDate && value > newForm.endDate) {
                newForm.endDate = value;
            }
            if (field === 'endDate' && newForm.startDate && value < newForm.startDate) {
                newForm.startDate = value;
            }
            if (newForm.halfDay && newForm.startDate !== newForm.endDate) {
                newForm.halfDay = false;
            }
            return newForm;
        });
    };

    const handleSubmitRequest = () => {
        const days = calculateDays(requestForm.startDate, requestForm.endDate, requestForm.halfDay);
        const available = leaveBalance[requestForm.type].available;

        if (days > available) {
            setFormError(`Insufficient ${getLeaveTypeName(requestForm.type).toLowerCase()} balance.`);
            return;
        }

        const allRequests = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        const newRequest = {
            id: Date.now().toString(),
            empId: user.employee_id,
            userName: user.name,
            email: user.email,
            type: getLeaveTypeName(requestForm.type),
            startDate: requestForm.startDate,
            endDate: requestForm.endDate,
            days: days,
            reason: requestForm.reason,
            status: 'pending',
            appliedDate: new Date().toISOString().split('T')[0]
        };

        allRequests.push(newRequest);
        saveToStorage(STORAGE_KEYS.LEAVE_REQUESTS, allRequests);

        setLeaveHistory([newRequest, ...leaveHistory]);
        setShowRequestForm(false);
        setRequestForm({
            type: 'annual',
            startDate: '',
            endDate: '',
            reason: '',
            halfDay: false
        });
    };

    const handleCancelRequest = (id) => {
        const allRequests = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        const updatedRequests = allRequests.filter(req => req.id !== id);
        saveToStorage(STORAGE_KEYS.LEAVE_REQUESTS, updatedRequests);
        setLeaveHistory(leaveHistory.filter(req => req.id !== id));
    };

    const calculateDays = (start, end, isHalfDay) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);

        let count = 0;
        let curDate = new Date(startDate);
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            curDate.setDate(curDate.getDate() + 1);
        }

        if (isHalfDay && count > 0) {
            return 0.5;
        }

        return count;
    };

    const getFilteredHistory = () => {
        if (filterStatus === 'all') return leaveHistory;
        return leaveHistory.filter(req => req.status === filterStatus);
    };

    const getLeaveTypeIcon = (typeStr) => {
        const type = typeStr.toLowerCase();
        if (type.includes('annual')) return '🏖️';
        if (type.includes('sick')) return '🏥';
        if (type.includes('casual')) return '📅';
        return '📝';
    };

    const getLeaveTypeName = (type) => {
        const names = {
            annual: 'Annual Leave',
            sick: 'Sick Leave',
            casual: 'Casual Leave',
            other: 'Other Leave'
        };
        return names[type] || 'Leave';
    };

    return (
        <div className="leave-container">
            <div className="leave-header">
                <h1 className="dashboard-title">Leave Management</h1>
                <Button onClick={() => setShowRequestForm(true)}>
                    Apply for Leave
                </Button>
            </div>

            <div className="leave-balance-section">
                <Card className="balance-card annual">
                    <div className="balance-header">
                        <div className="balance-icon annual">🏖️</div>
                        <div className="balance-title">Annual Leave</div>
                    </div>
                    <div className="balance-details">
                        <span className="balance-available">{leaveBalance.annual.available}</span>
                        <span className="balance-total">/ {leaveBalance.annual.total} days</span>
                    </div>
                    <div className="balance-bar">
                        <div
                            className="balance-bar-fill annual"
                            style={{ width: `${(leaveBalance.annual.available / leaveBalance.annual.total) * 100}%` }}
                        ></div>
                    </div>
                </Card>

                <Card className="balance-card sick">
                    <div className="balance-header">
                        <div className="balance-icon sick">🏥</div>
                        <div className="balance-title">Sick Leave</div>
                    </div>
                    <div className="balance-details">
                        <span className="balance-available">{leaveBalance.sick.available}</span>
                        <span className="balance-total">/ {leaveBalance.sick.total} days</span>
                    </div>
                    <div className="balance-bar">
                        <div
                            className="balance-bar-fill sick"
                            style={{ width: `${(leaveBalance.sick.available / leaveBalance.sick.total) * 100}%` }}
                        ></div>
                    </div>
                </Card>

                <Card className="balance-card casual">
                    <div className="balance-header">
                        <div className="balance-icon casual">📅</div>
                        <div className="balance-title">Casual Leave</div>
                    </div>
                    <div className="balance-details">
                        <span className="balance-available">{leaveBalance.casual.available}</span>
                        <span className="balance-total">/ {leaveBalance.casual.total} days</span>
                    </div>
                    <div className="balance-bar">
                        <div
                            className="balance-bar-fill casual"
                            style={{ width: `${(leaveBalance.casual.available / leaveBalance.casual.total) * 100}%` }}
                        ></div>
                    </div>
                </Card>

                <Card className="balance-card other">
                    <div className="balance-header">
                        <div className="balance-icon other">📝</div>
                        <div className="balance-title">Other Leave</div>
                    </div>
                    <div className="balance-details">
                        <span className="balance-available">{leaveBalance.other.available}</span>
                        <span className="balance-total">/ {leaveBalance.other.total} days</span>
                    </div>
                    <div className="balance-bar">
                        <div
                            className="balance-bar-fill other"
                            style={{ width: `${(leaveBalance.other.available / leaveBalance.other.total) * 100}%` }}
                        ></div>
                    </div>
                </Card>
            </div>

            <Card className="leave-history-section">
                <div className="history-header">
                    <h2 className="history-title">Leave History</h2>
                    <div className="filter-tabs">
                        {['all', 'pending', 'approved', 'rejected'].map(s => (
                            <button
                                key={s}
                                className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="leave-requests-list">
                    {getFilteredHistory().length > 0 ? (
                        getFilteredHistory().map(request => (
                            <div key={request.id} className="leave-request-item">
                                <div className="request-header">
                                    <div className="request-type">
                                        <div className={`request-type-icon ${request.type.toLowerCase().split(' ')[0]}`}>
                                            {getLeaveTypeIcon(request.type)}
                                        </div>
                                        <span className="request-type-name">{request.type}</span>
                                    </div>
                                    <span className={`request-status ${request.status}`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>

                                <div className="request-details">
                                    <div className="request-detail-item">
                                        <span className="request-detail-label">Start Date</span>
                                        <span className="request-detail-value">
                                            {new Date(request.startDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="request-detail-item">
                                        <span className="request-detail-label">End Date</span>
                                        <span className="request-detail-value">
                                            {new Date(request.endDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="request-detail-item">
                                        <span className="request-detail-label">Duration</span>
                                        <span className="request-detail-value">{request.days} day(s)</span>
                                    </div>
                                    <div className="request-detail-item">
                                        <span className="request-detail-label">Applied On</span>
                                        <span className="request-detail-value">
                                            {new Date(request.appliedDate || request.appliedOn).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="request-reason">
                                    <strong>Reason:</strong> {request.reason}
                                </div>

                                {request.status === 'rejected' && request.rejectionReason && (
                                    <div className="request-reason" style={{ background: 'rgba(239, 68, 68, 0.1)', marginTop: '0.5rem' }}>
                                        <strong>Rejection Reason:</strong> {request.rejectionReason}
                                    </div>
                                )}

                                {request.status === 'pending' && (
                                    <div className="request-actions">
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            onClick={() => handleCancelRequest(request.id)}
                                        >
                                            Cancel Request
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <h3 className="empty-state-title">No leave requests found</h3>
                            <p className="empty-state-description">
                                {filterStatus === 'all'
                                    ? 'You haven\'t applied for any leave yet.'
                                    : `No ${filterStatus} leave requests.`}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Modal
                isOpen={showRequestForm}
                onClose={() => setShowRequestForm(false)}
                title="Apply for Leave"
            >
                <div className="form-grid">
                    <div>
                        <label className="form-label">Leave Type</label>
                        <select
                            value={requestForm.type}
                            onChange={(e) => handleFormChange('type', e.target.value)}
                            className="form-select"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                background: 'white'
                            }}
                        >
                            <option value="annual">Annual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="other">Other Leave</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <Input
                            type="date"
                            label="Start Date"
                            value={requestForm.startDate}
                            onChange={(e) => handleFormChange('startDate', e.target.value)}
                        />
                        <Input
                            type="date"
                            label="End Date"
                            value={requestForm.endDate}
                            onChange={(e) => handleFormChange('endDate', e.target.value)}
                        />
                    </div>

                    {requestForm.startDate === requestForm.endDate && requestForm.startDate !== '' && (
                        <div className="form-checkbox-row">
                            <input
                                type="checkbox"
                                id="halfDay"
                                checked={requestForm.halfDay}
                                onChange={(e) => handleFormChange('halfDay', e.target.checked)}
                            />
                            <label htmlFor="halfDay">Half Day Request</label>
                        </div>
                    )}

                    {requestForm.startDate && requestForm.endDate && (
                        <div className="duration-display">
                            <span><strong>Calculated duration:</strong> {calculateDays(requestForm.startDate, requestForm.endDate, requestForm.halfDay)} working day(s)</span>
                        </div>
                    )}

                    {formError && (
                        <div className="form-error-message">
                            ⚠️ {formError}
                        </div>
                    )}

                    <div>
                        <label className="form-label">Reason *</label>
                        <textarea
                            value={requestForm.reason}
                            onChange={(e) => handleFormChange('reason', e.target.value)}
                            placeholder="Please provide a reason for your leave request"
                            rows={4}
                            className="form-textarea"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowRequestForm(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitRequest}
                            disabled={
                                !requestForm.startDate ||
                                !requestForm.endDate ||
                                !requestForm.reason ||
                                calculateDays(requestForm.startDate, requestForm.endDate, requestForm.halfDay) === 0
                            }
                        >
                            Submit Request
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Leave;
