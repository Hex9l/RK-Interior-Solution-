import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const isHtml = !!options.html;

    // Define the email options
    const message = {
        from: `"${process.env.SENDER_NAME || 'R K Interior Solution'}" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // Send the email
    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
};

// Professional Branded Template
export const getEmailTemplate = (title, body, buttonText, buttonUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; }
            .header { background-color: #000000; padding: 40px 20px; text-align: center; }
            .logo { background-color: #D4AF37; display: inline-block; padding: 10px 20px; color: #000; font-weight: bold; font-size: 24px; letter-spacing: 2px; }
            .content { padding: 40px 30px; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eeeeee; }
            .button { background-color: #D4AF37; color: #000 !important; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold; margin-top: 25px; text-transform: uppercase; letter-spacing: 1px; }
            h1 { color: #D4AF37; margin-bottom: 20px; font-size: 24px; }
            .divider { height: 1px; background-color: #D4AF37; width: 50px; margin: 20px 0; opacity: 0.5; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">RK</div>
                <div style="color: #fff; margin-top: 10px; font-size: 12px; letter-spacing: 5px; text-transform: uppercase;">Interior Solution</div>
            </div>
            <div class="content">
                <h1>${title}</h1>
                <div class="divider"></div>
                ${body}
                <center>
                    <a href="${buttonUrl}" class="button">${buttonText}</a>
                </center>
                <p style="margin-top: 40px; font-size: 13px; color: #888;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${buttonUrl}" style="color: #D4AF37;">${buttonUrl}</a>
                </p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} R K Interior Solution. All rights reserved.<br>
                Premium Interior Design & Furniture
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getOtpEmailTemplate = (title, body, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; }
            .header { background-color: #000000; padding: 40px 20px; text-align: center; }
            .logo { background-color: #D4AF37; display: inline-block; padding: 10px 20px; color: #000; font-weight: bold; font-size: 24px; letter-spacing: 2px; }
            .content { padding: 40px 30px; line-height: 1.6; }
            .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eeeeee; }
            h1 { color: #D4AF37; margin-bottom: 20px; font-size: 24px; }
            .divider { height: 1px; background-color: #D4AF37; width: 50px; margin: 20px 0; opacity: 0.5; }
            .otp-box { background-color: #000; border: 2px dashed #D4AF37; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 16px; margin: 30px 0; color: #D4AF37; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">RK</div>
                <div style="color: #fff; margin-top: 10px; font-size: 12px; letter-spacing: 5px; text-transform: uppercase;">Interior Solution</div>
            </div>
            <div class="content">
                <h1>${title}</h1>
                <div class="divider"></div>
                ${body}
                <div class="otp-box">${otp}</div>
                <p style="margin-top: 40px; font-size: 13px; color: #888;">
                    This code is valid for 10 minutes. If you did not request this, please ignore this email to maintain security.
                </p>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} R K Interior Solution. All rights reserved.<br>
                Premium Interior Design & Furniture
            </div>
        </div>
    </body>
    </html>
    `;
};

export default sendEmail;
