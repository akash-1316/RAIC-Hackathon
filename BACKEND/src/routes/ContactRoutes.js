
import { Router } from 'express';
import ContactEnquiry from '../models/ContactEnquiry.js';

const r = Router();

r.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        message: 'Please complete all enquiry fields.'
      });
    }

    const clean = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim()
    };

    if (
      clean.name.length > 100 ||
      clean.email.length > 150 ||
      clean.subject.length > 150 ||
      clean.message.length < 5 ||
      clean.message.length > 5000
    ) {
      return res.status(400).json({
        message: 'Please check the length of your enquiry details.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    const enquiry = await ContactEnquiry.create(clean);

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been submitted successfully.',
      enquiryId: enquiry._id
    });
  } catch (error) {
    next(error);
  }
});

export default r;
