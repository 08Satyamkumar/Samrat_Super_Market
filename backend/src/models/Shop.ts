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
    bannerImage: {
      type: String,
      default: '', // Empty means fallback to default image
    },
    tagline: {
      type: String,
      default: 'Delicious Food, Delivered Fast.',
    },
    themeColor: {
      type: String,
      default: '#ffffff', // Default white theme
    },
    themeColors: {
      type: [String],
      default: ['#8b5cf6'],
    },
    shopSlug: {
      type: String,
      unique: true,
      sparse: true, // Allow nulls initially if older shops don't have it
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    commissionRate: {
      type: Number,
      default: 5, // 5% platform fee
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openingTime: {
      type: String,
      default: '10:00 AM',
    },
    closingTime: {
      type: String,
      default: '10:00 PM',
    },
    estimatedDeliveryTime: {
      type: String,
      default: '30-45 mins',
    },
    upiId: {
      type: String,
      default: '',
    },
    qrCodeImage: {
      type: String,
      default: '',
    },
    shopType: {
      type: String,
      enum: ['restaurant', 'mess', 'hotel', 'cafe', 'streetfood', 'other'],
      default: 'restaurant',
    },
    allowsDineIn: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
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

// GeoSpatial index for location-based search
shopSchema.index({ location: '2dsphere' });

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
