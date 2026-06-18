const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const { requestOtp, verifyOtp } = require('../controllers/authController');
const { generatePairingSuggestions, getHistory, getHistoryById, deleteHistoryItem } = require('../controllers/pairingController');
const { submitFeedback } = require('../controllers/feedbackController');
const { getTemplates, createTemplate } = require('../controllers/templateController');
const { getAnalytics } = require('../controllers/adminController');

// 1. Auth routes (Public)
router.post('/auth/login', requestOtp);
router.post('/auth/verify', verifyOtp);

// 2. Templates (Public or Auth, we allow both but run authMiddleware to be standard)
router.get('/templates', getTemplates);
router.post('/templates', authMiddleware, createTemplate);

// 3. AI Pairing Generator (Authenticated)
router.post('/generate', authMiddleware, generatePairingSuggestions);

// 4. Generation History (Authenticated)
router.get('/history', authMiddleware, getHistory);
router.get('/history/:id', authMiddleware, getHistoryById);
router.delete('/history/:id', authMiddleware, deleteHistoryItem);

// 5. Feedback System (Authenticated)
router.post('/feedback', authMiddleware, submitFeedback);

// 6. Admin Analytics Dashboard (Authenticated)
router.get('/admin/analytics', authMiddleware, getAnalytics);

module.exports = router;
