import { Request, Response } from 'express';
import Shop from '../models/Shop';
import Order from '../models/Order';
import Seller from '../models/Seller';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/SuperAdmin
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalShops = await Shop.countDocuments();
    const activeShops = await Shop.countDocuments({ status: 'active' });
    const pendingShops = await Shop.countDocuments({ status: 'pending' });
    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$commission_amount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const topShops = await Shop.find().limit(5).sort({ createdAt: -1 });
    const recentOrders = await Order.find().limit(5).sort({ createdAt: -1 });

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
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
