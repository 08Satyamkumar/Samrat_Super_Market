import { Request, Response } from 'express';
import Admin from '../models/Admin';
import generateToken from '../utils/generateToken';
import { AdminRequest } from '../middlewares/authMiddleware';
import User from '../models/User';
import Order from '../models/Order';

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
export const authAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await (admin as any).matchPassword(password))) {
    admin.lastLoginIP = req.ip || req.socket.remoteAddress;
    await admin.save();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id.toString(), admin.role),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Private
export const getAdminProfile = async (req: AdminRequest, res: Response) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLoginIP: admin.lastLoginIP,
    });
  } else {
    res.status(404).json({ message: 'Admin not found' });
  }
};

// @desc    Register a new admin (SuperAdmin only)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
export const registerAdmin = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    return res.status(400).json({ message: 'Admin already exists' });
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || 'SupportAdmin',
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid admin data' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user_id',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          status: 1,
          createdAt: 1,
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $reduce: {
              input: '$orders',
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ['$$this.status', 'delivered'] }, 
                  { $add: ['$$value', '$$this.total_amount'] },
                  '$$value'
                ]
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users CRM data:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.set('status', status);
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-otp');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user_id: user._id })
      .populate('shop_id', 'name logo')
      .sort({ createdAt: -1 });

    const totalSpent = orders.reduce((acc, order) => order.status === 'delivered' ? acc + order.total_amount : acc, 0);

    res.status(200).json({
      user,
      stats: {
        totalOrders: orders.length,
        totalSpent
      },
      orders
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error while fetching user details' });
  }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check duplicate phone number if changing phone
    if (phone && phone !== user.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({ message: 'Invalid phone number format. Must be 10 digits.' });
        return;
      }

      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        res.status(400).json({ message: 'A user with this phone number already exists' });
        return;
      }
      user.phone = phone;
    }

    if (name) user.name = name;
    if (email !== undefined) user.email = email;

    await user.save();

    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error while updating user details' });
  }
};


