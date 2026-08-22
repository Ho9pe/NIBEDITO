const { check } = require('express-validator');

const validateSubcategory = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Subcategory name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Subcategory name must be between 3-100 characters'),
    
    check('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
        
    check('category')
        .notEmpty()
        .withMessage('Parent category is required')
        .isMongoId()
        .withMessage('Invalid category ID format')
];

module.exports = { validateSubcategory }; 