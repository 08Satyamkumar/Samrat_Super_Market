import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Seller from '../models/Seller';
import Order from '../models/Order';
import { sendTelegramMessage } from '../utils/telegram';
import { protectSeller } from '../middlewares/authMiddleware';

const router = express.Router();

// @route   GET /api/telegram/link-token
// @desc    Generate a unique token for the seller to link their Telegram
// @access  Private (Seller)
router.get('/link-token', protectSeller, async (req: any, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) return res.status(404).json({ message: 'Seller not found' });

    let token = seller.telegramLinkToken;
    if (!token) {
      token = uuidv4();
      seller.telegramLinkToken = token;
      await seller.save();
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'FoodUniverseBot';
    const linkUrl = `https://t.me/${botUsername}?start=${token}`;
    
    res.json({ token, linkUrl, isLinked: !!seller.telegramChatId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/telegram/webhook
// @desc    Telegram Webhook handler
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const { message, callback_query } = req.body;

    // Handle /start <token> command (Linking account)
    if (message && message.text && message.text.startsWith('/start ')) {
      const token = message.text.split(' ')[1];
      const chatId = message.chat.id.toString();

      const seller = await Seller.findOne({ telegramLinkToken: token });
      if (seller) {
        seller.telegramChatId = chatId;
        await seller.save();
        
        await sendTelegramMessage(chatId, `✅ <b>Account Linked Successfully!</b>\n\nWelcome ${seller.name}, you will now receive all new order alerts right here.`);
      } else {
        await sendTelegramMessage(chatId, '❌ Invalid or expired linking token.');
      }
      return res.sendStatus(200);
    }

    // Handle Inline Button Clicks (Accept/Reject Order)
    if (callback_query) {
      const data = callback_query.data; // e.g. "accept_645ds234..." or "reject_645ds234..."
      const chatId = callback_query.message.chat.id.toString();

      const seller = await Seller.findOne({ telegramChatId: chatId });
      if (!seller) return res.sendStatus(200);

      const [action, orderId] = data.split('_');
      
      const order = await Order.findById(orderId);
      if (!order) {
        await sendTelegramMessage(chatId, '❌ Order not found.');
        return res.sendStatus(200);
      }

      if (order.status !== 'pending') {
        const text = `Order is already <b>${order.status}</b>.`;
        await sendTelegramMessage(chatId, text);
        return res.sendStatus(200);
      }

      if (action === 'accept') {
        order.status = 'processing';
        await order.save();
        await sendTelegramMessage(chatId, `✅ You have <b>ACCEPTED</b> the order for ${order.customerName}.\n<i>Status updated to 'Processing'.</i>`);
      } else if (action === 'reject') {
        order.status = 'cancelled';
        await order.save();
        await sendTelegramMessage(chatId, `❌ You have <b>REJECTED</b> the order for ${order.customerName}.`);
      }

      return res.sendStatus(200);
    }

    res.sendStatus(200); // Always acknowledge Webhook
  } catch (error) {
    console.error('Telegram Webhook error:', error);
    res.sendStatus(500);
  }
});

export default router;
