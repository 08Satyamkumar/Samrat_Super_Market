import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export const sendTelegramMessage = async (chatId: string, text: string, replyMarkup?: any) => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('Telegram Bot Token not configured. Message skipped:', text);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    await axios.post(url, payload);
    console.log(`Telegram message sent to ${chatId}`);
  } catch (error: any) {
    console.error('Error sending Telegram message:', error?.response?.data || error.message);
  }
};

export const sendOrderAlert = async (chatId: string, orderData: any) => {
  const { customerName, total_amount, orderItems, _id, paymentMethod } = orderData;
  
  const itemsText = orderItems.map((item: any) => `- ${item.qty}x ${item.name}${item.variant ? ` (${item.variant})` : ''}`).join('\n');
  
  const text = `🚨 <b>NEW ORDER RECEIVED!</b> 🚨\n\n` +
    `👤 <b>Customer:</b> ${customerName}\n` +
    `💵 <b>Amount:</b> ₹${total_amount} (${paymentMethod})\n\n` +
    `🛒 <b>Items:</b>\n${itemsText}\n\n` +
    `<i>Please accept or reject the order below.</i>`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ Accept Order', callback_data: `accept_${_id}` },
        { text: '❌ Reject', callback_data: `reject_${_id}` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, replyMarkup);
};
