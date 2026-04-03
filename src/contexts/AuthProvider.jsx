import React, { useState } from 'react';
import { AuthContext } from './AuthContext';
import { signIn as authSignIn, signOut as authSignOut, signUp as authSignUp, getCurrentUser } from '../services/authService';
import { ROLES } from '../utils/constants';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getCurrentUser());
    const loading = false;

    const signIn = async (email, password) => {
        const result = authSignIn(email, password);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const signUp = async (userData) => {
        const result = authSignUp(userData);
        return result;
    };

    const signOut = () => {
        const result = authSignOut();
        if (result.success) {
            setUser(null);
        }
        return result;
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const hasRole = (role) => {
        return user && user.role === role;
    };

    const isAdmin = () => {
        return hasRole(ROLES.HR_ADMIN);
    };

    const isEmployee = () => {
        return hasRole(ROLES.EMPLOYEE);
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthenticated,
        hasRole,
        isAdmin,
        isEmployee,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
