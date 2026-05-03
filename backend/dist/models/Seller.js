"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sellerSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
    },
    shop_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Shop',
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'blocked'],
        default: 'pending',
    },
    kyc_verified: {
        type: Boolean,
        default: false,
    },
    wallet_balance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Auto-delete pending sellers after 24 hours (86400 seconds)
sellerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { status: 'pending' } });
const Seller = mongoose_1.default.model('Seller', sellerSchema);
exports.default = Seller;
