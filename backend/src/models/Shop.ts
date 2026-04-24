import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'veg', 'nonveg', 'fashion', 'electronics', 'other'],
      default: 'food',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'banned'],
      default: 'pending',
    },
    logo: {
      type: String, // Cloudinary URL
      default: 'https://via.placeholder.com/150',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    commissionRate: {
      type: Number,
      default: 5, // 5% platform fee
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete pending shops after 24 hours
shopSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { status: 'pending' } }
);

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
