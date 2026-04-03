import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ROLES } from '../../utils/constants';
import './Auth.css';

const SignIn = () => {
    const navigate = useNavigate();
    const { signIn, user } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            const redirectPath = user.role === ROLES.HR_ADMIN ? '/admin/dashboard' : '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const result = await signIn(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            // Redirect based on role
            const redirectPath = result.user.role === ROLES.HR_ADMIN
                ? '/admin/dashboard'
                : '/dashboard';
            navigate(redirectPath);
        } else {
            setErrors({ general: result.message });
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">DayFlow</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.general && (
                        <div className="error-banner">{errors.general}</div>
                    )}

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="your@email.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        loading={loading}
                        className="auth-button"
                    >
                        Sign In
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup" className="auth-link">Sign Up</Link>
                    </p>
                    <div className="demo-credentials">
                        <p className="demo-title">Demo Credentials:</p>
                        <p className="demo-item"><strong>Admin:</strong> admin@dayflow.com / admin123</p>
                        <p className="demo-item"><strong>Employee:</strong> john@dayflow.com / john123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
