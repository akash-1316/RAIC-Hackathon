
import { Router } from 'express';
import path from 'path';
import fs from 'fs';

import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Tier from '../models/Tier.js';
import AuditLog from '../models/AuditLog.js';
import ContactEnquiry from '../models/ContactEnquiry.js';

import { auth, adminOnly } from '../middleware/auth.js';
import { audit } from '../utils/audit.js';

const r = Router();

// All admin routes require authentication and admin access.
r.use(auth, adminOnly);

// =====================================
// DASHBOARD
// =====================================

r.get('/dashboard', async (_q, res, next) => {
  try {
    const [
      participants,
      totalRegistrations,
      activeRegistrations,
      cancelledRegistrations,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      approvedAgg,
      tierCounts,
      recentPayments,
      recentRegistrations
    ] = await Promise.all([
      User.countDocuments({ role: 'participant' }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'active' }),
      Registration.countDocuments({ status: 'cancelled' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'approved' }),
      Payment.countDocuments({ status: 'rejected' }),

      Payment.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),

      Registration.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$tier',
            count: { $sum: 1 }
          }
        }
      ]),

      Payment.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('userId', 'name email')
        .populate('registrationId', 'registrationId teamName'),

      Registration.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('userId', 'name email')
    ]);

    res.json({
      stats: {
        participants,
        totalRegistrations,
        activeRegistrations,
        cancelledRegistrations,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        verifiedCollections: approvedAgg[0]?.total || 0
      },
      tierCounts,
      recentPayments,
      recentRegistrations
    });
  } catch (e) {
    next(e);
  }
});

// =====================================
// REGISTRATIONS
// =====================================

r.get('/registrations', async (req, res, next) => {
  try {
    const {
      status = 'all',
      tier = 'all',
      search = ''
    } = req.query;

    const f = {};

    if (status !== 'all') f.status = status;
    if (tier !== 'all') f.tier = tier;

    if (search) {
      f.$or = [
        { registrationId: { $regex: search, $options: 'i' } },
        { teamName: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Registration.find(f)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(500);

    const withPayment = await Promise.all(
      items.map(async x => {
        const p = await Payment.findOne({
          registrationId: x._id
        })
          .sort({ createdAt: -1 })
          .select('status transactionId amount');

        return {
          ...x.toObject(),
          latestPayment: p
        };
      })
    );

    res.json({
      items: withPayment,
      total: withPayment.length
    });
  } catch (e) {
    next(e);
  }
});

r.get('/registrations/:id', async (req, res, next) => {
  try {
    const item = await Registration.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!item) {
      return res.status(404).json({
        message: 'Registration not found.'
      });
    }

    const payments = await Payment.find({
      registrationId: item._id
    }).sort({ createdAt: -1 });

    res.json({
      registration: item,
      payments
    });
  } catch (e) {
    next(e);
  }
});

// =====================================
// PAYMENTS
// =====================================

r.get('/payments', async (req, res, next) => {
  try {
    const {
      status = 'all',
      search = '',
      tier = 'all',
      from = '',
      to = ''
    } = req.query;

    const f = status === 'all' ? {} : { status };

    const rows = await Payment.find(f)
      .populate('userId', 'name email phone')
      .populate('registrationId')
      .sort({ createdAt: -1 })
      .limit(1000);

    const q = String(search).toLowerCase();

    const items = rows.filter(p => {
      const reg = p.registrationId;

      if (tier !== 'all' && reg?.tier !== tier) {
        return false;
      }

      if (
        q &&
        !`${p.transactionId} ${reg?.registrationId} ${reg?.teamName} ${p.userId?.name} ${p.userId?.email}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }

      if (from && p.createdAt < new Date(from)) {
        return false;
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);

        if (p.createdAt > end) return false;
      }

      return true;
    });

    res.json({
      items,
      total: items.length
    });
  } catch (e) {
    next(e);
  }
});

r.patch('/payments/:id/review', async (req, res, next) => {
  try {
    const {
      status,
      remarks = ''
    } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Choose approved or rejected.'
      });
    }

    if (status === 'rejected' && !String(remarks).trim()) {
      return res.status(400).json({
        message: 'A rejection remark is required.'
      });
    }

    const p = await Payment.findById(req.params.id);

    if (!p) {
      return res.status(404).json({
        message: 'Payment not found.'
      });
    }

    if (p.status !== 'pending') {
      return res.status(409).json({
        message: 'Only pending payments can be reviewed.'
      });
    }

    if (status === 'approved') {
      const other = await Payment.findOne({
        registrationId: p.registrationId,
        status: 'approved',
        _id: { $ne: p._id }
      });

      if (other) {
        return res.status(409).json({
          message: 'This registration already has an approved payment.'
        });
      }

      p.receiptNumber =
        `RAIC-${new Date().getFullYear()}-${p._id.toString().slice(-8).toUpperCase()}`;
    }

    p.status = status;
    p.remarks = String(remarks).trim();
    p.reviewedBy = req.user._id;
    p.reviewedAt = new Date();

    await p.save();

    await audit(
      req,
      `payment_${status}`,
      'payment',
      p._id,
      `${p.transactionId}: ${p.remarks}`
    );

    res.json({
      payment: p,
      message:
        status === 'approved'
          ? 'Payment approved. Receipt is now available.'
          : 'Payment rejected.'
    });
  } catch (e) {
    next(e);
  }
});

// =====================================
// PARTICIPANTS
// =====================================

r.get('/participants', async (req, res, next) => {
  try {
    const search = String(req.query.search || '');

    const f = { role: 'participant' };

    if (search) {
      f.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(f)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({
      items: users,
      total: users.length
    });
  } catch (e) {
    next(e);
  }
});

r.patch('/participants/:id/status', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        role: 'participant'
      },
      {
        isActive: Boolean(req.body.isActive)
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'Participant not found.'
      });
    }

    await audit(
      req,
      user.isActive
        ? 'participant_activated'
        : 'participant_deactivated',
      'user',
      user._id,
      user.email
    );

    res.json({ user });
  } catch (e) {
    next(e);
  }
});

// =====================================
// ACTIVITY LOGS
// =====================================

r.get('/logs', async (req, res, next) => {
  try {
    const search = String(req.query.search || '');

    const f = search
      ? {
          $or: [
            { action: { $regex: search, $options: 'i' } },
            { adminEmail: { $regex: search, $options: 'i' } },
            { details: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const items = await AuditLog.find(f)
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({
      items,
      total: items.length
    });
  } catch (e) {
    next(e);
  }
});

// =====================================
// CONTACT ENQUIRIES
// =====================================

// GET ALL ENQUIRIES
r.get('/enquiries', async (req, res, next) => {
  try {
    const {
      status = 'all',
      search = ''
    } = req.query;

    const filter = {};

    if (status !== 'all') {
      if (!['read', 'unread'].includes(status)) {
        return res.status(400).json({
          message: 'Invalid enquiry status.'
        });
      }

      filter.status = status;
    }

    const query = String(search).trim();

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { subject: { $regex: query, $options: 'i' } },
        { message: { $regex: query, $options: 'i' } }
      ];
    }

    const [items, total, unread] = await Promise.all([
      ContactEnquiry.find(filter)
        .sort({ createdAt: -1 })
        .limit(500),

      ContactEnquiry.countDocuments(filter),

      ContactEnquiry.countDocuments({
        status: 'unread'
      })
    ]);

    res.json({
      items,
      total,
      unread
    });
  } catch (e) {
    next(e);
  }
});

// GET UNREAD ENQUIRY COUNT
r.get('/enquiries/unread-count', async (_req, res, next) => {
  try {
    const unread = await ContactEnquiry.countDocuments({
      status: 'unread'
    });

    res.json({ unread });
  } catch (e) {
    next(e);
  }
});

// MARK ENQUIRY AS READ
r.patch('/enquiries/:id/read', async (req, res, next) => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      {
        status: 'read',
        readAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        message: 'Enquiry not found.'
      });
    }

    await audit(
      req,
      'contact_enquiry_read',
      'contact_enquiry',
      enquiry._id,
      enquiry.subject
    );

    res.json({
      message: 'Enquiry marked as read.',
      enquiry
    });
  } catch (e) {
    next(e);
  }
});

// MARK ENQUIRY AS UNREAD
r.patch('/enquiries/:id/unread', async (req, res, next) => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      {
        status: 'unread',
        readAt: null
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!enquiry) {
      return res.status(404).json({
        message: 'Enquiry not found.'
      });
    }

    await audit(
      req,
      'contact_enquiry_unread',
      'contact_enquiry',
      enquiry._id,
      enquiry.subject
    );

    res.json({
      message: 'Enquiry marked as unread.',
      enquiry
    });
  } catch (e) {
    next(e);
  }
});

// DELETE ENQUIRY
r.delete('/enquiries/:id', async (req, res, next) => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndDelete(
      req.params.id
    );

    if (!enquiry) {
      return res.status(404).json({
        message: 'Enquiry not found.'
      });
    }

    await audit(
      req,
      'contact_enquiry_deleted',
      'contact_enquiry',
      enquiry._id,
      enquiry.subject
    );

    res.json({
      message: 'Enquiry deleted successfully.'
    });
  } catch (e) {
    next(e);
  }
});

// =====================================
// PAYMENT PROOF
// =====================================

r.get('/payments/:id/proof', async (req, res, next) => {
  try {
    const p = await Payment.findById(req.params.id);

    if (!p) {
      return res.status(404).json({
        message: 'Payment not found.'
      });
    }

    const dir = path.resolve(
      process.cwd(),
      process.env.UPLOAD_DIR || 'private_uploads'
    );

    const file = path.join(dir, p.proofFile);

    if (!fs.existsSync(file)) {
      return res.status(404).json({
        message: 'Proof file not found.'
      });
    }

    res.sendFile(file);
  } catch (e) {
    next(e);
  }
});

export default r;
