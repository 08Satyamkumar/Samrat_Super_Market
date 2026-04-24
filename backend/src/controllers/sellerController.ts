import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Seller from '../models/Seller';
import Shop from '../models/Shop';
import generateToken from '../utils/generateToken';

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
