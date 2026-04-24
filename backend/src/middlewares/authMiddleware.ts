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
