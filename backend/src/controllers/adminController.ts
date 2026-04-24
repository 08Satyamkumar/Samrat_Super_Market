import { Request, Response } from 'express';
import Admin from '../models/Admin';
import generateToken from '../utils/generateToken';
import { AdminRequest } from '../middlewares/authMiddleware';

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
