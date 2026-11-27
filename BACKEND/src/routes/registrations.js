
import { Router } from 'express';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Tier from '../models/Tier.js';
import { auth } from '../middleware/auth.js';

const r = Router();

r.use(auth);

// Academic year configuration
const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

// Eligibility based on the highest academic year in the team
const TIER_ELIGIBILITY = {
  1: ['Basic'],
  2: ['Basic', 'Advanced'],
  3: ['Advanced', 'Hard'],
  4: ['Hard']
};

const getEligibleTiers = members => {
  const highestYear = Math.max(
    ...members.map(member =>
      ACADEMIC_YEARS.indexOf(member.academicYear) + 1
    )
  );

  return TIER_ELIGIBILITY[highestYear] || [];
};

// CREATE TEAM REGISTRATION
r.post('/', async (req, res, next) => {
  try {
    const { teamName, collegeName, tier, members } = req.body;

    if (
      !teamName?.trim() ||
      !collegeName?.trim() ||
      !tier ||
      !Array.isArray(members) ||
      members.length < 3 ||
      members.length > 4
    ) {
      return res.status(400).json({
        message:
          'Team name, college, tier and 3 to 4 team members are required.'
      });
    }

    const clean = members.map(member => ({
      name: String(member.name || '').trim(),
      email: String(member.email || '').trim().toLowerCase(),
      phone: String(member.phone || '').trim(),
      academicYear: String(member.academicYear || '').trim()
    }));

    if (
      clean.some(
        member =>
          !member.name ||
          !/^\S+@\S+\.\S+$/.test(member.email) ||
          !/^[+()\d\s-]{7,20}$/.test(member.phone)
      )
    ) {
      return res.status(400).json({
        message:
          'Check every team member name, email and phone number.'
      });
    }

    // Validate academic years
    if (
      clean.some(
        member => !ACADEMIC_YEARS.includes(member.academicYear)
      )
    ) {
      return res.status(400).json({
        message:
          'Please select a valid academic year for every team member.'
      });
    }

    if (
      new Set(clean.map(member => member.email)).size !==
      clean.length
    ) {
      return res.status(400).json({
        message:
          'Team member email addresses must be unique.'
      });
    }

    if (
      await Registration.exists({
        userId: req.user._id,
        status: 'active'
      })
    ) {
      return res.status(409).json({
        message:
          'You already have an active team registration.'
      });
    }

    // Calculate eligible tiers using the highest year
    const eligibleTiers = getEligibleTiers(clean);

    if (!eligibleTiers.includes(tier)) {
      return res.status(400).json({
        message:
          `Your team is not eligible for the ${tier} tier. ` +
          `Eligible tiers: ${eligibleTiers.join(', ')}.`
      });
    }

    const selected = await Tier.findOne({
      name: tier,
      isActive: true
    });

    if (!selected) {
      return res.status(400).json({
        message: 'Selected tier is unavailable.'
      });
    }

    // Tier price is per participant.
    // Calculate the total on the backend.
    const totalAmount = selected.price * clean.length;

    const registration = await Registration.create({
      userId: req.user._id,
      teamName: teamName.trim(),
      collegeName: collegeName.trim(),
      tier: selected.name,
      amount: totalAmount,
      members: clean
    });

    res.status(201).json({ registration });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'You already have an active team registration.'
      });
    }

    next(error);
  }
});

// GET PARTICIPANT REGISTRATION
r.get('/mine', async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      userId: req.user._id,
      status: 'active'
    }).sort({ createdAt: -1 });

    const registrationHistory = await Registration.find({
      userId: req.user._id,
      status: 'cancelled'
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const payments = registration
      ? await Payment.find({
          registrationId: registration._id
        }).sort({ createdAt: -1 })
      : [];

    const paymentStatus =
      payments[0]?.status || 'not_submitted';

    const registrationView = registration
      ? {
          ...registration.toObject(),
          registrationStatus: 'confirmed',
          paymentStatus
        }
      : null;

    res.json({
      registration: registrationView,
      payments,
      registrationHistory,
      workflow: {
        hasRegistration: Boolean(registration),
        complete: Boolean(
          registration && paymentStatus === 'approved'
        ),
        paymentStatus,
        registrationStatus: registration?.status || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// CANCEL REGISTRATION
r.post('/:id/cancel', async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'active'
    });

    if (!registration) {
      return res.status(404).json({
        message: 'Active registration not found.'
      });
    }

    const latest = await Payment.findOne({
      registrationId: registration._id
    }).sort({ createdAt: -1 });

    if (
      latest &&
      ['pending', 'approved'].includes(latest.status)
    ) {
      return res.status(409).json({
        message:
          'A registration cannot be cancelled while payment is pending or approved.'
      });
    }

    registration.status = 'cancelled';
    registration.cancelledAt = new Date();

    await registration.save();

    res.json({
      message: 'Registration cancelled.',
      registration
    });
  } catch (error) {
    next(error);
  }
});

export default r;
