"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for guest checkout
    },
    customerName: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },
    shop_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product_id: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    total_amount: {
        type: Number,
        required: true,
        default: 0.0,
    },
    commission_amount: {
        type: Number,
        required: true,
        default: 0.0,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    preparationTime: {
        type: String,
    },
}, {
    timestamps: true,
});
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
