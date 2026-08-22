const FAQ = require('../models/faqModel');

// Get all FAQs
const getAllFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Get single FAQ
const getFaq = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Create new FAQ
const createFaq = async (req, res) => {
    try {
        const { question, answer, order, isActive } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                message: 'Please provide question and answer'
            });
        }

        const faq = await FAQ.create({
            question,
            answer,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'FAQ created successfully',
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Update FAQ
const updateFaq = async (req, res) => {
    try {
        const { question, answer, order, isActive } = req.body;
        const updateData = {};

        if (question) updateData.question = question;
        if (answer) updateData.answer = answer;
        if (order !== undefined) updateData.order = order;
        if (isActive !== undefined) updateData.isActive = isActive;

        const faq = await FAQ.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'FAQ updated successfully',
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Delete FAQ
const deleteFaq = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    getAllFaqs,
    getFaq,
    createFaq,
    updateFaq,
    deleteFaq
};
