"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./utils/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const path_1 = __importDefault(require("path"));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Database connection
(0, db_1.connectDB)();
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const sellerRoutes_1 = __importDefault(require("./routes/sellerRoutes"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Routes
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/seller', sellerRoutes_1.default);
app.use('/api/shops', shopRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running', environment: 'world-class' });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
