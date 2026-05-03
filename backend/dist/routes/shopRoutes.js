"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopController_1 = require("../controllers/shopController");
const router = express_1.default.Router();
router.get('/', shopController_1.getAllActiveShops);
router.get('/products/all', shopController_1.getAllPublicProducts);
router.get('/:identifier', shopController_1.getPublicShop);
router.get('/:shopId/products', shopController_1.getPublicShopProducts);
router.post('/:shopId/orders', shopController_1.createPublicOrder);
exports.default = router;
