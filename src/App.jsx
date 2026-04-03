import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// Employee Pages
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Placeholder pages (to be implemented)
import Profile from './pages/profile/Profile';
import Attendance from './pages/attendance/Attendance';
import Leave from './pages/leave/Leave';
import Payroll from './pages/payroll/Payroll';

// Admin pages (placeholders)
import Employees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeave from './pages/admin/AdminLeave';
import AdminPayroll from './pages/admin/AdminPayroll';

import { ROLES } from './utils/constants';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Employee Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="payroll" element={<Payroll />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole={ROLES.HR_ADMIN}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leave" element={<AdminLeave />} />
            <Route path="payroll" element={<AdminPayroll />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
