"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAdmin = exports.getAdminProfile = exports.authAdmin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin_1.default.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
        admin.lastLoginIP = req.ip || req.socket.remoteAddress;
        await admin.save();
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: (0, generateToken_1.default)(admin._id.toString(), admin.role),
        });
    }
    else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};
exports.authAdmin = authAdmin;
// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Private
const getAdminProfile = async (req, res) => {
    const admin = await Admin_1.default.findById(req.admin._id);
    if (admin) {
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            lastLoginIP: admin.lastLoginIP,
        });
    }
    else {
        res.status(404).json({ message: 'Admin not found' });
    }
};
exports.getAdminProfile = getAdminProfile;
// @desc    Register a new admin (SuperAdmin only)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
const registerAdmin = async (req, res) => {
    const { name, email, password, role } = req.body;
    const adminExists = await Admin_1.default.findOne({ email });
    if (adminExists) {
        return res.status(400).json({ message: 'Admin already exists' });
    }
    const admin = await Admin_1.default.create({
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
    }
    else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};
exports.registerAdmin = registerAdmin;
