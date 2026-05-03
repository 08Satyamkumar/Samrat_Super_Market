import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Login or register user via phone
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      res.status(400).json({ message: 'Name and phone are required' });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    // If not, create a new user
    if (!user) {
      user = await User.create({
        name,
        phone,
      });
    }

    const token = generateToken(user._id.toString(), 'user');

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

import { UserRequest } from '../middlewares/authMiddleware';
import Order from '../models/Order';

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private (User)
export const getUserOrders = async (req: UserRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const orders = await Order.find({ user_id: req.user._id })
      .populate('shop_id', 'name logo themeColors themeColor')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
