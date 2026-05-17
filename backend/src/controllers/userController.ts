import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';

// @desc    Send Mock OTP to user
// @route   POST /api/users/send-otp
// @access  Public
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;

    if (!phone) {
      res.status(400).json({ message: 'Phone number is required' });
      return;
    }

    // Validate phone number format (exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
      return;
    }

    let user = await User.findOne({ phone });

    if (!user) {
      if (!name) {
        res.status(400).json({ message: 'Name is required for new users' });
        return;
      }
      user = await User.create({ name, phone });
    }

    // Generate a 6-digit mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    // In a real app, you would send the SMS here.
    // For Mock, we return it in the response so the frontend can display it.
    res.status(200).json({
      message: 'OTP sent successfully',
      mockOtp: otp // REMOVE THIS IN PRODUCTION WHEN USING REAL SMS
    });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc    Verify OTP and login
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ message: 'Phone and OTP are required' });
      return;
    }

    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      res.status(401).json({ message: 'Invalid or expired OTP' });
      return;
    }

    // Clear OTP after successful login
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

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
    console.error('Error in verifyOtp:', error);
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
