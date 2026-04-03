import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    // Profile data state
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        employeeId: '',
        joinDate: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: ''
    });

    useEffect(() => {
        if (user) {
            const profiles = getFromStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, []);
            const myProfile = profiles.find(p => p.email === user.email) || {};

            const nameParts = (myProfile.name || user.name || '').split(' ');

            setProfileData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email,
                phone: myProfile.phone || '+1 (555) 000-0000',
                department: myProfile.dept || 'Engineering',
                position: myProfile.role || 'Software Engineer',
                employeeId: myProfile.empId || user.employee_id || 'EMP-XXXX',
                joinDate: myProfile.joinDate || new Date().toISOString().split('T')[0],
                dateOfBirth: myProfile.dob || '1990-01-01',
                address: myProfile.address || '123 Main St, City, State',
                emergencyContact: myProfile.emergency || 'Next of Kin - 555-0123'
            });
        }
    }, [user]);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = () => {
        const profiles = getFromStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, []);
        const updatedProfiles = profiles.map(p => {
            if (p.email === user.email) {
                return {
                    ...p,
                    name: `${profileData.firstName} ${profileData.lastName}`,
                    phone: profileData.phone,
                    dept: profileData.department,
                    role: profileData.position,
                    dob: profileData.dateOfBirth,
                    address: profileData.address,
                    emergency: profileData.emergencyContact
                };
            }
            return p;
        });

        saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, updatedProfiles);
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Page will re-render and useEffect will reset data from storage
    };

    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const users = getFromStorage(STORAGE_KEYS.USERS, []);
        const updatedUsers = users.map(u => {
            if (u.email === user.email) {
                return { ...u, password: passwordData.newPassword };
            }
            return u;
        });

        saveToStorage(STORAGE_KEYS.USERS, updatedUsers);
        setIsChangingPassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        alert('Password updated successfully!');
    };

    const getInitials = () => {
        return `${profileData.firstName?.[0] || 'U'}${profileData.lastName?.[0] || 'N'}`;
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="dashboard-title">My Profile</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {!isEditing && !isChangingPassword && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setIsChangingPassword(true)}
                            >
                                Change Password
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-picture-section">
                    <Card className="profile-picture-card">
                        <div className="profile-picture-wrapper">
                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt="Profile"
                                    className="profile-picture"
                                />
                            ) : (
                                <div className="profile-picture-placeholder">
                                    {getInitials()}
                                </div>
                            )}
                            {isEditing && (
                                <>
                                    <label htmlFor="profile-picture-input" className="upload-picture-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </label>
                                    <input
                                        id="profile-picture-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        className="profile-picture-input"
                                    />
                                </>
                            )}
                        </div>
                        <h2 className="profile-name">{profileData.firstName} {profileData.lastName}</h2>
                        <p className="profile-role">{profileData.position}</p>
                    </Card>

                    <Card className="quick-stats">
                        <div className="stat-item">
                            <div className="stat-icon primary">📅</div>
                            <div className="stat-details">
                                <h4>Join Date</h4>
                                <p>{new Date(profileData.joinDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon success">🎯</div>
                            <div className="stat-details">
                                <h4>Employee ID</h4>
                                <p>{profileData.employeeId}</p>
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-icon warning">🏢</div>
                            <div className="stat-details">
                                <h4>Department</h4>
                                <p>{profileData.department}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="profile-info-section">
                    <Card className="info-section">
                        <div className="info-section-header">
                            <h3 className="info-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Information
                            </h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label className="info-label">First Name</label>
                                {isEditing ? (
                                    <Input
                                        value={profileData.firstName}
                                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    />
                                ) : (
                                    <div className="info-value">{profileData.firstName}</div>
                                )}
                            </div>
                            <div className="info-item">
                                <label className="info-label">Last Name</label>
                                {isEditing ? (
                                    <Input
                                        value={profileData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    />
                                ) : (
                                    <div className="info-value">{profileData.lastName}</div>
                                )}
                            </div>
                            <div className="info-item">
                                <label className="info-label">Email</label>
                                <div className="info-value">{profileData.email}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Phone</label>
                                {isEditing ? (
                                    <Input
                                        value={profileData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                    />
                                ) : (
                                    <div className="info-value">{profileData.phone}</div>
                                )}
                            </div>
                            <div className="info-item">
                                <label className="info-label">Date of Birth</label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={profileData.dateOfBirth}
                                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    />
                                ) : (
                                    <div className="info-value">{new Date(profileData.dateOfBirth).toLocaleDateString()}</div>
                                )}
                            </div>
                            <div className="info-item">
                                <label className="info-label">Emergency Contact</label>
                                {isEditing ? (
                                    <Input
                                        value={profileData.emergencyContact}
                                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                                    />
                                ) : (
                                    <div className="info-value">{profileData.emergencyContact}</div>
                                )}
                            </div>
                        </div>
                        <div className="info-item" style={{ marginTop: '1.5rem' }}>
                            <label className="info-label">Address</label>
                            {isEditing ? (
                                <Input
                                    value={profileData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            ) : (
                                <div className="info-value">{profileData.address}</div>
                            )}
                        </div>

                        {isEditing && (
                            <div className="profile-actions">
                                <Button variant="secondary" onClick={handleCancelEdit}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveProfile}>
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card className="info-section">
                        <div className="info-section-header">
                            <h3 className="info-section-title">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Employment Information
                            </h3>
                        </div>
                        <div className="info-grid">
                            <div className="info-item">
                                <label className="info-label">Employee ID</label>
                                <div className="info-value">{profileData.employeeId}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Department</label>
                                <div className="info-value">{profileData.department}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Position</label>
                                <div className="info-value">{profileData.position}</div>
                            </div>
                            <div className="info-item">
                                <label className="info-label">Join Date</label>
                                <div className="info-value">{new Date(profileData.joinDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </Card>

                    {isChangingPassword && (
                        <Card className="info-section">
                            <div className="info-section-header">
                                <h3 className="info-section-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Change Password
                                </h3>
                            </div>
                            <div className="password-grid">
                                <Input
                                    type="password"
                                    label="Current Password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    placeholder="Enter current password"
                                />
                                <Input
                                    type="password"
                                    label="New Password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    placeholder="Enter new password"
                                />
                                <Input
                                    type="password"
                                    label="Confirm New Password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="profile-actions">
                                <Button variant="secondary" onClick={() => setIsChangingPassword(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleChangePassword}>
                                    Update Password
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
