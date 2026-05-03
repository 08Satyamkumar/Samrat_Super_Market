import express from 'express';
import { loginUser, getUserOrders } from '../controllers/userController';
import { protectUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/login', loginUser);
router.get('/orders', protectUser, getUserOrders);

export default router;
