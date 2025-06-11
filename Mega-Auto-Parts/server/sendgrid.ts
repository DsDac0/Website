import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent to:', params.to, 'Subject:', params.subject);
    return true; // Return true for testing when API key is not set
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateOrderConfirmationEmail(orderData: any): EmailParams {
  const itemsList = orderData.items.map((item: any) => 
    `• ${item.product.name} - Количина: ${item.quantity} - Цена: ${item.price} ден.`
  ).join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626; text-align: center;">MEGA AUTO PARTS</h2>
      <h3>Потврда за нарачка #${orderData.id}</h3>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4>Детали за нарачката:</h4>
        <p><strong>Име:</strong> ${orderData.firstName} ${orderData.lastName}</p>
        <p><strong>Емаил:</strong> ${orderData.email}</p>
        <p><strong>Телефон:</strong> ${orderData.phone}</p>
        <p><strong>Адреса:</strong> ${orderData.address}, ${orderData.city} ${orderData.postalCode}</p>
        <p><strong>Начин на плаќање:</strong> ${orderData.paymentMethod === 'cash' ? 'Готовина при достава' : orderData.paymentMethod === 'card' ? 'Картичка' : 'Банковна дознака'}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4>Нарачани производи:</h4>
        <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
        <hr style="margin: 15px 0;">
        <p style="font-size: 18px; font-weight: bold;">Вкупно: ${orderData.total} ден.</p>
      </div>

      <p>Ви благодариме за нарачката! Ќе ве контактираме наскоро за потврда и достава.</p>
      
      <div style="text-align: center; margin-top: 30px; color: #666;">
        <p>MEGA AUTO PARTS - Квалитетни автомобилски делови</p>
      </div>
    </div>
  `;

  return {
    to: orderData.email,
    from: 'orders@megaautoparts.mk',
    subject: `Потврда за нарачка #${orderData.id} - MEGA AUTO PARTS`,
    text: `Ви благодариме за нарачката!\n\nДетали:\n${itemsList}\n\nВкупно: ${orderData.total} ден.`,
    html
  };
}