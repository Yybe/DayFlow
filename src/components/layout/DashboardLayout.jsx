import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Calendar, FileText, DollarSign, Users, Home } from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { user, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signOut();
        navigate('/signin');
    };

    const employeeLinks = [
        { to: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/profile', icon: <User size={20} />, label: 'Profile' },
        { to: '/attendance', icon: <Calendar size={20} />, label: 'Attendance' },
        { to: '/leave', icon: <FileText size={20} />, label: 'Leave' },
        { to: '/payroll', icon: <DollarSign size={20} />, label: 'Payroll' },
    ];

    const adminLinks = [
        { to: '/admin/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/admin/employees', icon: <Users size={20} />, label: 'Employees' },
        { to: '/admin/attendance', icon: <Calendar size={20} />, label: 'Attendance' },
        { to: '/admin/leave', icon: <FileText size={20} />, label: 'Leave Requests' },
        { to: '/admin/payroll', icon: <DollarSign size={20} />, label: 'Payroll' },
    ];

    const links = isAdmin() ? adminLinks : employeeLinks;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">DayFlow</h2>
                    <p className="sidebar-subtitle">{isAdmin() ? 'HR Admin' : 'Employee'}</p>
                </div>

                <nav className="sidebar-nav">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                            end={link.to.endsWith('dashboard')}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span className="nav-label">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-role">{user?.employee_id}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
