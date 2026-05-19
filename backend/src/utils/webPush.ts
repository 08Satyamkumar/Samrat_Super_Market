import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn('VAPID keys are missing from environment variables. Web Push will not work.');
}

export const sendPushNotification = async (subscription: any, payload: any) => {
  try {
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};
