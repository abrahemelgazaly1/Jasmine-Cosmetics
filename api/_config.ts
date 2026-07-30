import nodemailer from 'nodemailer';

// Environment/config shared by all serverless functions.
export const env = {
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
};

// Mailbox that receives a copy of every new order, and the account used to send it.
export const mailEnv = {
  user: process.env.EMAIL_USER ?? '',
  pass: process.env.EMAIL_PASS ?? '',
  to: process.env.ORDER_NOTIFICATION_EMAIL ?? 'Emanelnaggar7@gmail.com',
};

// Reused across warm serverless invocations instead of reconnecting per request.
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: mailEnv.user, pass: mailEnv.pass },
    });
  }
  return transporter;
}

interface OrderEmailPayload {
  _id: unknown;
  items: { name: string; price: number; qty: number; color?: string }[];
  customer: {
    fullName: string;
    email: string;
    governorate: string;
    address: string;
    phone1: string;
    phone2?: string;
  };
  subtotal: number;
  shipping: number;
  discount?: number;
  promoCode?: string;
  total: number;
  paymentMethod: string;
}

// Emails the shop owner the full order details. Never throws: a failed email must not break checkout.
export async function sendOrderNotificationEmail(order: OrderEmailPayload): Promise<void> {
  if (!mailEnv.user || !mailEnv.pass) {
    console.warn('EMAIL_USER/EMAIL_PASS not set; skipping new order notification email');
    return;
  }
  try {
    const orderCode = String(order._id).slice(-6).toUpperCase();
    const itemsRows = order.items
      .map(
        (it) =>
          `<tr><td style="padding:6px 10px;border:1px solid #eee;">${it.name}${
            it.color ? ` (${it.color})` : ''
          }</td><td style="padding:6px 10px;border:1px solid #eee;">${it.qty}</td><td style="padding:6px 10px;border:1px solid #eee;">${it.price} EGP</td></tr>`
      )
      .join('');

    await getTransporter().sendMail({
      from: `"Jasmine Cosmetics" <${mailEnv.user}>`,
      to: mailEnv.to,
      subject: `New order #${orderCode}`,
      html: `
        <h2>New order received &mdash; #${orderCode}</h2>
        <h3>Customer</h3>
        <p>
          Name: ${order.customer.fullName}<br/>
          Email: ${order.customer.email}<br/>
          Phone 1: ${order.customer.phone1}<br/>
          ${order.customer.phone2 ? `Phone 2: ${order.customer.phone2}<br/>` : ''}
          Governorate: ${order.customer.governorate}<br/>
          Address: ${order.customer.address}
        </p>
        <h3>Items</h3>
        <table style="border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:6px 10px;border:1px solid #eee;text-align:left;">Product</th>
              <th style="padding:6px 10px;border:1px solid #eee;text-align:left;">Qty</th>
              <th style="padding:6px 10px;border:1px solid #eee;text-align:left;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <h3>Totals</h3>
        <p>
          Subtotal: ${order.subtotal} EGP<br/>
          Shipping: ${order.shipping} EGP<br/>
          ${order.discount ? `Discount (${order.promoCode}): -${order.discount} EGP<br/>` : ''}
          <strong>Total: ${order.total} EGP</strong>
        </p>
        <p>Payment method: ${order.paymentMethod}</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send order notification email', err);
  }
}

export const SHIPPING_FEE = 120;

// Delivery fee per governorate (EGP).
export const SHIPPING_FEES: Record<string, number> = {
  Cairo: 75,
  Giza: 75,
  Alexandria: 75,
  Qaliubiya: 75,
  Menofia: 75,
  Gharbia: 75,
  Dakahlia: 75,
  'Kafr El Sheikh': 75,
  Damietta: 75,
  Beheira: 75,
  Sharkia: 65,
  Ismailia: 95,
  'Port Said': 95,
  Suez: 95,
  Fayoum: 110,
  'Beni Suef': 110,
  Minya: 110,
  Assiut: 110,
  Sohag: 130,
  Qena: 130,
  Luxor: 130,
  Aswan: 130,
  'Red Sea': 130,
  'New Valley': 140,
  'North Sinai': 140,
  'South Sinai': 140,
  Matrouh: 140,
};

// Returns the delivery fee for a governorate, falling back to the flat fee if unknown.
export function shippingFor(governorate?: string): number {
  return governorate && SHIPPING_FEES[governorate] != null
    ? SHIPPING_FEES[governorate]
    : SHIPPING_FEE;
}
