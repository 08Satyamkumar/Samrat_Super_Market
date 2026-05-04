import { Request, Response } from 'express';
import Shop from '../models/Shop';
import Seller from '../models/Seller';
import Product from '../models/Product';
import Order from '../models/Order';
// @route   GET /api/admin/shops
// @access  Private
export const getShops = async (req: Request, res: Response) => {
  try {
    const shops = await Shop.find().populate('owner_id', 'name email');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update shop status (Approve/Reject/Ban)
// @route   PUT /api/admin/shops/:id/status
// @access  Private
export const updateShopStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    shop.status = status;
    await shop.save();

    // If shop is activated, also update the seller's status to active
    // This prevents the seller document from being auto-deleted by MongoDB TTL index
    if (status === 'active') {
      await Seller.findByIdAndUpdate(shop.owner_id, { status: 'active' });
    }

    res.json({ message: `Shop status updated to ${status}`, shop });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all public products from active shops
// @route   GET /api/shops/products/all
// @access  Public
export const getAllPublicProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, type } = req.query;

    let validShopIds = null;
    let shopDistanceMap: Record<string, number> = {};

    // If location is provided, find nearby shops
    if (lat && lng) {
      const radiusInMeters = 15000; // 15 km max radius
      const geoNearQuery: any[] = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [parseFloat(lng as string), parseFloat(lat as string)] },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query: { status: 'active' } // only active shops
          }
        }
      ];

      if (type && type !== 'all' && type !== 'near_me') {
        geoNearQuery[0].$geoNear.query.shopType = type;
      }

      const nearbyShops = await Shop.aggregate(geoNearQuery);
      validShopIds = nearbyShops.map(s => s._id);
      
      nearbyShops.forEach(s => {
        shopDistanceMap[s._id.toString()] = s.distance; // stored in meters
      });
    } else if (type && type !== 'all' && type !== 'near_me') {
      const filteredShops = await Shop.find({ status: 'active', shopType: type as string }).select('_id');
      validShopIds = filteredShops.map(s => s._id);
    }

    let productQuery: any = { isAvailable: true };
    if (validShopIds !== null) {
      productQuery.shop_id = { $in: validShopIds };
    }

    const products = await Product.find(productQuery).populate({
      path: 'shop_id',
      match: { status: 'active' },
      select: 'name logo themeColor themeColors shopSlug estimatedDeliveryTime upiId shopType location allowsDineIn'
    });

    const validProducts = products.filter(p => p.shop_id != null);

    let finalProducts: any[] = validProducts;
    if (lat && lng) {
      finalProducts = validProducts.map(p => {
        const shopIdStr = (p.shop_id as any)._id.toString();
        const dist = shopDistanceMap[shopIdStr];
        return { ...p.toObject(), shopDistance: dist };
      }).sort((a: any, b: any) => (a.shopDistance || 0) - (b.shopDistance || 0));
    } else {
      finalProducts = validProducts.map(p => p.toObject()).sort(() => 0.5 - Math.random());
    }

    res.status(200).json(finalProducts);
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc    Get all active shops for user feed
// @route   GET /api/shops
// @access  Public
export const getAllActiveShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const shops = await Shop.find({ status: 'active' })
      .select('name logo bannerImage themeColors themeColor isOpen estimatedDeliveryTime shopSlug')
      .sort({ createdAt: -1 });
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching active shops:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc    Get public shop details by ID or Slug
// @route   GET /api/shops/:identifier
// @access  Public
export const getPublicShop = async (req: Request, res: Response) => {
  try {
    const identifier = req.params.identifier as string;
    // Check if it's a valid object ID, otherwise treat as slug (or just name for now since we don't have slug yet)
    let shop;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      shop = await Shop.findById(identifier).populate('owner_id', 'name phone email');
    } else {
      // Find by name, case insensitive
      shop = await Shop.findOne({ name: { $regex: new RegExp(`^${identifier.replace(/-/g, ' ')}$`, 'i') } }).populate('owner_id', 'name phone email');
    }

    if (!shop || shop.status !== 'active') {
      return res.status(404).json({ message: 'Shop not found or not active' });
    }

    res.json(shop);
  } catch (error) {
    console.error('Error fetching public shop:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get products for a public shop
// @route   GET /api/shops/:shopId/products
// @access  Public
export const getPublicShopProducts = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ shop_id: shopId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching public shop products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Create an order for a public shop
// @route   POST /api/shops/:shopId/orders
// @access  Public
export const createPublicOrder = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const { customerName, customerPhone, orderItems, total_amount, paymentMethod, userId, orderType } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      shop_id: shopId,
      user_id: userId,
      customerName,
      customerPhone,
      orderItems,
      total_amount,
      paymentMethod,
      isPaid: false, // Default unpaid for 'Pay at Shop/QR'
      status: 'pending',
      orderType: orderType || 'delivery'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
