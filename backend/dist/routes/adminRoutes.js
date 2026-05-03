"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const shopController_1 = require("../controllers/shopController");
const router = express_1.default.Router();
router.post('/login', adminController_1.authAdmin);
router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Admin logged out successfully' });
});
router.route('/me').get(authMiddleware_1.protectAdmin, adminController_1.getAdminProfile);
router.route('/register').post(authMiddleware_1.protectAdmin, authMiddleware_1.superAdminOnly, adminController_1.registerAdmin);
// Dashboard Routes
router.route('/dashboard').get(authMiddleware_1.protectAdmin, dashboardController_1.getDashboardStats);
// Shop Routes (Temporarily public for MVP frontend testing)
router.route('/shops').get(shopController_1.getShops);
router.route('/shops/:id/status').put(shopController_1.updateShopStatus);
exports.default = router;
