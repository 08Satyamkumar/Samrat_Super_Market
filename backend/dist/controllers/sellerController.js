"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeShopBanner = exports.updateShopBanner = exports.updateShopLogo = exports.generateItemDescription = exports.addProduct = exports.removeProductImage = exports.updateProductImage = exports.getDashboardAnalytics = exports.updateOrderStatus = exports.getSellerOrders = exports.updateShopSettings = exports.getShopSettings = exports.toggleProductAvailability = exports.bulkDeleteProducts = exports.updateProduct = exports.deleteProduct = exports.uploadAIImageMenu = exports.getSellerMenu = exports.uploadAIMenu = exports.loginSeller = exports.clearTestData = exports.registerSeller = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Seller_1 = __importDefault(require("../models/Seller"));
const Shop_1 = __importDefault(require("../models/Shop"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const Product_1 = __importDefault(require("../models/Product"));
const generative_ai_1 = require("@google/generative-ai");
const registerSeller = async (req, res) => {
    try {
        const { ownerName, email, phone, password, shopName, shopAddress, pincode, category } = req.body;
        // 1. Check if seller email already exists
        const existingSeller = await Seller_1.default.findOne({ email });
        if (existingSeller) {
            res.status(400).json({ message: 'A seller with this email already exists' });
            return;
        }
        // 2. Hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // 3. Create the Seller document (status: pending)
        const newSeller = new Seller_1.default({
            name: ownerName,
            email,
            phone,
            password: hashedPassword,
            status: 'pending',
            kyc_verified: false,
            wallet_balance: 0,
        });
        const savedSeller = await newSeller.save();
        // 4. Create the Shop document (status: pending) linked to the Seller
        const newShop = new Shop_1.default({
            name: shopName,
            owner_id: savedSeller._id,
            category: category || 'food', // Default to food
            status: 'pending',
            logo: 'https://via.placeholder.com/150',
            isFeatured: false,
            commissionRate: 5, // Default 5%
        });
        // Additional fields like address/pincode can be added to the Shop model later
        // but for now we create the shop with existing schema fields.
        const savedShop = await newShop.save();
        // 5. Update Seller with the new Shop ID
        savedSeller.shop_id = savedShop._id;
        await savedSeller.save();
        res.status(201).json({
            message: 'Seller and Shop registered successfully. Pending admin approval.',
            sellerId: savedSeller._id,
            shopId: savedShop._id,
        });
    }
    catch (error) {
        console.error('Error in registerSeller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.registerSeller = registerSeller;
const clearTestData = async (req, res) => {
    try {
        await Seller_1.default.deleteMany({});
        await Shop_1.default.deleteMany({});
        res.status(200).json({ message: 'All test sellers and shops have been deleted!' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to clear data' });
    }
};
exports.clearTestData = clearTestData;
const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find seller
        const seller = await Seller_1.default.findOne({ email });
        if (!seller) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // 2. Check password
        const isMatch = await bcryptjs_1.default.compare(password, seller.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // 3. Check Shop Status (Approval)
        // We fetch the shop to check if it's approved
        const shop = await Shop_1.default.findById(seller.shop_id);
        if (!shop) {
            res.status(400).json({ message: 'No shop associated with this account' });
            return;
        }
        if (shop.status === 'pending') {
            res.status(403).json({ message: 'Your shop is still pending Super Admin approval. Please wait.' });
            return;
        }
        if (shop.status === 'suspended' || shop.status === 'banned') {
            res.status(403).json({ message: `Your shop has been ${shop.status}. Contact support.` });
            return;
        }
        // 4. Generate Token and Return Data
        const token = (0, generateToken_1.default)(seller._id.toString(), 'seller');
        res.status(200).json({
            message: 'Login successful',
            token,
            seller: {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                shop_id: seller.shop_id,
                shopName: shop.name,
            }
        });
    }
    catch (error) {
        console.error('Error in loginSeller:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.loginSeller = loginSeller;
const uploadAIMenu = async (req, res) => {
    try {
        const { menuText } = req.body;
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const sellerId = req.seller._id;
        const shopId = req.seller.shop_id;
        if (!menuText) {
            res.status(400).json({ message: 'Menu text is required' });
            return;
        }
        const lines = menuText.split('\n');
        const productsToCreate = [];
        // Simple simulated AI logic
        const premiumDescriptions = [
            "Authentic chef-special preparation crafted with premium ingredients.",
            "A luxurious twist on a classic favorite, slow-cooked to perfection.",
            "Mouth-watering and rich in flavor, guaranteed to satisfy your cravings.",
            "A delightful culinary experience with a perfect balance of spices."
        ];
        const extractNameAndPrice = (line) => {
            // Look for price at the end, handling currencies and dashes
            const priceRegex = /(?:[-:–—]?\s*(?:₹|Rs\.?|INR)?\s*)(\d+(?:\.\d{1,2})?)\s*$/i;
            const match = line.match(priceRegex);
            if (match) {
                const price = parseFloat(match[1]);
                const name = line.replace(match[0], '').replace(/[-:–—]\s*$/, '').trim();
                return { name, price };
            }
            // Fallback: look for a number with currency symbol anywhere
            const fallbackRegex = /(?:[-:–—]\s*|(?:₹|Rs\.?|INR)\s*)(\d+(?:\.\d{1,2})?)/i;
            const fallbackMatch = line.match(fallbackRegex);
            if (fallbackMatch) {
                const price = parseFloat(fallbackMatch[1]);
                const name = line.replace(fallbackMatch[0], '').replace(/[-:–—]\s*$/, '').trim();
                return { name, price };
            }
            return { name: line.replace(/[-:–—]\s*$/, '').trim(), price: 199 };
        };
        for (let line of lines) {
            if (line.trim() === '')
                continue;
            const { name, price } = extractNameAndPrice(line);
            if (!name)
                continue;
            // Premium Image Logic using an expanded guaranteed-to-work dictionary
            const keywordImages = {
                'paneer': 'https://images.unsplash.com/photo-1599487405270-bc07156f5274?auto=format&fit=crop&w=800&q=80',
                'chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
                'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
                'biryani': 'https://images.unsplash.com/photo-1563379091339-03b2184f4f31?auto=format&fit=crop&w=800&q=80',
                'naan': 'https://images.unsplash.com/photo-1626200419188-f15e6249419a?auto=format&fit=crop&w=800&q=80',
                'dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
                'coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
                'tea': 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=80',
                'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
                'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
                'fruit': 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
                'dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
                'sweet': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
                'jamun': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
                'default': 'https://images.unsplash.com/photo-1414235077428-338988691f3b?auto=format&fit=crop&w=800&q=80' // A much better, premium fine-dining default image
            };
            const lowerName = name.toLowerCase();
            let image = keywordImages['default'];
            for (const key in keywordImages) {
                if (lowerName.includes(key)) {
                    image = keywordImages[key];
                    break;
                }
            }
            const randomDesc = premiumDescriptions[Math.floor(Math.random() * premiumDescriptions.length)];
            productsToCreate.push({
                name,
                price,
                description: randomDesc,
                image,
                shop_id: shopId,
                seller_id: sellerId,
                isAIGenerated: true,
                isAvailable: true
            });
        }
        if (productsToCreate.length === 0) {
            res.status(400).json({ message: 'Could not parse any items from the text' });
            return;
        }
        await Product_1.default.insertMany(productsToCreate);
        res.status(201).json({ message: 'Menu generated successfully', count: productsToCreate.length });
    }
    catch (error) {
        console.error('Error in uploadAIMenu:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.uploadAIMenu = uploadAIMenu;
const getSellerMenu = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        const products = await Product_1.default.find({ shop_id: shopId })
            .populate('shop_id', 'name logo')
            .sort({ createdAt: -1 });
        res.status(200).json(products);
    }
    catch (error) {
        console.error('Error in getSellerMenu:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getSellerMenu = getSellerMenu;
const uploadAIImageMenu = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }
        const sellerId = req.seller._id;
        const shopId = req.seller.shop_id;
        // Use Gemini Vision AI
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ message: 'Gemini API key is missing' });
            return;
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: { responseMimeType: "application/json" }
        });
        // Prepare image
        const imageParts = [
            {
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            }
        ];
        const prompt = `
      Extract all food and drink items from this menu image perfectly.
      If there are categories (e.g., "HOT COFFEE", "SNACKS & QUICK BITES"), use them to generate a good description.
      If an item has variants (e.g., "French Fries (Regular)" vs "French Fries (Peri-Peri)"), extract them as separate complete items so they can be billed separately.
      
      Output MUST be a JSON array of objects.
      
      Format:
      [
        {
          "name": "Item Name (e.g., French Fries (Peri-Peri))",
          "price": 150,
          "description": "Delicious SNACKS & QUICK BITES.",
          "category": "Category Name"
        }
      ]
    `;
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();
        let parsedItems = [];
        try {
            parsedItems = JSON.parse(text);
            if (!Array.isArray(parsedItems)) {
                parsedItems = [parsedItems]; // Just in case it returns a single object
            }
        }
        catch (e) {
            console.error("Failed to parse Gemini output:", text);
            res.status(500).json({ message: 'AI Parsing Error: Unable to read the menu format. Please try a clearer image.' });
            return;
        }
        const keywordImages = {
            'paneer': 'https://images.unsplash.com/photo-1599487405270-bc07156f5274?auto=format&fit=crop&w=800&q=80',
            'chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
            'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
            'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
            'biryani': 'https://images.unsplash.com/photo-1563379091339-03b2184f4f31?auto=format&fit=crop&w=800&q=80',
            'naan': 'https://images.unsplash.com/photo-1626200419188-f15e6249419a?auto=format&fit=crop&w=800&q=80',
            'dal': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            'coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
            'tea': 'https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=80',
            'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
            'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
            'fruit': 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
            'dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
            'sweet': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
            'jamun': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
            'combo': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
            'fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=800&q=80',
            'pasta': 'https://images.unsplash.com/photo-1621996316541-0154c80b5114?auto=format&fit=crop&w=800&q=80',
            'shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
            'smoothie': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
            'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1ea9ce?auto=format&fit=crop&w=800&q=80',
            'brownie': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
            'default': 'https://images.unsplash.com/photo-1414235077428-338988691f3b?auto=format&fit=crop&w=800&q=80'
        };
        const productsToCreate = [];
        for (let item of parsedItems) {
            if (!item.name || !item.price)
                continue;
            const lowerName = item.name.toLowerCase();
            let image = keywordImages['default'];
            for (const key in keywordImages) {
                if (lowerName.includes(key)) {
                    image = keywordImages[key];
                    break;
                }
            }
            productsToCreate.push({
                name: item.name,
                price: Number(item.price),
                description: item.description || `Premium ${item.category || 'dish'} freshly prepared.`,
                image,
                shop_id: shopId,
                seller_id: sellerId,
                isAIGenerated: true,
                isAvailable: true
            });
        }
        if (productsToCreate.length === 0) {
            res.status(400).json({ message: 'Could not extract any items from the image.' });
            return;
        }
        await Product_1.default.insertMany(productsToCreate);
        res.status(201).json({
            message: 'Image scanned and menu generated successfully',
            count: productsToCreate.length
        });
    }
    catch (error) {
        console.error('Error in uploadAIImageMenu:', error);
        // Send back the actual error message so the frontend can display it for debugging
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};
exports.uploadAIImageMenu = uploadAIImageMenu;
const deleteProduct = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const productId = req.params.id;
        const shopId = req.seller.shop_id;
        const product = await Product_1.default.findOneAndDelete({ _id: productId, shop_id: shopId });
        if (!product) {
            res.status(404).json({ message: 'Product not found or not authorized' });
            return;
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.deleteProduct = deleteProduct;
const updateProduct = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const productId = req.params.id;
        const shopId = req.seller.shop_id;
        const product = await Product_1.default.findOneAndUpdate({ _id: productId, shop_id: shopId }, req.body, { new: true });
        if (!product) {
            res.status(404).json({ message: 'Product not found or not authorized' });
            return;
        }
        res.status(200).json({ message: 'Product updated successfully', product });
    }
    catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateProduct = updateProduct;
const bulkDeleteProducts = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'No product IDs provided' });
            return;
        }
        const shopId = req.seller.shop_id;
        const result = await Product_1.default.deleteMany({ _id: { $in: ids }, shop_id: shopId });
        res.status(200).json({ message: `${result.deletedCount} products deleted successfully` });
    }
    catch (error) {
        console.error('Error in bulkDeleteProducts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.bulkDeleteProducts = bulkDeleteProducts;
const toggleProductAvailability = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const productId = req.params.id;
        const { isAvailable } = req.body;
        const shopId = req.seller.shop_id;
        const product = await Product_1.default.findOneAndUpdate({ _id: productId, shop_id: shopId }, { isAvailable }, { new: true });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json({ message: 'Product availability updated', product });
    }
    catch (error) {
        console.error('Error in toggleProductAvailability:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.toggleProductAvailability = toggleProductAvailability;
const getShopSettings = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        const shop = await Shop_1.default.findById(shopId).select('isOpen openingTime closingTime estimatedDeliveryTime upiId qrCodeImage logo bannerImage tagline themeColor themeColors');
        if (!shop) {
            res.status(404).json({ message: 'Shop not found' });
            return;
        }
        res.status(200).json({ shop });
    }
    catch (error) {
        console.error('Error in getShopSettings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getShopSettings = getShopSettings;
const updateShopSettings = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        const { isOpen, openingTime, closingTime, estimatedDeliveryTime, upiId, qrCodeImage, themeColor, themeColors, tagline } = req.body;
        const shop = await Shop_1.default.findByIdAndUpdate(shopId, { isOpen, openingTime, closingTime, estimatedDeliveryTime, upiId, qrCodeImage, themeColor, themeColors, tagline }, { new: true });
        if (!shop) {
            res.status(404).json({ message: 'Shop not found' });
            return;
        }
        res.status(200).json({ message: 'Shop settings updated', shop });
    }
    catch (error) {
        console.error('Error in updateShopSettings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateShopSettings = updateShopSettings;
const Order_1 = __importDefault(require("../models/Order"));
const getSellerOrders = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        // Fetch orders for this shop, newest first
        const orders = await Order_1.default.find({ shop_id: shopId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error in getSellerOrders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getSellerOrders = getSellerOrders;
const updateOrderStatus = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { id } = req.params;
        const { status, isPaid, preparationTime } = req.body;
        const shopId = req.seller.shop_id;
        const order = await Order_1.default.findOneAndUpdate({ _id: id, shop_id: shopId }, { $set: { status, isPaid, ...(isPaid ? { paidAt: new Date() } : {}), ...(preparationTime ? { preparationTime } : {}) } }, { new: true });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.status(200).json({ message: 'Order updated successfully', order });
    }
    catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getDashboardAnalytics = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        // 1. Total Revenue (sum of all paid orders)
        const revenueResult = await Order_1.default.aggregate([
            { $match: { shop_id: shopId, isPaid: true } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        // 2. Orders Today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersToday = await Order_1.default.countDocuments({
            shop_id: shopId,
            createdAt: { $gte: today }
        });
        // 3. Active Menu Items
        const activeItemsCount = await Product_1.default.countDocuments({
            shop_id: shopId,
            isAvailable: true
        });
        // 4. Recent Orders
        const recentOrders = await Order_1.default.find({ shop_id: shopId })
            .sort({ createdAt: -1 })
            .limit(4);
        res.status(200).json({
            totalRevenue,
            ordersToday,
            activeItemsCount,
            recentOrders
        });
    }
    catch (error) {
        console.error('Error in getDashboardAnalytics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const updateProductImage = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { id } = req.params;
        const shopId = req.seller.shop_id;
        if (!req.file) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }
        const product = await Product_1.default.findOne({ _id: id, shop_id: shopId });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Save image to public/uploads
        const ext = path_1.default.extname(req.file.originalname) || '.jpg';
        const filename = `product_${id}_${Date.now()}${ext}`;
        const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
        // Ensure dir exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path_1.default.join(uploadDir, filename);
        fs_1.default.writeFileSync(uploadPath, req.file.buffer);
        const imageUrl = `http://localhost:5000/uploads/${filename}`;
        product.image = imageUrl;
        product.isAIGenerated = false;
        await product.save();
        res.status(200).json({ message: 'Image updated successfully', product });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateProductImage = updateProductImage;
const removeProductImage = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { id } = req.params;
        const shopId = req.seller.shop_id;
        const product = await Product_1.default.findOne({ _id: id, shop_id: shopId });
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Delete the file if it's in local uploads
        if (product.image && product.image.includes('/uploads/')) {
            const filename = product.image.split('/uploads/')[1];
            const filepath = path_1.default.join(__dirname, '../../public/uploads', filename);
            if (fs_1.default.existsSync(filepath)) {
                fs_1.default.unlinkSync(filepath);
            }
        }
        product.image = 'https://via.placeholder.com/300';
        product.isAIGenerated = true;
        await product.save();
        res.status(200).json({ message: 'Image removed successfully', product });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.removeProductImage = removeProductImage;
const addProduct = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { name, price, category, description } = req.body;
        if (!name || !price) {
            res.status(400).json({ message: 'Name and price are required' });
            return;
        }
        const shopId = req.seller.shop_id;
        const newProduct = new Product_1.default({
            name,
            price: Number(price),
            category: category || 'general',
            description: description || '',
            shop_id: shopId,
            seller_id: req.seller._id,
            image: 'https://via.placeholder.com/300',
            isAvailable: true,
            isAIGenerated: true // We use true here so the UI shows the 'Add Real Photo' camera button
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    }
    catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.addProduct = addProduct;
const generateItemDescription = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Item name is required' });
            return;
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({ message: 'Gemini API key is missing' });
            return;
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const prompt = `Write a short, appetizing, 2-sentence description for a food/restaurant item named "${name}". Keep it professional, delicious-sounding, and under 150 characters. Just output the description directly, no quotes or introductory text.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.status(200).json({ description: text.trim() });
    }
    catch (error) {
        console.error('Error in generateItemDescription:', error);
        res.status(500).json({ message: error.message || 'Failed to generate description' });
    }
};
exports.generateItemDescription = generateItemDescription;
const updateShopLogo = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        if (!req.file) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }
        const shop = await Shop_1.default.findById(shopId);
        if (!shop) {
            res.status(404).json({ message: 'Shop not found' });
            return;
        }
        // Save image to public/uploads
        const ext = path_1.default.extname(req.file.originalname) || '.jpg';
        const filename = `shop_logo_${shopId}_${Date.now()}${ext}`;
        const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
        // Ensure dir exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path_1.default.join(uploadDir, filename);
        fs_1.default.writeFileSync(uploadPath, req.file.buffer);
        const imageUrl = `http://localhost:5000/uploads/${filename}`;
        shop.logo = imageUrl;
        await shop.save();
        res.status(200).json({ message: 'Logo updated successfully', shop });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateShopLogo = updateShopLogo;
const updateShopBanner = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        if (!req.file) {
            res.status(400).json({ message: 'No image uploaded' });
            return;
        }
        const shop = await Shop_1.default.findById(shopId);
        if (!shop) {
            res.status(404).json({ message: 'Shop not found' });
            return;
        }
        // Save image to public/uploads
        const ext = path_1.default.extname(req.file.originalname) || '.jpg';
        const filename = `shop_banner_${shopId}_${Date.now()}${ext}`;
        const uploadDir = path_1.default.join(__dirname, '../../public/uploads');
        // Ensure dir exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const uploadPath = path_1.default.join(uploadDir, filename);
        fs_1.default.writeFileSync(uploadPath, req.file.buffer);
        const imageUrl = `http://localhost:5000/uploads/${filename}`;
        shop.bannerImage = imageUrl;
        await shop.save();
        res.status(200).json({ message: 'Banner updated successfully', shop });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateShopBanner = updateShopBanner;
const removeShopBanner = async (req, res) => {
    try {
        if (!req.seller) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const shopId = req.seller.shop_id;
        const shop = await Shop_1.default.findById(shopId);
        if (!shop) {
            res.status(404).json({ message: 'Shop not found' });
            return;
        }
        shop.bannerImage = '';
        await shop.save();
        res.status(200).json({ message: 'Banner removed successfully', shop });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.removeShopBanner = removeShopBanner;
