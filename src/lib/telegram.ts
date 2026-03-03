const TELEGRAM_BOT_TOKEN = '8797227038:AAHge3hqsmeuYBTW3lCAkvPwtBnpvcXeSSc';
const TELEGRAM_CHAT_IDS = ['868522391', '470478890', '6590263916'];

export async function sendOrderToTelegram(order: any) {
  try {
    const itemsText = order.items
      .map((item: any) => `- ${item.name} (${item.quantity} шт.) — ${item.price * (item.quantity || 1)} ₽`)
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

    // Send to all chat IDs
    const sendPromises = TELEGRAM_CHAT_IDS.map(chatId => 
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Telegram API Error for chat ${chatId}:`, errorData);
        }
      })
    );

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}
