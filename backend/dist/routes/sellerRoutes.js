"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sellerController_1 = require("../controllers/sellerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
// Public route to register a new seller
router.post('/register', sellerController_1.registerSeller);
// Public route for seller login
router.post('/login', sellerController_1.loginSeller);
// Temporary route to clear test data easily
router.get('/clear-test-data', sellerController_1.clearTestData);
// AI Menu Upload
router.post('/ai-menu-upload', authMiddleware_1.protectSeller, sellerController_1.uploadAIMenu);
// AI Menu Image Upload (Camera/File)
router.post('/ai-menu-image-upload', authMiddleware_1.protectSeller, upload.single('menuImage'), sellerController_1.uploadAIImageMenu);
// Get Seller Menu
router.get('/menu', authMiddleware_1.protectSeller, sellerController_1.getSellerMenu);
// Add Product
router.post('/product', authMiddleware_1.protectSeller, sellerController_1.addProduct);
router.post('/product/generate-description', authMiddleware_1.protectSeller, sellerController_1.generateItemDescription);
// Update Product
router.put('/product/:id', authMiddleware_1.protectSeller, sellerController_1.updateProduct);
// Delete Product
router.delete('/product/:id', authMiddleware_1.protectSeller, sellerController_1.deleteProduct);
// Bulk Delete Products
router.post('/product/bulk-delete', authMiddleware_1.protectSeller, sellerController_1.bulkDeleteProducts);
// Toggle Product Availability
router.put('/product/:id/availability', authMiddleware_1.protectSeller, sellerController_1.toggleProductAvailability);
// Get Shop Settings
router.get('/shop/settings', authMiddleware_1.protectSeller, sellerController_1.getShopSettings);
// Update Shop Settings
router.put('/shop/settings', authMiddleware_1.protectSeller, sellerController_1.updateShopSettings);
// Orders
router.get('/orders', authMiddleware_1.protectSeller, sellerController_1.getSellerOrders);
router.put('/orders/:id/status', authMiddleware_1.protectSeller, sellerController_1.updateOrderStatus);
// Analytics
router.get('/analytics', authMiddleware_1.protectSeller, sellerController_1.getDashboardAnalytics);
// Update Product Image
router.post('/product/:id/image', authMiddleware_1.protectSeller, upload.single('productImage'), sellerController_1.updateProductImage);
router.delete('/product/:id/image', authMiddleware_1.protectSeller, sellerController_1.removeProductImage);
// Update Shop Logo
router.post('/shop/logo', authMiddleware_1.protectSeller, upload.single('shopLogo'), sellerController_1.updateShopLogo);
// Update Shop Banner
router.post('/shop/banner', authMiddleware_1.protectSeller, upload.single('shopBanner'), sellerController_1.updateShopBanner);
router.delete('/shop/banner', authMiddleware_1.protectSeller, sellerController_1.removeShopBanner);
exports.default = router;
