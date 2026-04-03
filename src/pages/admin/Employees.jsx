import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { getFromStorage, saveToStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../utils/constants';
import './Admin.css';

const Employees = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '', role: '', dept: '', email: '', empId: ''
    });

    useEffect(() => {
        const storedEmployees = getFromStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, []);
        setEmployees(storedEmployees);
    }, []);

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleAddEmployee = (e) => {
        e.preventDefault();
        const id = Date.now().toString();
        const updatedEmployees = [...employees, { ...newEmployee, id, status: 'Active', joinDate: new Date().toISOString().split('T')[0] }];
        setEmployees(updatedEmployees);
        saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, updatedEmployees);
        setShowAddModal(false);
        setNewEmployee({ name: '', role: '', dept: '', email: '', empId: '' });
    };

    const handleEditEmployee = (e) => {
        e.preventDefault();
        const updatedEmployees = employees.map(emp =>
            emp.id === selectedEmployee.id ? selectedEmployee : emp
        );
        setEmployees(updatedEmployees);
        saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, updatedEmployees);
        setShowEditModal(false);
        setSelectedEmployee(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            const updatedEmployees = employees.filter(emp => emp.id !== id);
            setEmployees(updatedEmployees);
            saveToStorage(STORAGE_KEYS.EMPLOYEE_PROFILES, updatedEmployees);
        }
    };

    const openEditModal = (emp) => {
        setSelectedEmployee(emp);
        setShowEditModal(true);
    };

    const openStatsModal = (emp) => {
        setSelectedEmployee(emp);
        setShowStatsModal(true);
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="dashboard-title">Employee Directory</h1>
                    <p className="subtitle">Manage company workforce and employee profiles</p>
                </div>
                <div className="admin-filters">
                    <Input
                        placeholder="Search name, ID or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button onClick={() => setShowAddModal(true)}>Add Employee</Button>
                </div>
            </div>

            <div className="employee-grid-enhanced">
                {filteredEmployees.map(emp => (
                    <Card key={emp.id} className="employee-card-modern">
                        <div className="emp-card-header">
                            <div className="emp-avatar-box">
                                <div className="avatar-large">
                                    {emp.name.charAt(0)}
                                </div>
                                <span className={`status-dot ${emp.status.toLowerCase().replace(' ', '-')}`}></span>
                            </div>
                            <button className="delete-btn-icon" onClick={() => handleDelete(emp.id)} title="Remove Employee">×</button>
                        </div>
                        <div className="emp-card-body">
                            <h3 className="emp-name">{emp.name}</h3>
                            <p className="emp-role">{emp.role}</p>
                            <div className="emp-tags" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <span className="tag-dept">{emp.dept}</span>
                                <span className="tag-id">{emp.empId}</span>
                            </div>
                            <div style={{ marginTop: '0.5rem' }}>
                                <a href={`mailto:${emp.email}`} className="emp-email">{emp.email}</a>
                            </div>
                        </div>
                        <div className="emp-card-actions">
                            <Button variant="secondary" size="small" onClick={() => openEditModal(emp)}>Edit Profile</Button>
                            <Button variant="secondary" size="small" onClick={() => openStatsModal(emp)}>View Stats</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Employee"
            >
                <form onSubmit={handleAddEmployee}>
                    <Input
                        label="Full Name"
                        required
                        value={newEmployee.name}
                        onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                    <Input
                        label="Role"
                        required
                        value={newEmployee.role}
                        onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    />
                    <Input
                        label="Department"
                        required
                        value={newEmployee.dept}
                        onChange={e => setNewEmployee({ ...newEmployee, dept: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        required
                        value={newEmployee.email}
                        onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                    <Input
                        label="Employee ID"
                        required
                        value={newEmployee.empId}
                        onChange={e => setNewEmployee({ ...newEmployee, empId: e.target.value })}
                    />
                    <div className="modal-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit">Register Employee</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Employee Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Employee Profile"
            >
                {selectedEmployee && (
                    <form onSubmit={handleEditEmployee}>
                        <Input
                            label="Full Name"
                            required
                            value={selectedEmployee.name}
                            onChange={e => setSelectedEmployee({ ...selectedEmployee, name: e.target.value })}
                        />
                        <Input
                            label="Role"
                            required
                            value={selectedEmployee.role}
                            onChange={e => setSelectedEmployee({ ...selectedEmployee, role: e.target.value })}
                        />
                        <Input
                            label="Department"
                            required
                            value={selectedEmployee.dept}
                            onChange={e => setSelectedEmployee({ ...selectedEmployee, dept: e.target.value })}
                        />
                        <Input
                            label="Email"
                            type="email"
                            required
                            value={selectedEmployee.email}
                            onChange={e => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                        />
                        <Input
                            label="Status"
                            required
                            value={selectedEmployee.status}
                            onChange={e => setSelectedEmployee({ ...selectedEmployee, status: e.target.value })}
                        />
                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Stats Modal */}
            <Modal
                isOpen={showStatsModal}
                onClose={() => setShowStatsModal(false)}
                title="Employee Performance & Status"
            >
                {selectedEmployee && (
                    <div className="stats-modal-content" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                            <div className="avatar-large">{selectedEmployee.name.charAt(0)}</div>
                            <div>
                                <h3 style={{ margin: 0 }}>{selectedEmployee.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>{selectedEmployee.role}</p>
                                <span className={`status-badge-flat ${selectedEmployee.status.toLowerCase().replace(' ', '-')}`}>{selectedEmployee.status}</span>
                            </div>
                        </div>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Card style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Attendance</p>
                                <h2 style={{ margin: '0.5rem 0' }}>94%</h2>
                            </Card>
                            <Card style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Efficiency</p>
                                <h2 style={{ margin: '0.5rem 0' }}>88%</h2>
                            </Card>
                            <Card style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Joined</p>
                                <h2 style={{ fontSize: '1rem', margin: '0.5rem 0' }}>{new Date(selectedEmployee.joinDate).toLocaleDateString()}</h2>
                            </Card>
                            <Card style={{ textAlign: 'center', padding: '1rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Leaves Taken</p>
                                <h2 style={{ margin: '0.5rem 0' }}>02</h2>
                            </Card>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '2rem' }}>
                            <Button onClick={() => setShowStatsModal(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {filteredEmployees.length === 0 && (
                <div className="no-data-state">
                    <p>No employees found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Employees;
