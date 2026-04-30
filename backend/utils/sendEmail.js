const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const wrap = (content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
  <div style="background:#1a4331;padding:24px 32px;display:flex;align-items:center;gap:12px;">
    <span style="color:#fcd5ce;font-size:22px;font-weight:900;letter-spacing:1px;">TRUE EATS</span>
  </div>
  <div style="padding:32px;">
    ${content}
  </div>
  <div style="background:#f4f7f6;padding:16px 32px;font-size:12px;color:#64748b;text-align:center;">
    Copyright True Eats | The Way Food Was Meant To Be
  </div>
</div>`;

const sendVerificationEmail = async (email, verificationUrl) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your True Eats Account',
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 16px;">Welcome to True Eats!</h2>
                <p style="color:#475569;line-height:1.6;">Thanks for signing up. Click the button below to verify your email and activate your account.</p>
                <a href="${verificationUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#1a4331;color:#fcd5ce;text-decoration:none;border-radius:10px;font-weight:bold;">
                    Verify My Account
                </a>
                <p style="font-size:13px;color:#94a3b8;">If the button does not work, copy this link: ${verificationUrl}</p>
            `),
        });
    } catch (error) {
        console.error('Verification email failed:', error.message);
    }
};

const sendOrderUpdateEmail = async (email, { customerName, orderId, message, trackingId, courierName }) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Update on your True Eats Order #${orderId}`,
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 8px;">Hi ${customerName},</h2>
                <p style="color:#475569;margin:0 0 20px;">Here is an update on your order <strong style="color:#1a4331;">#${orderId}</strong>:</p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:20px;">
                    <p style="margin:0;color:#065f46;font-size:15px;line-height:1.6;">${message}</p>
                </div>
                ${trackingId ? `
                <div style="background:#f8fafc;border-radius:10px;padding:16px;margin-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:bold;color:#64748b;text-transform:uppercase;">Tracking Information</p>
                    <p style="margin:0;font-size:15px;color:#1a4331;font-weight:bold;">${courierName || 'Private Courier'}: ${trackingId}</p>
                </div>` : ''}
                <p style="color:#64748b;font-size:13px;">Questions? Just reply to this email.</p>
            `),
        });
    } catch (error) {
        console.error('Order update email failed:', error.message);
        throw error;
    }
};

const sendCouponEmail = async (email, { customerName, couponCode, discountText, message }) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'A special offer for you from True Eats',
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 8px;">Hey ${customerName}!</h2>
                <p style="color:#475569;line-height:1.6;">${message || 'We have a special offer just for you!'}</p>
                <div style="background:#1a4331;border-radius:14px;padding:28px;text-align:center;margin:24px 0;">
                    <p style="color:rgba(252,213,206,0.7);margin:0 0 8px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Your Exclusive Coupon Code</p>
                    <div style="background:#fcd5ce;border-radius:10px;padding:14px 28px;display:inline-block;margin:8px 0;">
                        <span style="font-family:monospace;font-size:28px;font-weight:900;color:#1a4331;letter-spacing:4px;">${couponCode}</span>
                    </div>
                    <p style="color:#fcd5ce;margin:8px 0 0;font-size:14px;font-weight:bold;">${discountText}</p>
                </div>
                <p style="color:#64748b;font-size:13px;">Apply this code at checkout on your next order. Valid until admin removes it.</p>
            `),
        });
    } catch (error) {
        console.error('Coupon email failed:', error.message);
        throw error;
    }
};

const sendAdminMessageEmail = async (email, { customerName, subject, message }) => {
    try {
        await createTransporter().sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject || 'A message from True Eats',
            html: wrap(`
                <h2 style="color:#1a4331;margin:0 0 8px;">Hi ${customerName},</h2>
                <p style="color:#475569;line-height:1.6;margin:0 0 16px;">Our team sent you the following update:</p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
                    <p style="margin:0;color:#334155;line-height:1.7;white-space:pre-line;">${message}</p>
                </div>
                <p style="color:#64748b;font-size:13px;margin-top:18px;">If you need help, reply to this email or contact our support team.</p>
            `),
        });
    } catch (error) {
        console.error('Admin message email failed:', error.message);
        throw error;
    }
};

const sendEmail = async (email, subject, text, html) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text,
            html,
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.log('Email not sent');
        console.log(error);
        throw error;
    }
};

module.exports = sendEmail;
module.exports.sendOrderUpdateEmail = sendOrderUpdateEmail;
module.exports.sendCouponEmail = sendCouponEmail;
module.exports.sendAdminMessageEmail = sendAdminMessageEmail;
module.exports.sendVerificationEmail = sendVerificationEmail;
