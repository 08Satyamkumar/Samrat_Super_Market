import { Request, Response } from 'express';
import Shop from '../models/Shop';
import Seller from '../models/Seller';
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
