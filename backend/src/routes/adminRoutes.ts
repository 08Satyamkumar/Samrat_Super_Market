import express from 'express';
import { authAdmin, getAdminProfile, registerAdmin } from '../controllers/adminController';
import { protectAdmin, superAdminOnly } from '../middlewares/authMiddleware';
import { getDashboardStats } from '../controllers/dashboardController';
import { getShops, updateShopStatus } from '../controllers/shopController';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Admin logged out successfully' });
});
router.route('/me').get(protectAdmin, getAdminProfile);
router.route('/register').post(protectAdmin, superAdminOnly, registerAdmin);

// Dashboard Routes
router.route('/dashboard').get(protectAdmin, getDashboardStats);

// Shop Routes (Temporarily public for MVP frontend testing)
router.route('/shops').get(getShops);
router.route('/shops/:id/status').put(updateShopStatus);

export default router;
