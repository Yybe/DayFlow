import React, { useState, useMemo } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getFromStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Admin.css';

const AdminAttendance = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const attendanceData = useMemo(() => {
        const allRecords = getFromStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        // Filter by selected date
        return allRecords.filter(record => record.date === selectedDate);
    }, [selectedDate]);

    const filteredData = useMemo(() => {
        return attendanceData.filter(emp =>
            emp.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [attendanceData, searchTerm]);

    const stats = useMemo(() => {
        return {
            present: attendanceData.filter(d => d.status === 'Present').length,
            onDuty: attendanceData.filter(d => d.status === 'On Duty').length,
            absent: attendanceData.filter(d => d.status === 'Absent').length,
            late: attendanceData.filter(d => d.status === 'Late').length,
        };
    }, [attendanceData]);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="dashboard-title">Attendance Tracking</h1>
                    <p className="subtitle">Monitor daily staff attendance and working hours</p>
                </div>
                <div className="admin-filters">
                    <Input
                        type="date"
                        label="View Date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Input
                        placeholder="Search employee or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="attendance-stats-row">
                <div className="att-stat-card present">
                    <div className="att-stat-val">{stats.present}</div>
                    <div className="att-stat-label">Present</div>
                </div>
                <div className="att-stat-card late">
                    <div className="att-stat-val">{stats.late}</div>
                    <div className="att-stat-label">Late Arrival</div>
                </div>
                <div className="att-stat-card on-duty">
                    <div className="att-stat-val">{stats.onDuty}</div>
                    <div className="att-stat-label">On Duty</div>
                </div>
                <div className="att-stat-card absent">
                    <div className="att-stat-val">{stats.absent}</div>
                    <div className="att-stat-label">Absent</div>
                </div>
            </div>

            <Card className="attendance-card-main">
                <div className="table-header-ext">
                    <h3>Attendance Details for {new Date(selectedDate).toLocaleDateString()}</h3>
                    <div className="table-actions">
                        <Button variant="secondary" size="small">Export CSV</Button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>EMP ID</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                                <th>Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map(record => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="employee-info-cell">
                                                <div className="employee-avatar small">
                                                    {record.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="name-bold">{record.userName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><code className="emp-id-tag">{record.empId}</code></td>
                                        <td>{record.checkInTime || '-'}</td>
                                        <td>{record.checkOutTime || '-'}</td>
                                        <td>
                                            <span className={`status-badge-flat ${record.status.toLowerCase().replace(' ', '-')}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td>{record.totalHours || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                        <div className="empty-state">
                                            <p>No attendance records found for this date/search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminAttendance;
