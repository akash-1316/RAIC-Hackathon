
import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    transactionId: {
      type: String,
      required: true,
      trim: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    proofFile: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },

    remarks: {
      type: String,
      default: '',
      trim: true
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    reviewedAt: Date,

    receiptNumber: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Each transaction ID must be unique.
schema.index(
  { transactionId: 1 },
  { unique: true }
);

// Allow only one pending payment per registration.
schema.index(
  { registrationId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

// Allow only one approved payment per registration.
schema.index(
  { registrationId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'approved' }
  }
);

// Efficiently retrieve a participant's payments.
schema.index({ userId: 1 });

export default mongoose.model('Payment', schema);
