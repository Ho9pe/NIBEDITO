const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { isLoggedIn, isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', faqController.getAllFaqs);
router.get('/:id', faqController.getFaq);

// Admin only routes
router.post('/', isLoggedIn, isAdmin, faqController.createFaq);
router.put('/:id', isLoggedIn, isAdmin, faqController.updateFaq);
router.delete('/:id', isLoggedIn, isAdmin, faqController.deleteFaq);

module.exports = router; 