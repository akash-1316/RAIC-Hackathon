
import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
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
      lowercase: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    teamName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    members: {
      type: [memberSchema],
      validate: {
        validator: members =>
          members.length >= 3 && members.length <= 4,
        message: 'A team must contain 3 to 4 members'
      }
    },

    tier: {
      type: String,
      enum: ['Basic', 'Advanced', 'Hard'],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active'
    },

    cancelledAt: Date
  },
  { timestamps: true }
);

// Generate registration ID automatically.
schema.pre('validate', function () {
  if (!this.registrationId) {
    this.registrationId =
      `RAIC-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
  }
});

// One active registration per participant.
// Cancelled registrations remain in history.
schema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' }
  }
);

export default mongoose.model('Registration', schema);
