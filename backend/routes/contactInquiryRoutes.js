import express from 'express';
import ContactInquiry from '../models/ContactInquiry.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import sendEmail, { getEmailTemplate } from '../utils/sendEmail.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, async (req, res) => {
        try {
            const inquiries = await ContactInquiry.find({}).sort('-createdAt');
            res.json(inquiries);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const { name, email, phone, message } = req.body;
            const newInquiry = new ContactInquiry({ name, email, phone, message });
            const createdInquiry = await newInquiry.save();

            // Send Email Notification to Admin (Company Owner)
            try {
                const adminHtml = getEmailTemplate(
                    'New Inquiry Received',
                    `<p>Hello,</p>
                    <p>A new contact inquiry has been submitted on your website. Here are the details:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Client Name:</strong> ${name}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Email Address:</strong> ${email}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Phone Number:</strong> ${phone}</p>
                        <p style="margin: 0;"><strong>Message:</strong><br><br>${message}</p>
                    </div>`,
                    'View Inquiries',
                    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/inquiries`
                );

                await sendEmail({
                    email: process.env.RECEIVER_EMAIL, // Admin's email
                    subject: `New Inquiry from ${name}`,
                    html: adminHtml,
                });

            } catch (emailError) {
                console.error('Failed to send inquiry emails:', emailError);
                // We still return 201 because the database entry was successful
            }

            res.status(201).json(createdInquiry);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

router.route('/:id')
    .put(protect, admin, async (req, res) => {
        try {
            const inquiry = await ContactInquiry.findById(req.params.id);
            if (inquiry) {
                inquiry.isRead = req.body.isRead !== undefined ? req.body.isRead : inquiry.isRead;
                const updatedInquiry = await inquiry.save();
                res.json(updatedInquiry);
            } else {
                res.status(404).json({ message: 'Inquiry not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const inquiry = await ContactInquiry.findById(req.params.id);
            if (inquiry) {
                await inquiry.deleteOne();
                res.json({ message: 'Inquiry deleted' });
            } else {
                res.status(404).json({ message: 'Inquiry not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router;
