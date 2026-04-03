import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import { Users, Calendar, FileText, CheckCircle } from 'lucide-react';
import { getFromStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Dashboard.css';

const AdminDashboard = () => {
    useAuth();

    // Pull real stats from storage
    const stats = useMemo(() => {
        const users = getFromStorage(STORAGE_KEYS.USERS, []);
        const attendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        const leaves = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);

        const todayStr = new Date().toISOString().split('T')[0];
        const presentToday = attendance.filter(a => a.date === todayStr && a.status === 'Present').length;
        const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
        const onLeaveToday = attendance.filter(a => a.date === todayStr && a.status === 'LEAVE').length;

        return {
            totalEmployees: users.length,
            presentToday,
            onLeaveToday,
            pendingRequests: pendingLeaves
        };
    }, []);

    const statsCards = [
        {
            title: 'Total Employees',
            value: stats.totalEmployees.toString(),
            icon: <Users />,
            color: 'primary',
            change: 'Active workforce',
        },
        {
            title: 'Present Today',
            value: stats.presentToday.toString(),
            icon: <CheckCircle />,
            color: 'success',
            change: `${stats.totalEmployees > 0 ? ((stats.presentToday / stats.totalEmployees) * 100).toFixed(1) : 0}% attendance`,
        },
        {
            title: 'On Leave',
            value: stats.onLeaveToday.toString(),
            icon: <Calendar />,
            color: 'warning',
            change: 'Approved leaves today',
        },
        {
            title: 'Pending Requests',
            value: stats.pendingRequests.toString(),
            icon: <FileText />,
            color: 'danger',
            change: 'Needs approval',
        },
    ];

    const recentLeaveRequests = useMemo(() => {
        const leaves = getFromStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
        return leaves.slice(0, 5); // Just show recent ones
    }, []);

    const todayAttendance = useMemo(() => {
        const attendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        const todayStr = new Date().toISOString().split('T')[0];
        return attendance.filter(a => a.date === todayStr).slice(0, 5);
    }, []);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
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

            <div className="stats-overview-grid">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className={`stat-card stat-card-${stat.color} compact`}>
                        <div className="stat-card-content compact">
                            <div className={`stat-card-icon icon-${stat.color} compact`}>
                                {stat.icon}
                            </div>
                            <div className="stat-card-info">
                                <p className="stat-card-label compact">{stat.title}</p>
                                <h2 className="stat-card-value compact">{stat.value}</h2>
                                <p className="stat-card-change">{stat.change}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="dashboard-grid">
                <Card title="Recent Leave Requests" className="table-card">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Days</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeaveRequests.length > 0 ? (
                                    recentLeaveRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td>{request.userName || request.email}</td>
                                            <td>{request.type}</td>
                                            <td>{request.days}</td>
                                            <td>
                                                <span className={`status-badge status-${request.status.toLowerCase()}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No recent requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {recentLeaveRequests.length > 0 && (
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <a href="/admin/leave" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem', fontWeight: '500' }}>View All →</a>
                        </div>
                    )}
                </Card>

                <Card title="Today's Active Staff" className="table-card">
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Check-in</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayAttendance.length > 0 ? (
                                    todayAttendance.map((record) => (
                                        <tr key={record.id}>
                                            <td>{record.userName}</td>
                                            <td>{record.checkInTime}</td>
                                            <td>
                                                <span className={`status-badge status-${record.status.toLowerCase()}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No active staff recorded today</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {todayAttendance.length > 0 && (
                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <a href="/admin/attendance" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem', fontWeight: '500' }}>View More →</a>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
