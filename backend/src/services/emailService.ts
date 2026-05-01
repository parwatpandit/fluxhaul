import nodemailer from 'nodemailer';

export const sendOrderStatusEmail = async (
  toEmail: string,
  customerName: string,
  orderId: string,
  status: string
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const statusMessages: Record<string, string> = {
    pending: 'Your order has been placed and is pending confirmation.',
    processing: 'Your order is now being processed.',
    dispatched: 'Great news! Your order has been dispatched and is on the way.',
    delivered: 'Your order has been delivered. Thank you for using FluxHaul!',
  };

  const message = statusMessages[status] || 'Your order status is now: ' + status;

  await transporter.sendMail({
    from: '"FluxHaul" <' + process.env.EMAIL_USER + '>',
    to: toEmail,
    subject: 'FluxHaul Order Update - ' + status.toUpperCase(),
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #06b6d4;">FluxHaul Order Update</h2><p>Hi ' + customerName + ',</p><p>' + message + '</p><p><strong>Order ID:</strong> ' + orderId + '</p><br/><p>Thank you for using FluxHaul.</p></div>',
  });
};
