import express from 'express';
import { getAllActiveShops, getPublicShop, getPublicShopProducts, createPublicOrder, getAllPublicProducts } from '../controllers/shopController';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/', getAllActiveShops);
router.get('/products/all', getAllPublicProducts);
router.get('/:identifier', getPublicShop);
router.get('/:shopId/products', getPublicShopProducts);
router.post('/:shopId/orders', upload.single('paymentProof'), createPublicOrder);

export default router;
