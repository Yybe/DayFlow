import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--text-secondary)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = user.role === 'HR_ADMIN' ? '/admin/dashboard' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
