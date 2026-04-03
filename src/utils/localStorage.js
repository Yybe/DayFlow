/**
 * Generic Local Storage Utility Functions
 * Handles data serialization, deserialization, and error handling
 */

/**
 * Get data from local storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
export const getFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Remove data from local storage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Clear all data from local storage
 * @returns {boolean} Success status
 */
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

/**
 * Check if a key exists in local storage
 * @param {string} key - Storage key
 * @returns {boolean} Existence status
 */
export const storageHasKey = (key) => {
    return localStorage.getItem(key) !== null;
};
