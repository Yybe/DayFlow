import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getFromStorage } from '../../utils/localStorage';
import { STORAGE_KEYS, ROLES } from '../../utils/constants';
import './Admin.css';

const AdminPayroll = () => {
    const currentMonthStr = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
    const [payrollProcessed, setPayrollProcessed] = useState(false);

    const [payrollStatus, setPayrollStatus] = useState([]);
    const [stats, setStats] = useState({
        totalPayout: 0,
        pendingApprovals: 0,
        unpaidEmployees: 0,
        nextRun: ''
    });

    useEffect(() => {
        const allUsers = getFromStorage(STORAGE_KEYS.USERS, []);
        const registeredEmployees = allUsers.filter(u => u.role === ROLES.EMPLOYEE);

        // Mock payroll data for registered employees
        const mockPayroll = registeredEmployees.map((emp, index) => ({
            id: index + 1,
            name: emp.name,
            empId: emp.employee_id || `EMP${String(index + 1).padStart(3, '0')}`,
            gross: 75000, // This could be dynamic based on employee profile if available
            deductions: 12500,
            net: 62500,
            status: 'Paid'
        }));

        setPayrollStatus(mockPayroll);

        const total = mockPayroll.reduce((sum, p) => sum + p.net, 0);
        setStats({
            totalPayout: total,
            pendingApprovals: 0,
            unpaidEmployees: 0,
            nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
    }, []);

    const handleProcessPayroll = () => {
        if (window.confirm(`Are you sure you want to process payroll for ${selectedMonth}?`)) {
            setPayrollProcessed(true);
            setTimeout(() => {
                alert(`Payroll for ${selectedMonth} has been successfully processed.`);
                setPayrollProcessed(false);
            }, 1000);
        }
    };

    const getMonthOptions = () => {
        const options = [];
        const date = new Date();
        for (let i = -2; i <= 2; i++) {
            const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
            options.push(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d));
        }
        return options;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="dashboard-title">Payroll Governance</h1>
                    <p className="subtitle">Overview and management of employee compensation</p>
                </div>
                <div className="admin-actions-top">
                    <select
                        className="month-selector"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {getMonthOptions().map(m => (
                            <option key={m}>{m}</option>
                        ))}
                    </select>
                    <Button
                        onClick={handleProcessPayroll}
                        disabled={payrollProcessed}
                    >
                        {payrollProcessed ? 'Processing...' : `Process ${selectedMonth.split(' ')[0]} Payroll`}
                    </Button>
                </div>
            </div>

            <div className="payroll-stats-grid">
                <Card className="payout-card primary">
                    <div className="payout-content">
                        <span className="payout-label">Total Net Payout</span>
                        <h2 className="payout-value">${stats.totalPayout.toLocaleString()}</h2>
                        <div className="payout-meta">For {selectedMonth}</div>
                    </div>
                    <div className="payout-icon">💸</div>
                </Card>
                <Card className="payout-card warning">
                    <div className="payout-content">
                        <span className="payout-label">Pending Approval</span>
                        <h2 className="payout-value">{stats.pendingApprovals}</h2>
                        <div className="payout-meta">Salaries on hold</div>
                    </div>
                    <div className="payout-icon">⏳</div>
                </Card>
                <Card className="payout-card success">
                    <div className="payout-content">
                        <span className="payout-label">Next Release</span>
                        <h2 className="payout-value">{stats.nextRun}</h2>
                        <div className="payout-meta">Scheduled date</div>
                    </div>
                    <div className="payout-icon">📅</div>
                </Card>
            </div>

            <Card className="payroll-table-card">
                <div className="table-header-payroll">
                    <h3>Payout Breakdown - {selectedMonth}</h3>
                    <div className="search-payroll">
                        <Input placeholder="Search employee..." size="small" />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Gross Salary</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollStatus.length > 0 ? (
                                payrollStatus.map(emp => (
                                    <tr key={emp.id}>
                                        <td>
                                            <div className="employee-info-payroll">
                                                <div className="employee-avatar small">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="emp-name-payroll">{emp.name}</div>
                                                    <div className="emp-id-sub">{emp.empId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="amount-cell">${emp.gross.toLocaleString()}</td>
                                        <td className="amount-cell deduction">-${emp.deductions.toLocaleString()}</td>
                                        <td className="amount-cell net">${emp.net.toLocaleString()}</td>
                                        <td>
                                            <span className={`payroll-status-tag ${emp.status.toLowerCase()}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Button variant="secondary" size="small">Slip</Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No employees registered.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminPayroll;
