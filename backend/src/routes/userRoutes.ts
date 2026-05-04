import express from 'express';
import { sendOtp, verifyOtp, getUserOrders } from '../controllers/userController';
import { protectUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/orders', protectUser, getUserOrders);

export default router;
