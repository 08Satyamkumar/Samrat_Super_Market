"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGO_URI;
        // We are now using a real MongoDB Atlas cluster!
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host} (Ready for Testing!)`);
    }
    catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
