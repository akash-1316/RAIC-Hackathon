
import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ['unread', 'read'],
      default: 'unread'
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

contactEnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model(
  'ContactEnquiry',
  contactEnquirySchema
);
