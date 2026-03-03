const TELEGRAM_BOT_TOKEN = '8797227038:AAHge3hqsmeuYBTW3lCAkvPwtBnpvcXeSSc';
const TELEGRAM_USER_ID = '868522391';

export async function sendOrderToTelegram(order: any) {
  try {
    const itemsText = order.items
      .map((item: any) => `- ${item.name} (${item.quantity} шт.) — ${item.price * item.quantity} ₽`)
      .join('\n');

    const customerInfo = order.customer ? `
👤 **Покупатель:** ${order.customer.name || 'Не указано'}
📞 **Телефон:** ${order.customer.phone || 'Не указано'}
📧 **Email:** ${order.customer.email || 'Не указано'}` : '';

    const message = `
🆕 **Новый заказ #${order.id}**

📅 **Дата:** ${new Date(order.createdAt).toLocaleString('ru-RU')}
💰 **Сумма:** ${order.total} ₽
📍 **Адрес:** ${order.address || 'Не указан'}
${customerInfo}

🛒 **Товары:**
${itemsText}

${order.userId !== 'guest' ? `🆔 **User ID:** ${order.userId}` : '👤 **Гостевой заказ**'}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_USER_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API Error:', errorData);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}
