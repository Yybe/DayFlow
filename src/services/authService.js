import { STORAGE_KEYS, ROLES } from '../utils/constants';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

/**
 * Initialize mock data if not exists
 */
const initializeMockData = () => {
    const users = getFromStorage(STORAGE_KEYS.USERS, []);
    const profiles = getFromStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, []);

    // Create default users if none exist
    if (users.length === 0) {
        const defaultAdmin = {
            id: '1',
            employee_id: 'EMP001',
            name: 'Admin User',
            email: 'admin@dayflow.com',
            password: 'admin123',
            role: ROLES.HR_ADMIN,
            is_email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const defaultEmployee = {
            id: '2',
            employee_id: 'EMP002',
            name: 'John Doe',
            email: 'john@dayflow.com',
            password: 'john123',
            role: ROLES.EMPLOYEE,
            is_email_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        saveToStorage(STORAGE_KEYS.USERS, [defaultAdmin, defaultEmployee]);

        // Also initial profiles
        if (profiles.length === 0) {
            const initialProfiles = [
                {
                    id: '1',
                    name: 'Admin User',
                    role: 'HR Admin',
                    dept: 'Management',
                    status: 'Active',
                    email: 'admin@dayflow.com',
                    empId: 'EMP001',
                    joinDate: '2023-01-01'
                },
                {
                    id: '2',
                    name: 'John Doe',
                    role: 'Senior Developer',
                    dept: 'Engineering',
                    status: 'Active',
                    email: 'john@dayflow.com',
                    empId: 'EMP002',
                    joinDate: '2024-01-15'
                }
            ];
            saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, initialProfiles);
        }
    }
};

/**
 * Sign up a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Result with success status and message
 */
export const signUp = (userData) => {
    try {
        const users = getFromStorage(STORAGE_KEYS.USERS, []);

        // Check if email already exists
        const emailExists = users.some(user => user.email === userData.email);
        if (emailExists) {
            return { success: false, message: 'Email already registered' };
        }

        // Check if employee ID already exists
        const employeeIdExists = users.some(user => user.employee_id === userData.employee_id);
        if (employeeIdExists) {
            return { success: false, message: 'Employee ID already exists' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            employee_id: userData.employee_id,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || ROLES.EMPLOYEE,
            is_email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        users.push(newUser);
        saveToStorage(STORAGE_KEYS.USERS, users);

        // Also create a profile for the employee directory
        const profiles = getFromStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, []);
        const newProfile = {
            id: newUser.id,
            name: newUser.name,
            role: newUser.role === ROLES.HR_ADMIN ? 'HR Admin' : 'New Employee',
            dept: 'Unassigned',
            status: 'Active',
            email: newUser.email,
            empId: newUser.employee_id,
            joinDate: new Date().toISOString().split('T')[0]
        };
        profiles.push(newProfile);
        saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, profiles);

        return { success: true, message: 'Registration successful', user: newUser };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, message: 'Registration failed. Please try again.' };
    }
};

/**
 * Sign in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Result with success status and user data
 */
export const signIn = (email, password) => {
    try {
        initializeMockData(); // Ensure mock data exists

        const users = getFromStorage(STORAGE_KEYS.USERS, []);
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Don't store password in current user session
        const { password: _, ...userWithoutPassword } = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);

        return { success: true, message: 'Login successful', user: userWithoutPassword };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, message: 'Login failed. Please try again.' };
    }
};

/**
 * Sign out the current user
 * @returns {Object} Result with success status
 */
export const signOut = () => {
    try {
        saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
        return { success: true, message: 'Logged out successfully' };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, message: 'Logout failed' };
    }
};

/**
 * Get current logged-in user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
    return getCurrentUser() !== null;
};

/**
 * Check if current user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} Role match status
 */
export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
    const minLength = 6;

    if (password.length < minLength) {
        return { valid: false, message: `Password must be at least ${minLength} characters` };
    }

    // TODO: Add more validation rules (uppercase, lowercase, numbers, special chars)

    return { valid: true, message: 'Password is valid' };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Validation status
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
