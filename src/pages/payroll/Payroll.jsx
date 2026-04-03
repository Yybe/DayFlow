import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Payroll.css';

const Payroll = () => {
    // Current salary data
    const [currentSalary] = useState({
        gross: 75000,
        net: 62500,
        currency: '$',
        period: 'Monthly'
    });

    // Salary breakdown
    const [salaryBreakdown] = useState({
        earnings: [
            { label: 'Basic Salary', amount: 50000, icon: '💰' },
            { label: 'House Rent Allowance', amount: 15000, icon: '🏠' },
            { label: 'Transport Allowance', amount: 5000, icon: '🚗' },
            { label: 'Special Allowance', amount: 5000, icon: '⭐' }
        ],
        deductions: [
            { label: 'Income Tax', amount: 8000, icon: '📊' },
            { label: 'Provident Fund', amount: 3000, icon: '🏦' },
            { label: 'Health Insurance', amount: 1500, icon: '🏥' }
        ]
    });

    // Payslip history
    const [payslipHistory] = useState(() => {
        const history = [];
        const date = new Date();
        for (let i = 1; i <= 5; i++) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 0); // Last day of previous months
            history.push({
                id: i,
                month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
                year: d.getFullYear(),
                amount: 62500,
                date: d.toISOString().split('T')[0],
                status: 'paid'
            });
        }
        return history;
    });

    // Tax information
    const [taxInfo] = useState({
        ytd: {
            grossIncome: 750000,
            taxDeducted: 96000,
            netIncome: 625000
        },
        projectedAnnual: {
            grossIncome: 900000,
            taxLiability: 115200,
            netIncome: 750000
        }
    });

    const handleDownloadPayslip = (payslip) => {
        // TODO: Implement actual download functionality
        alert(`Downloading payslip for ${payslip.month}`);
    };

    const handleViewPayslip = (payslip) => {
        // TODO: Implement view payslip modal
        alert(`Viewing payslip for ${payslip.month}`);
    };

    const formatCurrency = (amount) => {
        return `${currentSalary.currency}${amount.toLocaleString()}`;
    };

    const calculateTotalEarnings = () => {
        return salaryBreakdown.earnings.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateTotalDeductions = () => {
        return salaryBreakdown.deductions.reduce((sum, item) => sum + item.amount, 0);
    };

    return (
        <div className="payroll-container">
            <div className="payroll-header">
                <h1 className="dashboard-title">Payroll & Compensation</h1>
            </div>

            {/* Salary Overview */}
            <div className="salary-overview">
                <Card className="salary-card">
                    <div className="salary-label">Net Salary</div>
                    <div className="salary-amount">{formatCurrency(currentSalary.net)}</div>
                    <div className="salary-period">Per {currentSalary.period}</div>
                </Card>

                <Card className="salary-breakdown">
                    <h3 className="breakdown-title">Current Month Breakdown</h3>
                    <div className="breakdown-items">
                        {salaryBreakdown.earnings.map((item, index) => (
                            <div key={`earning-${index}`} className="breakdown-item">
                                <div className="breakdown-item-label">
                                    <div className="breakdown-item-icon earning">{item.icon}</div>
                                    {item.label}
                                </div>
                                <div className="breakdown-item-value earning">
                                    +{formatCurrency(item.amount)}
                                </div>
                            </div>
                        ))}

                        <div className="breakdown-divider"></div>

                        {salaryBreakdown.deductions.map((item, index) => (
                            <div key={`deduction-${index}`} className="breakdown-item">
                                <div className="breakdown-item-label">
                                    <div className="breakdown-item-icon deduction">{item.icon}</div>
                                    {item.label}
                                </div>
                                <div className="breakdown-item-value deduction">
                                    -{formatCurrency(item.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Payment & Deduction Visualization */}
            <div className="payroll-charts-grid">
                <Card className="chart-card">
                    <h3 className="chart-title">Salary Trends (Last 5 Months)</h3>
                    <div className="bar-chart-container">
                        <div className="bar-chart">
                            {payslipHistory.slice().reverse().map((payslip) => (
                                <div key={payslip.id} className="bar-wrapper">
                                    <div
                                        className="bar-fill"
                                        style={{ height: `${(payslip.amount / 75000) * 100}%` }}
                                        title={`${payslip.month}: ${formatCurrency(payslip.amount)}`}
                                    >
                                        <span className="bar-value">{formatCurrency(payslip.amount / 1000)}k</span>
                                    </div>
                                    <span className="bar-label">{payslip.month.split(' ')[0].substring(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="chart-card">
                    <h3 className="chart-title">Deduction Breakdown</h3>
                    <div className="deduction-viz-container">
                        <div className="pie-chart-wrapper">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {salaryBreakdown.deductions.map((item, index) => {
                                    const total = calculateTotalDeductions();
                                    const percentage = (item.amount / total) * 100;
                                    let offset = 0;
                                    for (let i = 0; i < index; i++) {
                                        offset += (salaryBreakdown.deductions[i].amount / total) * 100;
                                    }
                                    return (
                                        <path
                                            key={index}
                                            className={`circle segment-${index}`}
                                            strokeDasharray={`${percentage}, 100`}
                                            strokeDashoffset={-offset}
                                            d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="pie-center">
                                <span className="pie-label">Total</span>
                                <span className="pie-value">{formatCurrency(calculateTotalDeductions())}</span>
                            </div>
                        </div>
                        <div className="deduction-legend">
                            {salaryBreakdown.deductions.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span className={`legend-dot segment-${index}`}></span>
                                    <span className="legend-label">{item.label}</span>
                                    <span className="legend-value">{((item.amount / calculateTotalDeductions()) * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payment Stats */}
            <div className="payment-stats">
                <Card className="stat-card">
                    <div className="stat-icon primary">💵</div>
                    <div className="stat-content">
                        <h4>Gross Salary</h4>
                        <p>{formatCurrency(calculateTotalEarnings())}</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon success">✅</div>
                    <div className="stat-content">
                        <h4>Total Earnings (YTD)</h4>
                        <p>{formatCurrency(taxInfo.ytd.netIncome)}</p>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon warning">📉</div>
                    <div className="stat-content">
                        <h4>Total Deductions</h4>
                        <p>{formatCurrency(calculateTotalDeductions())}</p>
                    </div>
                </Card>
            </div>

            {/* Payslip History */}
            <Card className="payslip-history">
                <div className="history-header">
                    <h2 className="history-title">Payslip History</h2>
                </div>
                <div className="payslip-list">
                    {payslipHistory.map((payslip) => (
                        <div key={payslip.id} className="payslip-item">
                            <div className="payslip-info">
                                <div className="payslip-icon">📄</div>
                                <div className="payslip-details">
                                    <h4>{payslip.month}</h4>
                                    <p>Paid on {new Date(payslip.date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div className="payslip-amount">{formatCurrency(payslip.amount)}</div>
                                <div className="payslip-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() => handleViewPayslip(payslip)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => handleDownloadPayslip(payslip)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Tax Information */}
            <div className="tax-info-section">
                <div className="tax-cards">
                    <Card className="tax-card">
                        <div className="tax-card-header">
                            <div className="tax-card-icon">📊</div>
                            <h3 className="tax-card-title">Year to Date (YTD)</h3>
                        </div>
                        <div className="tax-items">
                            <div className="tax-item">
                                <span className="tax-item-label">Gross Income</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.ytd.grossIncome)}</span>
                            </div>
                            <div className="tax-item">
                                <span className="tax-item-label">Tax Deducted</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.ytd.taxDeducted)}</span>
                            </div>
                            <div className="tax-item">
                                <span className="tax-item-label">Net Income</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.ytd.netIncome)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="tax-card">
                        <div className="tax-card-header">
                            <div className="tax-card-icon">📈</div>
                            <h3 className="tax-card-title">Projected Annual</h3>
                        </div>
                        <div className="tax-items">
                            <div className="tax-item">
                                <span className="tax-item-label">Gross Income</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.projectedAnnual.grossIncome)}</span>
                            </div>
                            <div className="tax-item">
                                <span className="tax-item-label">Tax Liability</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.projectedAnnual.taxLiability)}</span>
                            </div>
                            <div className="tax-item">
                                <span className="tax-item-label">Net Income</span>
                                <span className="tax-item-value">{formatCurrency(taxInfo.projectedAnnual.netIncome)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
