import { body, validationResult } from 'express-validator';

// Validation middleware to check for errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const validateUserRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    handleValidationErrors
];

// User login validation
export const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Patient creation validation
export const validatePatient = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('age')
        .isInt({ min: 0, max: 120 })
        .withMessage('Age must be between 0 and 120'),

    body('symptoms')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Symptoms description must be between 5 and 500 characters'),

    body('contactNumber')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid contact number'),

    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    handleValidationErrors
];

// Appointment validation
export const validateAppointment = [
    body('patientName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Patient name must be between 2 and 50 characters'),

    body('patientEmail')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('appointmentDate')
        .isISO8601()
        .withMessage('Please provide a valid date')
        .custom((value) => {
            const appointmentDate = new Date(value);
            const now = new Date();
            if (appointmentDate <= now) {
                throw new Error('Appointment date must be in the future');
            }
            return true;
        }),

    body('appointmentTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Please provide a valid time in HH:MM format'),

    body('department')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Department must be between 2 and 50 characters'),

    handleValidationErrors
];