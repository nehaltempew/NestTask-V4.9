import { formatDate } from '../utils/dateUtils';
import type { Task } from '../types';
import type { Announcement } from '../types/announcement';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_API = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : '';
const APP_DOMAIN = 'https://nesttask.vercel.app'; // Replace with your actual domain

export async function sendTelegramMessage(text: string, photo?: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return false;
  }

  try {
    // If photo URL is provided, send photo with caption
    if (photo) {
      const response = await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          photo,
          caption: text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram photo message');
      }
    } else {
      // Send text message
      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send Telegram message');
      }
    }

    return true;
  } catch (error) {
    console.warn('Error sending Telegram notification:', error);
    return false;
  }
}

export async function sendTaskNotification(task: Task) {
  // Extract file URLs and get the first image if available
  const fileUrls = task.description.match(/\[.*?\]\((.*?)\)/g)?.map(match => {
    const [, url] = match.match(/\[.*?\]\((.*?)\)/) || [];
    return url;
  }) || [];

  const imageUrl = fileUrls.find(url => 
    url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  );

  const fileSection = fileUrls.length 
    ? `\n📎 <b>Attached Files:</b> ${fileUrls.length} file${fileUrls.length > 1 ? 's' : ''}`
    : '';

  const message = `
🆕 <b>New Task Alert!</b>

📌 <b>Title:</b> ${task.name}
📝 <b>Description:</b> ${task.description.split('\n')[0]} ${task.description.split('\n').length > 1 ? '...' : ''}
🏷️ <b>Category:</b> #${task.category}
📅 <b>Due Date:</b> ${formatDate(new Date(task.dueDate), 'MMMM d, yyyy')}
${task.isAdminTask ? '👑 <b>Admin Task</b>' : ''}${fileSection}

🔗 <b>Quick Links:</b>
• View Task: ${APP_DOMAIN}

#NestTask #${task.category} ${task.isAdminTask ? '' : ''} #Task
${task.isAdminTask ? '⚡️ Stay updated with NestTask!' : ''}`;

  return sendTelegramMessage(message, imageUrl);
}

export async function sendAnnouncementNotification(announcement: Announcement) {
  // Try to find an image URL in the announcement content
  const imageUrl = announcement.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i)?.[0];

  const message = `
📢 <b>Important Announcement</b>

🔔 <b>${announcement.title}</b>
${announcement.content.length > 200 
  ? announcement.content.substring(0, 200) + '...' 
  : announcement.content}

🔗 <b>Quick Links:</b>
• View Details: ${APP_DOMAIN}

#NestTask #Announcement #Update
⚡️ Stay updated with NestTask!`;

  return sendTelegramMessage(message, imageUrl);
}
