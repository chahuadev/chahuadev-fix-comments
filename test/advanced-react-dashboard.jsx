import React, { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = React.createContext({
    theme: 'light',
    toggleTheme: () => { },
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    }
});

const NotificationContext = React.createContext({
    notifications: [],
    addNotification: () => { },
    removeNotification: () => { },
    clearNotifications: () => { }
});

function notificationReducer(state, action) {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, {
                    id: Date.now() + Math.random(),
                    ...action.payload,
                    timestamp: new Date()
                }]
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload.id)
            };
        case 'CLEAR_NOTIFICATIONS':
            return {
                ...state,
                notifications: []
            };
        case 'UPDATE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, ...action.payload.updates } : n
                )
            };
        default:
            return state;
    }
}

function useNotifications() {
    const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

    const addNotification = useCallback((notification) => {
        dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                type: 'info',
                duration: 5000,
                ...notification
            }
        });
    }, []);

    const removeNotification = useCallback((id) => {
        dispatch({
            type: 'REMOVE_NOTIFICATION',
            payload: { id }
        });
    }, []);

    const clearNotifications = useCallback(() => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }, []);

    const updateNotification = useCallback((id, updates) => {
        dispatch({
            type: 'UPDATE_NOTIFICATION',
            payload: { id, updates }
        });
    }, []);

    return {
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        updateNotification
    };
}

function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function useApi(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef();

    const fetchData = useCallback(async (customUrl = url, customOptions = {}) => {
        try {
            setLoading(true);
            setError(null);

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            const response = await fetch(customUrl, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    ...customOptions.headers
                },
                ...options,
                ...customOptions
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            return result;
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                throw err;
            }
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        if (url && options.immediate !== false) {
            fetchData();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, url]);

    const refetch = useCallback(() => fetchData(), [fetchData]);

    return { data, loading, error, refetch, fetchData };
}

function Modal({ isOpen, onClose, title, children, size = 'medium', backdrop = true, keyboard = true }) {
    const modalRef = useRef();

    useEffect(() => {
        const handleEscape = (event) => {
            if (keyboard && event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            if (backdrop && modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, backdrop, keyboard]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
        fullscreen: 'max-w-full h-full'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'fullscreen']),
    backdrop: PropTypes.bool,
    keyboard: PropTypes.bool
};

function DataTable({
    data = [],
    columns = [],
    sortable = true,
    filterable = true,
    paginated = true,
    pageSize = 10,
    onRowClick,
    onSelectionChange,
    selectable = false,
    loading = false,
    emptyMessage = "No data available"
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState(new Set());

    const debouncedFilterText = useDebounce(filterText, 300);

    const filteredData = useMemo(() => {
        if (!debouncedFilterText) return data;

        return data.filter(row =>
            columns.some(column => {
                const value = row[column.key];
                return value && value.toString().toLowerCase().includes(debouncedFilterText.toLowerCase());
            })
        );
    }, [data, columns, debouncedFilterText]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        if (!paginated) return sortedData;

        const startIndex = (currentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, currentPage, pageSize, paginated]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleRowSelection = (rowId, isSelected) => {
        const newSelectedRows = new Set(selectedRows);

        if (isSelected) {
            newSelectedRows.add(rowId);
        } else {
            newSelectedRows.delete(rowId);
        }

        setSelectedRows(newSelectedRows);
        onSelectionChange && onSelectionChange(Array.from(newSelectedRows));
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            const allRowIds = new Set(paginatedData.map(row => row.id));
            setSelectedRows(allRowIds);
            onSelectionChange && onSelectionChange(Array.from(allRowIds));
        } else {
            setSelectedRows(new Set());
            onSelectionChange && onSelectionChange([]);
        }
    };

    const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(row.id));
    const isIndeterminate = paginatedData.some(row => selectedRows.has(row.id)) && !isAllSelected;

    return (
        <div className="w-full">
            {filterable && (
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={input => {
                                            if (input) input.indeterminate = isIndeterminate;
                                        }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                        }`}
                                    onClick={() => handleSort(column.key)}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.title}</span>
                                        {sortable && sortConfig.key === column.key && (
                                            <span className="text-blue-500">
                                                {sortConfig.direction === 'asc' ? '' : ''}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                        <span className="ml-2">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.id || index}
                                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${selectedRows.has(row.id) ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {selectable && (
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(row.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleRowSelection(row.id, e.target.checked);
                                                }}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key]
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {paginated && totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNumber = i + 1;
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`px-3 py-1 text-sm border rounded ${currentPage === pageNumber
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

DataTable.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        render: PropTypes.func
    })),
    sortable: PropTypes.bool,
    filterable: PropTypes.bool,
    paginated: PropTypes.bool,
    pageSize: PropTypes.number,
    onRowClick: PropTypes.func,
    onSelectionChange: PropTypes.func,
    selectable: PropTypes.bool,
    loading: PropTypes.bool,
    emptyMessage: PropTypes.string
};

function FormBuilder({ schema, onSubmit, initialValues = {}, validation = {} }) {
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = useCallback((name, value) => {
        const fieldValidation = validation[name];
        if (!fieldValidation) return '';

        for (const rule of fieldValidation) {
            if (rule.required && (!value || value.toString().trim() === '')) {
                return rule.message || `${name} is required`;
            }

            if (rule.minLength && value && value.toString().length < rule.minLength) {
                return rule.message || `${name} must be at least ${rule.minLength} characters`;
            }

            if (rule.maxLength && value && value.toString().length > rule.maxLength) {
                return rule.message || `${name} must be no more than ${rule.maxLength} characters`;
            }

            if (rule.pattern && value && !rule.pattern.test(value.toString())) {
                return rule.message || `${name} format is invalid`;
            }

            if (rule.custom && value) {
                const customResult = rule.custom(value, formData);
                if (typeof customResult === 'string') {
                    return customResult;
                }
                if (!customResult) {
                    return rule.message || `${name} is invalid`;
                }
            }
        }

        return '';
    }, [validation, formData]);

    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [touched, validateField]);

    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const value = formData[name];
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [formData, validateField]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newErrors = {};
        const allFields = Object.keys(schema);

        for (const fieldName of allFields) {
            const error = validateField(fieldName, formData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
            }
        }

        setErrors(newErrors);
        setTouched(Object.fromEntries(allFields.map(field => [field, true])));

        if (Object.keys(newErrors).length === 0) {
            try {
                await onSubmit(formData);
            } catch (error) {
                console.error('Form submission error:', error);
            }
        }

        setIsSubmitting(false);
    }, [schema, formData, validateField, onSubmit]);

    const renderField = (field) => {
        const { name, type, label, placeholder, options, ...fieldProps } = field;
        const value = formData[name] || '';
        const error = errors[name];
        const hasError = touched[name] && error;

        const baseClassName = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`;

        switch (type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                return (
                    <input
                        type={type}
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        onBlur={() => handleBlur(name)}
                        className={baseClassName}
                        {...fieldProps}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        placeholder={placeholder}
                        onChange={(e) => handleChange(name, e.target.value)}
                        onBlur={() => handleBlur(name)}
                        className={`${baseClassName} min-h-[100px]`}
                        {...fieldProps}
                    />
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleChange(name, e.target.value)}
                        onBlur={() => handleBlur(name)}
                        className={baseClassName}
                        {...fieldProps}
                    >
                        <option value="">{placeholder || 'Select an option'}</option>
                        {options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'checkbox':
                return (
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleChange(name, e.target.checked)}
                            onBlur={() => handleBlur(name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            {...fieldProps}
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                    </label>
                );

            case 'radio':
                return (
                    <div className="space-y-2">
                        {options?.map((option) => (
                            <label key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name={name}
                                    value={option.value}
                                    checked={value === option.value}
                                    onChange={(e) => handleChange(name, e.target.value)}
                                    onBlur={() => handleBlur(name)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    {...fieldProps}
                                />
                                <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'file':
                return (
                    <input
                        type="file"
                        onChange={(e) => handleChange(name, e.target.files[0])}
                        onBlur={() => handleBlur(name)}
                        className={baseClassName}
                        {...fieldProps}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {schema.map((field) => (
                <div key={field.name} className="space-y-1">
                    {field.type !== 'checkbox' && (
                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {validation[field.name]?.some(rule => rule.required) && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>
                    )}

                    {renderField(field)}

                    {touched[field.name] && errors[field.name] && (
                        <p className="text-sm text-red-600">{errors[field.name]}</p>
                    )}
                </div>
            ))}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}

FormBuilder.propTypes = {
    schema: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any.isRequired,
            label: PropTypes.string.isRequired
        }))
    })).isRequired,
    onSubmit: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    validation: PropTypes.object
};

function NotificationProvider({ children }) {
    const notificationHook = useNotifications();

    useEffect(() => {
        const autoRemoveNotifications = notificationHook.notifications.filter(n => n.duration > 0);

        autoRemoveNotifications.forEach(notification => {
            setTimeout(() => {
                notificationHook.removeNotification(notification.id);
            }, notification.duration);
        });
    }, [notificationHook.notifications, notificationHook.removeNotification]);

    return (
        <NotificationContext.Provider value={notificationHook}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
                {notificationHook.notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg border-l-4 ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                                notification.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                                    notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                                        'bg-blue-50 border-blue-500 text-blue-800'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {notification.title && (
                                    <h4 className="font-medium mb-1">{notification.title}</h4>
                                )}
                                <p className="text-sm">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => notificationHook.removeNotification(notification.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

NotificationProvider.propTypes = {
    children: PropTypes.node.isRequired
};

function AdvancedReactDashboard() {
    const [theme, setTheme] = useLocalStorage('dashboard-theme', 'light');
    const [selectedTab, setSelectedTab] = useState('overview');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: dashboardData, loading, error, refetch } = useApi('/api/dashboard', {
        immediate: true,
        headers: {
            'Authorization': 'Bearer mock-token'
        }
    });

    const { addNotification } = useContext(NotificationContext);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }, [setTheme]);

    const themeColors = useMemo(() => ({
        primary: theme === 'light' ? '#007bff' : '#0d6efd',
        secondary: theme === 'light' ? '#6c757d' : '#6f757a',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    }), [theme]);

    const filteredUsers = useMemo(() => {
        if (!debouncedSearchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [users, debouncedSearchTerm]);

    const handleUserSubmit = useCallback(async (userData) => {
        try {
            const newUser = {
                id: Date.now(),
                ...userData,
                createdAt: new Date().toISOString()
            };

            setUsers(prevUsers => [...prevUsers, newUser]);
            setIsModalOpen(false);

            addNotification({
                type: 'success',
                title: 'User Created',
                message: `User ${userData.name} has been created successfully.`,
                duration: 3000
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error',
                message: 'Failed to create user. Please try again.',
                duration: 5000
            });
        }
    }, [addNotification]);

    const handleRowSelection = useCallback((selectedIds) => {
        console.log('Selected user IDs:', selectedIds);
    }, []);

    const userColumns = [
        {
            key: 'id',
            title: 'ID',
        },
        {
            key: 'name',
            title: 'Name',
        },
        {
            key: 'email',
            title: 'Email',
        },
        {
            key: 'role',
            title: 'Role',
            render: (value) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${value === 'admin' ? 'bg-red-100 text-red-800' :
                        value === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'createdAt',
            title: 'Created',
            render: (value) => new Date(value).toLocaleDateString()
        }
    ];

    const userFormSchema = [
        {
            name: 'name',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter full name'
        },
        {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter email address'
        },
        {
            name: 'role',
            type: 'select',
            label: 'Role',
            placeholder: 'Select a role',
            options: [
                { value: 'user', label: 'User' },
                { value: 'moderator', label: 'Moderator' },
                { value: 'admin', label: 'Administrator' }
            ]
        },
        {
            name: 'department',
            type: 'text',
            label: 'Department',
            placeholder: 'Enter department'
        },
        {
            name: 'active',
            type: 'checkbox',
            label: 'Active User'
        }
    ];

    const userFormValidation = {
        name: [
            { required: true, message: 'Name is required' },
            { minLength: 2, message: 'Name must be at least 2 characters' }
        ],
        email: [
            { required: true, message: 'Email is required' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
        ],
        role: [
            { required: true, message: 'Please select a role' }
        ]
    };

    useEffect(() => {
        setUsers([
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: 'admin',
                department: 'IT',
                active: true,
                createdAt: '2023-01-15T10:30:00Z'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'moderator',
                department: 'Marketing',
                active: true,
                createdAt: '2023-02-20T14:45:00Z'
            },
            {
                id: 3,
                name: 'Bob Johnson',
                email: 'bob@example.com',
                role: 'user',
                department: 'Sales',
                active: false,
                createdAt: '2023-03-10T09:15:00Z'
            }
        ]);
    }, []);

    const tabContent = {
        overview: (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{users.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
                    <p className="text-3xl font-bold text-green-600">{users.filter(u => u.active).length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">Administrators</h3>
                    <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">This Month</h3>
                    <p className="text-3xl font-bold text-purple-600">{users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length}</p>
                </div>
            </div>
        ),
        users: (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add User
                    </button>
                </div>

                <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    sortable={true}
                    filterable={false}
                    paginated={true}
                    pageSize={5}
                    selectable={true}
                    onSelectionChange={handleRowSelection}
                    loading={loading}
                />
            </div>
        ),
        settings: (
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Dark Theme</label>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors: themeColors }}>
            <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
                <div className="container mx-auto px-4 py-8">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Welcome to your advanced React dashboard</p>
                    </header>

                    <nav className="mb-8">
                        <div className="flex space-x-1 bg-white rounded-lg p-1">
                            {['overview', 'users', 'settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setSelectedTab(tab)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTab === tab
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <main>
                        {tabContent[selectedTab]}
                    </main>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Add New User"
                        size="medium"
                    >
                        <FormBuilder
                            schema={userFormSchema}
                            onSubmit={handleUserSubmit}
                            validation={userFormValidation}
                        />
                    </Modal>
                </div>
            </div>
        </ThemeContext.Provider>
    );
}

export default function App() {
    return (
        <NotificationProvider>
            <AdvancedReactDashboard />
        </NotificationProvider>
    );
}