"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300',
    },
    shop_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    seller_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    category: {
        type: String,
        default: 'general',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isAIGenerated: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
