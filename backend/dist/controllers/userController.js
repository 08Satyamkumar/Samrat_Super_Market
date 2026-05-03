"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.loginUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// @desc    Login or register user via phone
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            res.status(400).json({ message: 'Name and phone are required' });
            return;
        }
        // Check if user exists
        let user = await User_1.default.findOne({ phone });
        // If not, create a new user
        if (!user) {
            user = await User_1.default.create({
                name,
                phone,
            });
        }
        const token = (0, generateToken_1.default)(user._id.toString(), 'user');
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.loginUser = loginUser;
const Order_1 = __importDefault(require("../models/Order"));
// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private (User)
const getUserOrders = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }
        const orders = await Order_1.default.find({ user_id: req.user._id })
            .populate('shop_id', 'name logo themeColors themeColor')
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getUserOrders = getUserOrders;
