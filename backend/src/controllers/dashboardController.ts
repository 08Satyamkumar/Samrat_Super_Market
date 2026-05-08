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

    const topShops = await Shop.find().populate('owner_id', 'name email').limit(5).sort({ createdAt: -1 });
    const recentOrders = await Order.find().populate('shop_id', 'name').limit(5).sort({ createdAt: -1 });

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

// @desc    Global Search across shops, sellers, and orders
// @route   GET /api/admin/search
// @access  Private/SuperAdmin
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim() === '') {
      return res.json({ shops: [], sellers: [], orders: [] });
    }

    const regex = new RegExp(query, 'i'); // Case-insensitive regex

    const shops = await Shop.find({ 
      $or: [{ name: regex }, { category: regex }] 
    }).limit(5).select('name logo category status');

    const sellers = await Seller.find({ 
      $or: [{ name: regex }, { email: regex }, { phone: regex }] 
    }).limit(5).select('name email phone status');

    let orders = [];
    if (query.match(/^[0-9a-fA-F]{24}$/)) {
      // Valid ObjectId, search by ID
      orders = await Order.find({ _id: query }).limit(5).populate('shop_id', 'name');
    } else {
      orders = await Order.find({ 
        $or: [{ customerName: regex }, { customerPhone: regex }, { status: regex }] 
      }).limit(5).populate('shop_id', 'name');
    }

    res.json({
      shops,
      sellers,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
