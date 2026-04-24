import express from 'express';
import { registerSeller, clearTestData, loginSeller } from '../controllers/sellerController';

const router = express.Router();

// Public route to register a new seller
router.post('/register', registerSeller);

// Public route for seller login
router.post('/login', loginSeller);

// Temporary route to clear test data easily
router.get('/clear-test-data', clearTestData);

export default router;
