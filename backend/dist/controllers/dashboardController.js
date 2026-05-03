"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Shop_1 = __importDefault(require("../models/Shop"));
const Order_1 = __importDefault(require("../models/Order"));
// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/SuperAdmin
const getDashboardStats = async (req, res) => {
    try {
        const totalShops = await Shop_1.default.countDocuments();
        const activeShops = await Shop_1.default.countDocuments({ status: 'active' });
        const pendingShops = await Shop_1.default.countDocuments({ status: 'pending' });
        const totalOrders = await Order_1.default.countDocuments();
        const totalRevenueResult = await Order_1.default.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$commission_amount' } } },
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const topShops = await Shop_1.default.find().limit(5).sort({ createdAt: -1 });
        const recentOrders = await Order_1.default.find().limit(5).sort({ createdAt: -1 });
        res.json({
            stats: {
                totalShops,
                activeShops,
                pendingShops,
                totalOrders,
                totalRevenue,
            },
            topShops,
            recentOrders,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getDashboardStats = getDashboardStats;
