const { check } = require('express-validator');

const validateProduct = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 3, max: 300 })
        .withMessage('Product name must be between 3-300 characters'),
    
    check('description')
        .trim()
        .notEmpty()
        .withMessage('Product description is required')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
    
    check('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    
    check('category')
        .notEmpty()
        .withMessage('Category is required')
        .isMongoId()
        .withMessage('Invalid category ID format'),
        
    check('subcategory')
        .optional()
        .isMongoId()
        .withMessage('Invalid subcategory ID format'),
    
    check('variants')
        .optional()
        .custom((value) => {
            try {
                const variants = JSON.parse(value);
                
                if (!Array.isArray(variants)) {
                    throw new Error('Variants must be an array');
                }
                
                for (const variant of variants) {
                    if (!variant.color) {
                        throw new Error('Color is required for each variant');
                    }
                    if (!variant.size) {
                        throw new Error('Size is required for each variant');
                    }
                    if (variant.quantity === undefined || variant.quantity < 0) {
                        throw new Error('Valid quantity is required for each variant');
                    }
                }
                
                return true;
            } catch (error) {
                throw new Error(error.message);
            }
        }),
    
    check('shipping')
        .optional()
        .isBoolean()
        .withMessage('Shipping must be an object')
];

module.exports = { validateProduct }; 