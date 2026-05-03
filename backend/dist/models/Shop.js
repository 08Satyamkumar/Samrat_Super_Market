"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const shopSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    owner_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    category: {
        type: String,
        enum: ['food', 'veg', 'nonveg', 'fashion', 'electronics', 'other'],
        default: 'food',
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'banned'],
        default: 'pending',
    },
    logo: {
        type: String, // Cloudinary URL
        default: 'https://via.placeholder.com/150',
    },
    bannerImage: {
        type: String,
        default: '', // Empty means fallback to default image
    },
    tagline: {
        type: String,
        default: 'Delicious Food, Delivered Fast.',
    },
    themeColor: {
        type: String,
        default: '#ffffff', // Default white theme
    },
    themeColors: {
        type: [String],
        default: ['#8b5cf6'],
    },
    shopSlug: {
        type: String,
        unique: true,
        sparse: true, // Allow nulls initially if older shops don't have it
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    commissionRate: {
        type: Number,
        default: 5, // 5% platform fee
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    openingTime: {
        type: String,
        default: '10:00 AM',
    },
    closingTime: {
        type: String,
        default: '10:00 PM',
    },
    estimatedDeliveryTime: {
        type: String,
        default: '30-45 mins',
    },
    upiId: {
        type: String,
        default: '',
    },
    qrCodeImage: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});
// Auto-delete pending shops after 24 hours
shopSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { status: 'pending' } });
const Shop = mongoose_1.default.model('Shop', shopSchema);
exports.default = Shop;
