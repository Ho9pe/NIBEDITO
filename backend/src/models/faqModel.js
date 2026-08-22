const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new Schema(
    {
        question: {
            type: String,
            required: [true, 'FAQ question is required'],
            trim: true
        },
        answer: {
            type: String,
            required: [true, 'FAQ answer is required'],
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ; 