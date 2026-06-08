import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Seller from '../models/Seller';
import Shop from '../models/Shop';
import generateToken from '../utils/generateToken';
import { SellerRequest } from '../middlewares/authMiddleware';
import Product from '../models/Product';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PREMIUM_FOOD_IMAGES: { [key: string]: string } = {
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
  'roll': 'https://images.unsplash.com/photo-1626804475297-4160bbcfcb1d?auto=format&fit=crop&w=800&q=80',
  'wrap': 'https://images.unsplash.com/photo-1626804475297-4160bbcfcb1d?auto=format&fit=crop&w=800&q=80',
  'egg': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  'chowmein': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  'noodle': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  'momo': 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?auto=format&fit=crop&w=800&q=80',
  'dosa': 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=800&q=80',
  'idli': 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&w=800&q=80',
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  'paratha': 'https://images.unsplash.com/photo-1626200419188-f15e6249419a?auto=format&fit=crop&w=800&q=80',
  'chole': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  'bhature': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
  'thali': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  'roti': 'https://images.unsplash.com/photo-1626200419188-f15e6249419a?auto=format&fit=crop&w=800&q=80',
  'fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  'prawn': 'https://images.unsplash.com/photo-1559742811-822873691fc8?auto=format&fit=crop&w=800&q=80',
  'curry': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  'soup': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1414235077428-338988691f3b?auto=format&fit=crop&w=800&q=80'
};

const getPremiumImage = (name: string): string => {
  const lowerName = name.toLowerCase();
  for (const key in PREMIUM_FOOD_IMAGES) {
    if (lowerName.includes(key)) {
      return PREMIUM_FOOD_IMAGES[key];
    }
  }
  return PREMIUM_FOOD_IMAGES['default'];
};
export const registerSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerName, email, phone, password, shopName, shopAddress, pincode, category } = req.body;

    // 1. Check if seller email already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      res.status(400).json({ message: 'A seller with this email already exists' });
      return;
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the Seller document (status: pending)
    const newSeller = new Seller({
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
    const newShop = new Shop({
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
    savedSeller.shop_id = savedShop._id as any;
    await savedSeller.save();

    res.status(201).json({
      message: 'Seller and Shop registered successfully. Pending admin approval.',
      sellerId: savedSeller._id,
      shopId: savedShop._id,
    });
  } catch (error) {
    console.error('Error in registerSeller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const clearTestData = async (req: Request, res: Response): Promise<void> => {
  try {
    await Seller.deleteMany({});
    await Shop.deleteMany({});
    res.status(200).json({ message: 'All test sellers and shops have been deleted!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear data' });
  }
};

export const loginSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find seller
    const seller = await Seller.findOne({ email });
    if (!seller) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // 3. Check Shop Status (Approval)
    // We fetch the shop to check if it's approved
    const shop = await Shop.findById(seller.shop_id);
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
    const token = generateToken(seller._id.toString(), 'seller');

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

  } catch (error) {
    console.error('Error in loginSeller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const uploadAIMenu = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const extractNameAndPrice = (line: string) => {
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
      if (line.trim() === '') continue;

      const { name, price } = extractNameAndPrice(line);

      if (!name) continue;

      const image = getPremiumImage(name);

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

    await Product.insertMany(productsToCreate);

    res.status(201).json({ message: 'Menu generated successfully', count: productsToCreate.length });
  } catch (error) {
    console.error('Error in uploadAIMenu:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSellerMenu = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const shopId = req.seller.shop_id;
    const products = await Product.find({ shop_id: shopId })
      .populate('shop_id', 'name logo')
      .sort({ createdAt: -1 });
    
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getSellerMenu:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const uploadAIImageMenu = async (req: SellerRequest | any, res: Response): Promise<void> => {
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

    const genAI = new GoogleGenerativeAI(apiKey);
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
    } catch (e) {
      console.error("Failed to parse Gemini output:", text);
      res.status(500).json({ message: 'AI Parsing Error: Unable to read the menu format. Please try a clearer image.' });
      return;
    }

    const keywordImages: { [key: string]: string } = {
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
      if (!item.name || !item.price) continue;
      
      const lowerName = item.name.toLowerCase();
      const image = getPremiumImage(item.name);

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

    await Product.insertMany(productsToCreate);

    res.status(201).json({ 
      message: 'Image scanned and menu generated successfully', 
      count: productsToCreate.length 
    });
  } catch (error: any) {
    console.error('Error in uploadAIImageMenu:', error);
    // Send back the actual error message so the frontend can display it for debugging
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const deleteProduct = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const productId = req.params.id;
    const shopId = req.seller.shop_id;

    const product = await Product.findOneAndDelete({ _id: productId, shop_id: shopId });

    if (!product) {
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProduct = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const productId = req.params.id;
    const shopId = req.seller.shop_id;

    const updateData = { ...req.body };
    if (updateData.variants && updateData.variants.length > 0) {
      updateData.price = Number(updateData.variants[0].price);
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, shop_id: shopId },
      updateData,
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const bulkDeleteProducts = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const result = await Product.deleteMany({ _id: { $in: ids }, shop_id: shopId });

    res.status(200).json({ message: `${result.deletedCount} products deleted successfully` });
  } catch (error) {
    console.error('Error in bulkDeleteProducts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const toggleProductAvailability = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const productId = req.params.id;
    const { isAvailable } = req.body;
    const shopId = req.seller.shop_id;

    const product = await Product.findOneAndUpdate(
      { _id: productId, shop_id: shopId },
      { isAvailable },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({ message: 'Product availability updated', product });
  } catch (error) {
    console.error('Error in toggleProductAvailability:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getShopSettings = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;
    const shop = await Shop.findById(shopId).select('isOpen openingTime closingTime estimatedDeliveryTime upiId qrCodeImage logo bannerImage tagline themeColor themeColors shopType allowsDineIn location');

    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    res.status(200).json({ shop });
  } catch (error) {
    console.error('Error in getShopSettings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateShopSettings = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;
    const { isOpen, openingTime, closingTime, estimatedDeliveryTime, upiId, qrCodeImage, themeColor, themeColors, tagline, shopType, allowsDineIn, location } = req.body;

    const updateData: any = { isOpen, openingTime, closingTime, estimatedDeliveryTime, upiId, qrCodeImage, themeColor, themeColors, tagline };
    
    if (shopType) updateData.shopType = shopType;
    if (allowsDineIn !== undefined) updateData.allowsDineIn = allowsDineIn;
    if (location && location.coordinates && location.coordinates.length === 2) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates
      };
    }

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      updateData,
      { new: true }
    );

    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    res.status(200).json({ message: 'Shop settings updated', shop });
  } catch (error) {
    console.error('Error in updateShopSettings:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

import Order from '../models/Order';

export const getSellerOrders = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;
    
    // Auto-Cancel Logic: Any pending order older than 10 minutes is cancelled
    const timeoutThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    await Order.updateMany(
      { 
        shop_id: shopId, 
        status: 'pending', 
        createdAt: { $lt: timeoutThreshold } 
      },
      { 
        $set: { 
          status: 'cancelled', 
          cancelReason: 'Restaurant Unresponsive (Timeout)' 
        } 
      }
    );

    // Fetch orders for this shop, newest first
    const orders = await Order.find({ shop_id: shopId }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateOrderStatus = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { id } = req.params;
    const { status, isPaid, preparationTime } = req.body;
    const shopId = req.seller.shop_id;

    const order = await Order.findOneAndUpdate(
      { _id: id, shop_id: shopId },
      { $set: { status, isPaid, ...(isPaid ? { paidAt: new Date() } : {}), ...(preparationTime ? { preparationTime } : {}) } },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getDashboardAnalytics = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;
    
    // 1. Total Revenue (sum of all delivered orders)
    const revenueResult = await Order.aggregate([
      { $match: { shop_id: shopId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Orders Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await Order.countDocuments({
      shop_id: shopId,
      createdAt: { $gte: today }
    });

    // 3. Active Menu Items
    const activeItemsCount = await Product.countDocuments({
      shop_id: shopId,
      isAvailable: true
    });

    // 4. Recent Orders
    const recentOrders = await Order.find({ shop_id: shopId })
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      totalRevenue,
      ordersToday,
      activeItemsCount,
      recentOrders
    });
  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from '../utils/cloudinary';

export const updateProductImage = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const product = await Product.findOne({ _id: id, shop_id: shopId });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'samrat_market/products');

    product.image = imageUrl;
    product.isAIGenerated = false;
    await product.save();

    res.status(200).json({ message: 'Image updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const removeProductImage = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { id } = req.params;
    const shopId = req.seller.shop_id;

    const product = await Product.findOne({ _id: id, shop_id: shopId });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Delete the file if it's in local uploads
    if (product.image && product.image.includes('/uploads/')) {
      const filename = product.image.split('/uploads/')[1];
      const filepath = path.join(__dirname, '../../public/uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    product.image = getPremiumImage('default');
    product.isAIGenerated = true;
    await product.save();

    res.status(200).json({ message: 'Image removed successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const addProduct = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, price, category, description, variants } = req.body;
    
    if (!name || (!price && (!variants || variants.length === 0))) {
      res.status(400).json({ message: 'Name and price are required' });
      return;
    }

    const shopId = req.seller.shop_id;

    const newProduct = new Product({
      name,
      price: variants && variants.length > 0 ? Number(variants[0].price) : Number(price),
      category: category || 'general',
      description: description || '',
      shop_id: shopId,
      seller_id: req.seller._id,
      image: getPremiumImage(name),
      isAvailable: true,
      isAIGenerated: true, // We use true here so the UI shows the 'Add Real Photo' camera button
      variants: variants || []
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const generateItemDescription = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `Write a short, appetizing, 2-sentence description for a food/restaurant item named "${name}". Keep it professional, delicious-sounding, and under 150 characters. Just output the description directly, no quotes or introductory text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ description: text.trim() });
  } catch (error: any) {
    console.error('Error in generateItemDescription:', error);
    res.status(500).json({ message: error.message || 'Failed to generate description' });
  }
};

export const updateShopLogo = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'samrat_market/logos');

    shop.logo = imageUrl;
    await shop.save();

    res.status(200).json({ message: 'Logo updated successfully', shop });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateShopBanner = async (req: SellerRequest, res: Response): Promise<void> => {
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

    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'samrat_market/banners');

    shop.bannerImage = imageUrl;
    await shop.save();

    res.status(200).json({ message: 'Banner updated successfully', shop });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const removeShopBanner = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    shop.bannerImage = '';
    await shop.save();

    res.status(200).json({ message: 'Banner removed successfully', shop });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Please provide an email' });
      return;
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      res.status(404).json({ message: 'No seller found with this email' });
      return;
    }

    // Generate 6-digit Mock OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    seller.set('resetOtp', mockOtp);
    seller.set('resetOtpExpires', expires);
    await seller.save();

    // In a real scenario, you would send this OTP via email here using Nodemailer
    res.status(200).json({ 
      message: 'OTP sent to email successfully', 
      mockOtp // Mocking the email sending by returning it in the response
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Please provide email, OTP, and new password' });
      return;
    }

    const seller = await Seller.findOne({ email });
    if (!seller) {
      res.status(404).json({ message: 'No seller found with this email' });
      return;
    }

    const resetOtp = seller.get('resetOtp');
    const resetOtpExpires = seller.get('resetOtpExpires');

    if (!resetOtp || resetOtp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (!resetOtpExpires || resetOtpExpires < new Date()) {
      res.status(400).json({ message: 'OTP has expired' });
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    seller.password = hashedPassword;
    seller.set('resetOtp', undefined);
    seller.set('resetOtpExpires', undefined);
    await seller.save();

    res.status(200).json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUnreadNotifications = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const shopId = req.seller.shop_id;

    const unreadOrders = await Order.find({
      shop_id: shopId,
      status: 'pending',
      isSellerNotified: false
    }).sort({ createdAt: -1 });

    res.status(200).json(unreadOrders);
  } catch (error) {
    console.error('Error in getUnreadNotifications:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const dismissNotification = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { id } = req.params;
    const shopId = req.seller.shop_id;

    const order = await Order.findOneAndUpdate(
      { _id: id, shop_id: shopId },
      { isSellerNotified: true },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Notification dismissed' });
  } catch (error) {
    console.error('Error in dismissNotification:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const savePushSubscription = async (req: SellerRequest, res: Response): Promise<void> => {
  try {
    if (!req.seller) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    const { subscription } = req.body;
    
    await Seller.findByIdAndUpdate(req.seller._id, {
      pushSubscription: subscription
    });

    res.status(200).json({ message: 'Push subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
