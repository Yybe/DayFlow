import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { User, Calendar, FileText, DollarSign } from 'lucide-react';
import { getFromStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Dashboard.css';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const stats = useMemo(() => {
        if (!user) return { presentDays: 0, pendingLeaves: 0, attendanceRate: '0%' };
        const attendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        const leaves = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        const myAttendance = attendance.filter(a => a.empId === user.employee_id);
        const presentDays = myAttendance.filter(a => a.status === 'Present').length;
        const attendanceRate = myAttendance.length > 0
            ? Math.round((presentDays / myAttendance.length) * 100) + '%'
            : '0%';
        const pendingLeaves = leaves.filter(l => l.empId === user.employee_id && l.status === 'pending').length;
        return { presentDays, pendingLeaves, attendanceRate };
    }, [user]);

    const quickAccessCards = [
        {
            title: 'My Profile',
            icon: <User size={32} />,
            description: 'View and edit your profile',
            color: 'primary',
            path: '/profile',
        },
        {
            title: 'Attendance',
            icon: <Calendar size={32} />,
            description: 'Check-in/out and view records',
            color: 'success',
            path: '/attendance',
        },
        {
            title: 'Leave Requests',
            icon: <FileText size={32} />,
            description: 'Apply for leave and track status',
            color: 'warning',
            path: '/leave',
        },
        {
            title: 'Payroll',
            icon: <DollarSign size={32} />,
            description: 'View salary and payment details',
            color: 'secondary',
            path: '/payroll',
        },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
                    <p className="dashboard-subtitle">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            <div className="quick-access-grid">
                {quickAccessCards.map((card) => (
                    <Card
                        key={card.title}
                        hoverable
                        onClick={() => navigate(card.path)}
                        className={`quick-access-card card-${card.color}`}
                    >
                        <div className="card-icon-wrapper">
                            <div className={`card-icon icon-${card.color}`}>
                                {card.icon}
                            </div>
                        </div>
                        <h3 className="card-title-text">{card.title}</h3>
                        <p className="card-description">{card.description}</p>
                    </Card>
                ))}
            </div>

            <div className="dashboard-grid">
                <Card title="Recent Activity" className="activity-card">
                    <div className="activity-list">
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--spacing-6) 0' }}>
                            No recent activity yet.
                        </p>
                    </div>
                </Card>

                <Card title="Quick Stats" className="stats-card">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <p className="stat-label">Days Present</p>
                            <p className="stat-value">{stats.presentDays}</p>
                        </div>
                        <div className="stat-item">
                            <p className="stat-label">Leave Balance</p>
                            <p className="stat-value">—</p>
                        </div>
                        <div className="stat-item">
                            <p className="stat-label">Pending Requests</p>
                            <p className="stat-value">{stats.pendingLeaves}</p>
                        </div>
                        <div className="stat-item">
                            <p className="stat-label">Attendance Rate</p>
                            <p className="stat-value">{stats.attendanceRate}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
