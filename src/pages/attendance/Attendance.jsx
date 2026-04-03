import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Attendance.css';

const Attendance = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    // Get today's attendance from storage
    useEffect(() => {
        if (!user) return;

        const allAttendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        const todayStr = new Date().toISOString().split('T')[0];

        // My history
        const myHistory = allAttendance
            .filter(a => a.empId === user.employee_id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceHistory(myHistory);

        // Today's record
        const todayRecord = allAttendance.find(a => a.empId === user.employee_id && a.date === todayStr);
        if (todayRecord) {
            if (todayRecord.checkInTime) {
                const [time, modifier] = todayRecord.checkInTime.split(' ');
                let [hours, minutes, seconds] = time.split(':');
                if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
                if (modifier === 'AM' && hours === '12') hours = '00';
                const cin = new Date();
                cin.setHours(hours, minutes, seconds || 0);
                setCheckInTime(cin);
            }
            if (todayRecord.checkOutTime) {
                const [time, modifier] = todayRecord.checkOutTime.split(' ');
                let [hours, minutes, seconds] = time.split(':');
                if (modifier === 'PM' && hours !== '12') hours = parseInt(hours) + 12;
                if (modifier === 'AM' && hours === '12') hours = '00';
                const cout = new Date();
                cout.setHours(hours, minutes, seconds || 0);
                setCheckOutTime(cout);
            }
            setIsCheckedIn(!!todayRecord.checkInTime && !todayRecord.checkOutTime);
        }
    }, [user]);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        const allAttendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);

        const newRecord = {
            id: Date.now().toString(),
            empId: user.employee_id,
            userName: user.name,
            date: dateStr,
            checkInTime: timeStr,
            checkOutTime: null,
            status: 'Present',
            totalHours: '-'
        };

        allAttendance.push(newRecord);
        saveToStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, allAttendance);

        setCheckInTime(now);
        setIsCheckedIn(true);
        setAttendanceHistory([newRecord, ...attendanceHistory]);
    };

    const handleCheckOut = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        const allAttendance = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        const todayIdx = allAttendance.findIndex(a => a.empId === user.employee_id && a.date === dateStr);

        if (todayIdx > -1) {
            allAttendance[todayIdx].checkOutTime = timeStr;
            // Simple mock duration calculation
            const diff = now - checkInTime;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            allAttendance[todayIdx].totalHours = `${hours}h ${minutes}m ${seconds}s`;

            saveToStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, allAttendance);

            setCheckOutTime(now);
            setIsCheckedIn(false);

            const updatedHistory = [...attendanceHistory];
            const histIdx = updatedHistory.findIndex(a => a.date === dateStr);
            if (histIdx > -1) {
                updatedHistory[histIdx] = allAttendance[todayIdx];
                setAttendanceHistory(updatedHistory);
            }
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateWorkingHours = () => {
        if (!checkInTime) return '0h 0m 0s';
        const endTime = checkOutTime || currentTime;
        const diff = endTime - checkInTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedMonth);
        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            const record = attendanceHistory.find(a => a.date === dateStr);
            const status = record ? record.status.toLowerCase() : 'absent';

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${status} ${isToday ? 'today' : ''}`}
                >
                    <span className="calendar-day-number">{day}</span>
                    <div className={`calendar-day-indicator ${status}`}></div>
                </div>
            );
        }

        return days;
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedMonth(newDate);
    };

    return (
        <div className="attendance-container">
            <div className="attendance-header">
                <h1 className="dashboard-title">Attendance Tracking</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        variant={viewMode === 'table' ? 'primary' : 'secondary'}
                        onClick={() => setViewMode('table')}
                    >
                        Table View
                    </Button>
                    <Button
                        variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
                        onClick={() => setViewMode('calendar')}
                    >
                        Calendar View
                    </Button>
                </div>
            </div>

            <div className="checkin-section">
                <Card className="checkin-card">
                    <div className={`status-badge ${isCheckedIn ? 'checked-in' : 'checked-out'}`}>
                        <span className="status-indicator"></span>
                        {isCheckedIn ? 'Checked In' : 'Checked Out'}
                    </div>
                    <div className="current-time">{formatTime(currentTime)}</div>
                    <div className="current-date">{formatDate(currentTime)}</div>
                    {!checkInTime ? (
                        <button className="checkin-button check-in" onClick={handleCheckIn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Check In
                        </button>
                    ) : !checkOutTime ? (
                        <button className="checkin-button check-out" onClick={handleCheckOut}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Check Out
                        </button>
                    ) : (
                        <div className="completed-day" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: 'var(--success-color)', marginBottom: '0.5rem' }}>✓</div>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Workday Completed</p>
                        </div>
                    )}
                </Card>

                <Card className="today-summary">
                    <div className="summary-item">
                        <div className="summary-icon primary">⏰</div>
                        <div className="summary-label">Check In</div>
                        <div className="summary-value">
                            {checkInTime ? checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-icon warning">🏁</div>
                        <div className="summary-label">Check Out</div>
                        <div className="summary-value">
                            {checkOutTime ? checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-icon success">⏱️</div>
                        <div className="summary-label">Working Hours</div>
                        <div className="summary-value">{calculateWorkingHours()}</div>
                    </div>
                </Card>
            </div>

            <div className="stats-grid">
                <Card className="stat-card">
                    <div className="stat-card-icon primary">📊</div>
                    <div className="stat-card-content">
                        <h4>Total Days Present</h4>
                        <p>{attendanceHistory.length} days</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-card-icon success">✅</div>
                    <div className="stat-card-content">
                        <h4>Attendance Rate</h4>
                        <p>
                            {attendanceHistory.length > 0
                                ? Math.round((attendanceHistory.filter(a => a.status === 'Present').length / attendanceHistory.length) * 100) + '%'
                                : '0%'}
                        </p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-card-icon info">⏰</div>
                    <div className="stat-card-content">
                        <h4>Avg. Working Hours</h4>
                        <p>8.5 hrs</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-card-icon warning">📅</div>
                    <div className="stat-card-content">
                        <h4>This Month</h4>
                        <p>{attendanceHistory.filter(a => a.date.startsWith(new Date().toISOString().substring(0, 7))).length} days</p>
                    </div>
                </Card>
            </div>

            {viewMode === 'table' ? (
                <Card className="history-section">
                    <div className="history-header">
                        <h2 className="history-title">Attendance History</h2>
                    </div>
                    <div className="table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.map((record, index) => (
                                    <tr key={index}>
                                        <td className="date-cell">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="time-cell">{record.checkInTime || '-'}</td>
                                        <td className="time-cell">{record.checkOutTime || '-'}</td>
                                        <td className="time-cell">{record.totalHours}</td>
                                        <td>
                                            <span className={`duration-badge ${record.status.toLowerCase()}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {attendanceHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No history found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card className="calendar-container">
                    <div className="calendar-header">
                        <h2 className="history-title">
                            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="calendar-nav">
                            <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
                                ← Previous
                            </button>
                            <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
                                Next →
                            </button>
                        </div>
                    </div>
                    <div className="calendar-grid">
                        <div className="calendar-day-header">Sun</div>
                        <div className="calendar-day-header">Mon</div>
                        <div className="calendar-day-header">Tue</div>
                        <div className="calendar-day-header">Wed</div>
                        <div className="calendar-day-header">Thu</div>
                        <div className="calendar-day-header">Fri</div>
                        <div className="calendar-day-header">Sat</div>
                        {renderCalendar()}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Attendance;
