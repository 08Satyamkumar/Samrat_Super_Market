import express from 'express';
import { registerSeller, clearTestData, loginSeller, forgotPassword, resetPassword, uploadAIMenu, getSellerMenu, uploadAIImageMenu, deleteProduct, updateProduct, bulkDeleteProducts, toggleProductAvailability, updateShopSettings, getShopSettings, getSellerOrders, updateOrderStatus, getDashboardAnalytics, updateProductImage, removeProductImage, addProduct, generateItemDescription, updateShopLogo, updateShopBanner, removeShopBanner } from '../controllers/sellerController';
import { protectSeller } from '../middlewares/authMiddleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public route to register a new seller
router.post('/register', registerSeller);

// Public route for seller login
router.post('/login', loginSeller);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Temporary route to clear test data easily
router.get('/clear-test-data', clearTestData);

// AI Menu Upload
router.post('/ai-menu-upload', protectSeller, uploadAIMenu);

// AI Menu Image Upload (Camera/File)
router.post('/ai-menu-image-upload', protectSeller, upload.single('menuImage'), uploadAIImageMenu);

// Get Seller Menu
router.get('/menu', protectSeller, getSellerMenu);

// Add Product
router.post('/product', protectSeller, addProduct);
router.post('/product/generate-description', protectSeller, generateItemDescription);

// Update Product
router.put('/product/:id', protectSeller, updateProduct);

// Delete Product
router.delete('/product/:id', protectSeller, deleteProduct);

// Bulk Delete Products
router.post('/product/bulk-delete', protectSeller, bulkDeleteProducts);

// Toggle Product Availability
router.put('/product/:id/availability', protectSeller, toggleProductAvailability);

// Get Shop Settings
router.get('/shop/settings', protectSeller, getShopSettings);

// Update Shop Settings
router.put('/shop/settings', protectSeller, updateShopSettings);

// Orders
router.get('/orders', protectSeller, getSellerOrders);
router.put('/orders/:id/status', protectSeller, updateOrderStatus);

// Analytics
router.get('/analytics', protectSeller, getDashboardAnalytics);

// Update Product Image
router.post('/product/:id/image', protectSeller, upload.single('productImage'), updateProductImage);
router.delete('/product/:id/image', protectSeller, removeProductImage);

// Update Shop Logo
router.post('/shop/logo', protectSeller, upload.single('shopLogo'), updateShopLogo);

// Update Shop Banner
router.post('/shop/banner', protectSeller, upload.single('shopBanner'), updateShopBanner);
router.delete('/shop/banner', protectSeller, removeShopBanner);

export default router;
