import express from 'express';
import { authAdmin, getAdminProfile, registerAdmin } from '../controllers/adminController';
import { protectAdmin, superAdminOnly } from '../middlewares/authMiddleware';
import { getDashboardStats, globalSearch } from '../controllers/dashboardController';
import { getShops, updateShopStatus, impersonateSeller, updateShopDetails } from '../controllers/shopController';

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

// Dashboard Routes (Temporarily public for MVP frontend testing)
router.route('/dashboard').get(getDashboardStats);
router.route('/search').get(globalSearch);

// Shop Routes (Temporarily public for MVP frontend testing)
router.route('/shops').get(getShops);
router.route('/shops/:id/status').put(updateShopStatus);
router.route('/shops/:id/impersonate').post(impersonateSeller);
router.route('/shops/:id').put(updateShopDetails);

import { getUsers, updateUserStatus, getUserDetails, updateUserDetails } from '../controllers/adminController';

// User CRM Routes (Temporarily public for MVP frontend testing)
router.route('/users').get(getUsers);
router.route('/users/:id').get(getUserDetails).put(updateUserDetails);
router.route('/users/:id/status').put(updateUserStatus);

export default router;
