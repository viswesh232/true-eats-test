const nodemailer = require('nodemailer');

// 1. Create the Transporter
// Using 'service: gmail' is recommended for Gmail to handle specific settings automatically
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is not defined in the environment variables!');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

/**
 * Standard Email Wrapper for True Eats
 * Provides a consistent, premium look for all emails.
 */
const wrapTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        .container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #1a4331;
            padding: 30px;
            text-align: center;
        }
        .header span {
            color: #fcd5ce;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .body {
            padding: 40px 30px;
            line-height: 1.6;
            color: #334155;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .button {
            display: inline-block;
            margin: 25px 0;
            padding: 14px 32px;
            background: #1a4331;
            color: #fcd5ce !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span>True Eats</span>
        </div>
        <div class="body">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} True Eats | The Way Food Was Meant To Be<br>
            If you have any questions, feel free to contact us.
        </div>
    </div>
</body>
</html>`;

/**
 * Generic Email Sender
 */
const sendEmail = async (email, subject, text, html) => {
    console.log(`[Email Service] Attempting to send email to: ${email}`);
    try {
        const mailOptions = {
            from: `"True Eats" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
            html: html || wrapTemplate(`<p>${text}</p>`),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] SUCCESS: Email sent to ${email}. MessageID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('--- NODEMAILER ERROR ---');
        console.error(`To: ${email}`);
        console.error(`Subject: ${subject}`);
        console.error('Error Code:', error.code || 'N/A');
        console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        console.error('-----------------------');
        
        // We throw the error so the controller can handle it if needed
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

/**
 * Specifically for Account Verification
 */
const sendVerificationEmail = async (email, verificationUrl) => {
    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Verify Your Email</h2>
        <p>Welcome to <strong>True Eats</strong>! We're excited to have you on board. To start ordering delicious, healthy food, please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Account</a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #1a4331;">${verificationUrl}</span>
        </p>
    `);

    return sendEmail(email, 'Verify Your True Eats Account', 'Please verify your account.', html);
};

/**
 * Specifically for Order Updates (Status changes, tracking)
 */
const sendOrderUpdateEmail = async (email, { customerName, orderId, message, trackingId, courierName }) => {
    const trackingHtml = trackingId ? `
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #64748b;">TRACKING INFO</p>
            <p style="margin: 5px 0 0; font-size: 16px; color: #1a4331; font-weight: bold;">
                ${courierName || 'Private Courier'}: ${trackingId}
            </p>
        </div>` : '';

    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Hi ${customerName},</h2>
        <p>We have an update regarding your order <strong style="color: #1a4331;">${orderId}</strong>:</p>
        <p style="font-size: 16px; padding: 15px; background: #f0fdf4; border-left: 4px solid #1a4331; border-radius: 4px;">
            ${message}
        </p>
        ${trackingHtml}
        <p style="font-size: 14px; color: #64748b;">You can check your order history in the app for more details.</p>
    `);

    return sendEmail(email, `Update on True Eats Order ${orderId}`, message, html);
};

/**
 * Specifically for Coupon/Offers
 */
const sendCouponEmail = async (email, { customerName, couponCode, discountText, message }) => {
    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Special Offer for ${customerName}!</h2>
        <p>${message || 'Enjoy a special discount on your next order from True Eats.'}</p>
        <div style="background: #1a4331; border-radius: 16px; padding: 30px; text-align: center; margin: 25px 0;">
            <p style="color: #fcd5ce; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Use Coupon Code</p>
            <div style="background: #fcd5ce; display: inline-block; padding: 15px 30px; border-radius: 8px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; color: #1a4331; letter-spacing: 5px;">${couponCode}</span>
            </div>
            <p style="color: #ffffff; margin: 15px 0 0; font-size: 18px; font-weight: 600;">${discountText}</p>
        </div>
        <p style="text-align: center; font-size: 13px; color: #64748b;">Terms and conditions apply. Valid for a limited time.</p>
    `);

    return sendEmail(email, 'Exclusive Offer from True Eats', 'You have a new coupon!', html);
};

/**
 * Specifically for Direct Admin Messages
 */
const sendAdminMessageEmail = async (email, { customerName, subject, message }) => {
    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Hello ${customerName},</h2>
        <p>A member of our team has sent you a message:</p>
        <div style="white-space: pre-wrap; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 20px 0;">
            ${message}
        </div>
        <p style="font-size: 14px; color: #64748b;">If you wish to reply, you can simply reply to this email.</p>
    `);

    return sendEmail(email, subject || 'Message from True Eats Support', message, html);
};

/**
 * Specifically for Password Reset
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Reset Your Password</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>Otherwise, click the button below to set a new password:</p>
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            This link will expire in 15 minutes.<br>
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #1a4331;">${resetUrl}</span>
        </p>
    `);

    return sendEmail(email, 'True Eats - Password Reset Request', 'Reset your password', html);
};

// Export all functions as an object
module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendOrderUpdateEmail,
    sendCouponEmail,
    sendAdminMessageEmail,
    sendPasswordResetEmail,
};

