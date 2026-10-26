require('dotenv').config();
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER || '';
const emailPass = process.env.EMAIL_PASS || '';
const hasEmailCredentials = Boolean(emailUser && emailPass);

if (!hasEmailCredentials) {
    console.warn('Email credentials are missing; email sending will be skipped until EMAIL_USER and EMAIL_PASS are configured.');
}

const transporter = hasEmailCredentials ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass,
    },
}) : null;

if (transporter) {
    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP Connection Error:', error);
        } else {
            console.log('SMTP Server is ready to take our messages');
        }
    });
}

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

    if (!transporter || !hasEmailCredentials) {
        console.warn(`[Email Service] Skipping email to ${email} because credentials are not configured.`);
        return { success: false, skipped: true, error: 'Email credentials are not configured.' };
    }

    try {
        const mailOptions = {
            from: `"True Eats" <${emailUser}>`,
            to: email,
            subject: subject,
            text: text,
            html: html || wrapTemplate(`<p>${text}</p>`),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] SUCCESS: Email sent to ${email}. MessageID: ${info.messageId}`);
        return { success: true, info };
    } catch (error) {
        console.error('--- NODEMAILER ERROR ---');
        console.error(`To: ${email}`);
        console.error(`Subject: ${subject}`);
        console.error('Error Code:', error.code || 'N/A');
        console.error('Error Message:', error.message);
        if (error.stack) console.error('Stack Trace:', error.stack);
        console.error('-----------------------');

        return { success: false, error: error.message };
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

/**
 * Order Confirmation Email (Success)
 */
const sendOrderConfirmationEmail = async (email, { customerName, orderId, orderItems, shippingAddress, totalPrice, paymentMethod, paymentStatus }) => {
    const itemsHtml = orderItems.map(item => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; color: #1f2937; text-align: left;">${item.name}</td>
            <td style="padding: 12px; color: #1f2937; text-align: center;">x ${item.qty}</td>
            <td style="padding: 12px; color: #1f2937; text-align: right;">Rs. ${Math.round(item.price * item.qty)}</td>
        </tr>
    `).join('');

    const statusBadgeColor = paymentStatus === 'Paid' ? '#059669' : '#f59e0b';
    const statusBadgeText = paymentStatus === 'Paid' ? 'PAID' : 'PENDING';

    const html = wrapTemplate(`
        <h2 style="color: #1a4331; margin-top: 0;">Order Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order! We're excited to prepare your delicious meal.</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #1a4331; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1a4331;">Order ID: ${orderId}</p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">Placed on ${new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <h3 style="color: #1a4331; margin-top: 25px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
                <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; color: #1a4331; text-align: left; font-weight: 600;">Item</th>
                    <th style="padding: 12px; color: #1a4331; text-align: center; font-weight: 600;">Qty</th>
                    <th style="padding: 12px; color: #1a4331; text-align: right; font-weight: 600;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0; display: flex; justify-content: space-between; color: #1f2937;">
                <span>Subtotal:</span>
                <span>Rs. ${Math.round(totalPrice * 0.85)}</span>
            </p>
            <p style="margin: 8px 0; display: flex; justify-content: space-between; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                <span>Delivery & Fees:</span>
                <span>Rs. ${Math.round(totalPrice * 0.15)}</span>
            </p>
            <p style="margin: 8px 0; display: flex; justify-content: space-between; color: #1a4331; font-weight: bold; font-size: 16px;">
                <span>Total:</span>
                <span>Rs. ${Math.round(totalPrice)}</span>
            </p>
        </div>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Delivery Address</p>
            <p style="margin: 10px 0 0; color: #1f2937; line-height: 1.6;">${shippingAddress}</p>
        </div>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Payment Method</p>
                <p style="margin: 5px 0 0; color: #1f2937; font-weight: 600;">${paymentMethod}</p>
            </div>
            <div style="text-align: right;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Payment Status</p>
                <p style="margin: 5px 0 0; padding: 4px 12px; background: ${statusBadgeColor}; color: white; border-radius: 4px; font-weight: 600; font-size: 12px;">${statusBadgeText}</p>
            </div>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            You can track your order status in the True Eats app. We'll send you updates as your order is being prepared and dispatched.
        </p>
        <p style="color: #1a4331; font-weight: 600;">Thank you for choosing True Eats! 🌿</p>
    `);

    return sendEmail(email, `Order Confirmed - ${orderId}`, `Your order ${orderId} has been received!`, html);
};

/**
 * Order Payment Failed Email
 */
const sendOrderPaymentFailedEmail = async (email, { customerName, orderId, totalPrice, shippingAddress }) => {
    const html = wrapTemplate(`
        <h2 style="color: #dc2626; margin-top: 0;">Payment Failed</h2>
        <p>Hi ${customerName},</p>
        <p>Unfortunately, your payment could not be processed. Your order has been created but payment is still <strong>PENDING</strong>.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #7f1d1d;">Order ID: ${orderId}</p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">Amount: Rs. ${Math.round(totalPrice)}</p>
        </div>

        <h3 style="color: #1a4331; margin-top: 25px;">What happens next?</h3>
        <p>Your order is on hold waiting for payment confirmation. You have two options:</p>
        <ol style="color: #1f2937; line-height: 1.8;">
            <li><strong>Retry Payment:</strong> Log in to True Eats and complete the payment for this order.</li>
            <li><strong>Pay on Delivery:</strong> Contact us at support@trueeats.com to switch to Cash on Delivery (if available).</li>
        </ol>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Delivery Address</p>
            <p style="margin: 10px 0 0; color: #1f2937; line-height: 1.6;">${shippingAddress}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            If you believe this is a mistake or need help, please contact our support team immediately.
        </p>
        <p style="color: #1a4331; font-weight: 600;">We're here to help! 🌿</p>
    `);

    return sendEmail(email, `Payment Failed - ${orderId}`, `Payment issue for order ${orderId}`, html);
};

/**
 * Order Cancelled Email
 */
const sendOrderCancelledEmail = async (email, { customerName, orderId, reason }) => {
    const html = wrapTemplate(`
        <h2 style="color: #dc2626; margin-top: 0;">Order Cancelled</h2>
        <p>Hi ${customerName},</p>
        <p>Your order <strong>${orderId}</strong> has been cancelled.</p>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #7f1d1d;">Order ID: ${orderId}</p>
            ${reason ? `<p style="margin: 10px 0 0; color: #6b7280;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>

        <h3 style="color: #1a4331; margin-top: 25px;">What happens next?</h3>
        ${reason && reason.includes('Payment') ? `
            <p>Your payment will not be charged. If you believe this is a mistake, please contact our support team.</p>
        ` : `
            <p>Your order has been cancelled and removed from our system. If you placed an online payment, it will be refunded to your account within 3-5 business days.</p>
        `}

        <h3 style="color: #1a4331; margin-top: 25px;">Need Help?</h3>
        <p>If you'd like to place a new order or have any questions, feel free to reach out to us at:</p>
        <p style="color: #1a4331; font-weight: 600;">support@trueeats.com</p>

        <p style="color: #1a4331; font-weight: 600; margin-top: 25px;">We hope to serve you again! 🌿</p>
    `);

    return sendEmail(email, `Order Cancelled - ${orderId}`, `Your order ${orderId} has been cancelled`, html);
};

// Export all functions as an object
module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendOrderUpdateEmail,
    sendOrderConfirmationEmail,
    sendOrderPaymentFailedEmail,
    sendOrderCancelledEmail,
    sendCouponEmail,
    sendAdminMessageEmail,
    sendPasswordResetEmail,
};

