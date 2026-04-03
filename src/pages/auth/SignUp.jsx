import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants';
import './Auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        employee_id: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ROLES.EMPLOYEE,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.employee_id.trim()) {
            newErrors.employee_id = 'Employee ID is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const result = await signUp({
            employee_id: formData.employee_id,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        });

        setLoading(false);

        if (result.success) {
            alert('Registration successful! Please sign in.');
            navigate('/signin');
        } else {
            setErrors({ general: result.message });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">DayFlow</h1>
                    <p className="auth-subtitle">Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.general && (
                        <div className="error-banner">{errors.general}</div>
                    )}

                    <Input
                        label="Employee ID"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        error={errors.employee_id}
                        placeholder="e.g., EMP001"
                        required
                    />

                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="John Doe"
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="john@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="At least 6 characters"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="Re-enter password"
                        required
                    />

                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="input"
                            style={{
                                width: '100%',
                                padding: 'var(--spacing-3) var(--spacing-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                background: 'white'
                            }}
                        >
                            <option value={ROLES.EMPLOYEE}>Employee</option>
                            <option value={ROLES.HR_ADMIN}>HR Admin</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        loading={loading}
                        className="auth-button"
                    >
                        Sign Up
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/signin" className="auth-link">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
