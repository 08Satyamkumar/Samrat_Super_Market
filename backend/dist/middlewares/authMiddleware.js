"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectUser = exports.protectSeller = exports.superAdminOnly = exports.protectAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const protectAdmin = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.admin = await Admin_1.default.findById(decoded.id).select('-password');
            if (!req.admin) {
                return res.status(401).json({ message: 'Not authorized, admin not found' });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protectAdmin = protectAdmin;
const superAdminOnly = (req, res, next) => {
    if (req.admin && req.admin.role === 'SuperAdmin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized as SuperAdmin' });
    }
};
exports.superAdminOnly = superAdminOnly;
const protectSeller = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // In a real app we'd fetch from Seller model: req.seller = await Seller.findById(decoded.id)
            // For now we just attach the decoded id since the Seller model might be simple.
            // But let's require the Seller model
            const Seller = require('../models/Seller').default;
            req.seller = await Seller.findById(decoded.id).select('-password');
            if (!req.seller) {
                return res.status(401).json({ message: 'Not authorized, seller not found' });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protectSeller = protectSeller;
const protectUser = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const User = require('../models/User').default;
            req.user = await User.findById(decoded.id);
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protectUser = protectUser;
