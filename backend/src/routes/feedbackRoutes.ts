import express from 'express';
import { submitFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedbackController';
import { protectUser, protectAdmin, superAdminOnly } from '../middlewares/authMiddleware';

const router = express.Router();

// User routes
router.post('/', protectUser, submitFeedback);

// Admin routes (Temporarily public for MVP frontend testing)
router.get('/', getFeedbacks);
router.put('/:id/status', updateFeedbackStatus);

export default router;
