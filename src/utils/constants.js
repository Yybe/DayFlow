// User Roles
export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_ADMIN: 'HR_ADMIN',
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  LEAVE: 'LEAVE',
};

// Leave Types
export const LEAVE_TYPES = {
  PAID: 'Paid Leave',
  SICK: 'Sick Leave',
  UNPAID: 'Unpaid Leave',
};

// Leave Request Status
export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USERS: 'dayflow_users',
  CURRENT_USER: 'dayflow_current_user',
  EMPLOYEE_PROFILES: 'dayflow_employee_profiles',
  ATTENDANCE_RECORDS: 'dayflow_attendance_records',
  LEAVE_REQUESTS: 'dayflow_leave_requests',
  SALARY_STRUCTURES: 'dayflow_salary_structures',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  EMPLOYEE_ID_MIN_LENGTH: 3,
  PHONE_LENGTH: 10,
};
