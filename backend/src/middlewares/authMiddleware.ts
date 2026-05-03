import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin';

interface JwtPayload {
  id: string;
  role: string;
}

export interface AdminRequest extends Request {
  admin?: any;
}

export interface SellerRequest extends Request {
  seller?: any;
}

export const protectAdmin = async (req: AdminRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({ message: 'Not authorized, admin not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const superAdminOnly = (req: AdminRequest, res: Response, next: NextFunction) => {
  if (req.admin && req.admin.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as SuperAdmin' });
  }
};

export const protectSeller = async (req: SellerRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // In a real app we'd fetch from Seller model: req.seller = await Seller.findById(decoded.id)
      // For now we just attach the decoded id since the Seller model might be simple.
      // But let's require the Seller model
      const Seller = require('../models/Seller').default;
      req.seller = await Seller.findById(decoded.id).select('-password');

      if (!req.seller) {
        return res.status(401).json({ message: 'Not authorized, seller not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export interface UserRequest extends Request {
  user?: any;
}

export const protectUser = async (req: UserRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      const User = require('../models/User').default;
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
