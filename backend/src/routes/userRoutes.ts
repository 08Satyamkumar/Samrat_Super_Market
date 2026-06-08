import express from 'express';
import { sendOtp, verifyOtp, getUserOrders, cancelUserOrder } from '../controllers/userController';
import { protectUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/orders', protectUser, getUserOrders);
router.put('/orders/:id/cancel', protectUser, cancelUserOrder);

export default router;
