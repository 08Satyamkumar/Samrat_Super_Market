import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpires: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'blocked'],
      default: 'pending',
    },
    kyc_verified: {
      type: Boolean,
      default: false,
    },
    wallet_balance: {
      type: Number,
      default: 0,
    },
    pushSubscription: {
      type: Object,
      default: null,
    },
    telegramChatId: {
      type: String,
      default: null,
    },
    telegramLinkToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete pending sellers after 24 hours (86400 seconds)
sellerSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { status: 'pending' } }
);

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;
