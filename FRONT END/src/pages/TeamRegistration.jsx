
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';

const MIN_MEMBERS = 3;
const MAX_MEMBERS = 4;

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

// Eligibility based on the highest academic year
const TIER_ELIGIBILITY = {
  1: ['Basic'],
  2: ['Basic', 'Advanced'],
  3: ['Advanced', 'Hard'],
  4: ['Hard']
};

// Create empty team member
const createEmptyMember = () => ({
  name: '',
  email: '',
  phone: '',
  academicYear: ''
});

// Calculate eligible tiers for the entire team
const getEligibleTiers = members => {
  if (
    !members.length ||
    members.some(member => !member.academicYear)
  ) {
    return [];
  }

  const years = members.map(member =>
    ACADEMIC_YEARS.indexOf(member.academicYear) + 1
  );

  if (years.some(year => year < 1 || year > 4)) {
    return [];
  }

  const highestYear = Math.max(...years);

  return TIER_ELIGIBILITY[highestYear] || [];
};

// Display Advanced as Medium without changing backend tier name
const getDisplayTierName = tierName => {
  return tierName === 'Advanced' ? 'Medium' : tierName;
};

// Tier descriptions
const getTierDescription = tierName => {
  const descriptions = {
    Basic: 'Beginner level',
    Advanced: 'Intermediate level',
    Hard: 'Advanced level'
  };

  return descriptions[tierName] || '';
};

export default function TeamRegistration() {
  const navigate = useNavigate();

  const [tiers, setTiers] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    teamName: '',
    collegeName: '',
    tier: '',
    members: Array.from(
      { length: MIN_MEMBERS },
      createEmptyMember
    )
  });

  // LOAD AVAILABLE TIERS
  useEffect(() => {
    let active = true;

    async function loadTiers() {
      try {
        const data = await apiRequest('/tiers');

        if (!active) return;

        const availableTiers = (data.tiers || []).filter(
          tier =>
            tier.isActive !== false &&
            tier.active !== false
        );

        setTiers(availableTiers);

        setForm(previous => ({
          ...previous,
          tier: availableTiers.some(
            tier =>
              (tier.name || tier.tier) === previous.tier
          )
            ? previous.tier
            : ''
        }));
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Unable to load available tiers.'
          );
        }
      } finally {
        if (active) {
          setLoadingTiers(false);
        }
      }
    }

    loadTiers();

    return () => {
      active = false;
    };
  }, []);

  // UPDATE TEAM INFORMATION
  const updateField = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  };

  // UPDATE TEAM MEMBER
  // Recalculate eligibility whenever a member changes.
  const updateMember = (index, field, value) => {
    setForm(previous => {
      const updatedMembers = previous.members.map(
        (member, i) =>
          i === index
            ? { ...member, [field]: value }
            : member
      );

      const eligibleTiers = getEligibleTiers(
        updatedMembers
      );

      return {
        ...previous,
        members: updatedMembers,
        tier: eligibleTiers.includes(previous.tier)
          ? previous.tier
          : ''
      };
    });
  };

  // ADD TEAM MEMBER
  const addMember = () => {
    setForm(previous => {
      if (previous.members.length >= MAX_MEMBERS) {
        return previous;
      }

      return {
        ...previous,
        members: [
          ...previous.members,
          createEmptyMember()
        ]
      };
    });
  };

  // REMOVE TEAM MEMBER
  const removeMember = index => {
    setForm(previous => {
      if (
        previous.members.length <= MIN_MEMBERS ||
        index === 0
      ) {
        return previous;
      }

      const updatedMembers = previous.members.filter(
        (_, i) => i !== index
      );

      const eligibleTiers = getEligibleTiers(
        updatedMembers
      );

      return {
        ...previous,
        members: updatedMembers,
        tier: eligibleTiers.includes(previous.tier)
          ? previous.tier
          : ''
      };
    });
  };

  // AUTOMATIC TEAM ELIGIBILITY
  const eligibleTiers = getEligibleTiers(form.members);

  const allYearsSelected = form.members.every(
    member => member.academicYear
  );

  const highestAcademicYear = allYearsSelected
    ? Math.max(
        ...form.members.map(member =>
          ACADEMIC_YEARS.indexOf(member.academicYear) + 1
        )
      )
    : null;

  // SELECTED TIER AND TOTAL PRICE
  const selectedTier = tiers.find(
    tier => (tier.name || tier.tier) === form.tier
  );

  const perHeadPrice = Number(
    selectedTier?.price ?? selectedTier?.amount ?? 0
  );

  const totalAmount =
    perHeadPrice * form.members.length;

  // FORM VALIDATION
  const validateForm = () => {
    if (!form.teamName.trim()) {
      return 'Please enter your team name.';
    }

    if (!form.collegeName.trim()) {
      return 'Please enter your college or institution name.';
    }

    if (form.teamName.trim().length < 2) {
      return 'Team name must contain at least 2 characters.';
    }

    if (
      form.members.length < MIN_MEMBERS ||
      form.members.length > MAX_MEMBERS
    ) {
      return 'A team must have between 3 and 4 members.';
    }

    // Academic year validation
    if (
      form.members.some(
        member =>
          !ACADEMIC_YEARS.includes(member.academicYear)
      )
    ) {
      return 'Please select the academic year for every team member.';
    }

    // Tier eligibility validation
    if (!form.tier || !selectedTier) {
      return 'Please select an available competition tier.';
    }

    if (!eligibleTiers.includes(form.tier)) {
      return 'Your team is not eligible for the selected tier.';
    }

    if (
      !Number.isFinite(perHeadPrice) ||
      perHeadPrice <= 0
    ) {
      return 'The selected tier has an invalid price.';
    }

    const emails = [];
    const phones = [];

    for (
      let index = 0;
      index < form.members.length;
      index++
    ) {
      const member = form.members[index];

      const name = member.name.trim();
      const email = member.email.trim().toLowerCase();
      const phone = member.phone.trim();

      const memberLabel =
        index === 0
          ? 'the team leader'
          : `member ${index + 1}`;

      if (!name || !email || !phone) {
        return `Please complete all details for ${memberLabel}.`;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return `Please enter a valid email address for ${memberLabel}.`;
      }

      const normalizedPhone = phone.replace(
        /[\s()+-]/g,
        ''
      );

      if (!/^\d{7,15}$/.test(normalizedPhone)) {
        return `Please enter a valid phone number for ${memberLabel}.`;
      }

      if (emails.includes(email)) {
        return 'Each team member must have a unique email address.';
      }

      if (phones.includes(normalizedPhone)) {
        return 'Each team member must have a unique phone number.';
      }

      emails.push(email);
      phones.push(normalizedPhone);
    }

    return '';
  };

  // SUBMIT REGISTRATION
  const handleSubmit = async event => {
    event.preventDefault();

    if (submitting) return;

    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      return;
    }

    try {
      setSubmitting(true);

      const registrationData = {
        teamName: form.teamName.trim(),
        collegeName: form.collegeName.trim(),
        tier: form.tier,

        members: form.members.map(member => ({
          name: member.name.trim(),
          email: member.email.trim().toLowerCase(),
          phone: member.phone.trim(),
          academicYear: member.academicYear
        }))
      };

      // Backend calculates the actual registration amount.
      const response = await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify(registrationData)
      });

      console.log(
        '[Registration] Registration successful:',
        response
      );

      navigate('/participant', { replace: true });

    } catch (err) {
      console.error(
        '[Registration] Submission failed:',
        err
      );

      setError(
        err.message || 'Registration failed. Please try again.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    } finally {
      setSubmitting(false);
    }
  };

  // LOADING STATE
  if (loadingTiers) {
    return (
      <main className="page-shell">
        Loading available tiers...
      </main>
    );
  }

  return (
    <main className="registration-page">

      <section className="registration-container">

        <h1>Team Registration</h1>

        <p>
          Complete your team details and select your
          participation tier.
        </p>

        <p>
          Registration pricing is calculated per participant.
          Each team must contain 3 to 4 members.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* TEAM INFORMATION */}

          <div className="form-section">

            <h2>Team Information</h2>

            <label htmlFor="teamName">
              Team Name
            </label>

            <input
              id="teamName"
              name="teamName"
              value={form.teamName}
              onChange={updateField}
              placeholder="Enter your team name"
              maxLength={60}
              required
              disabled={submitting}
            />

            <label htmlFor="collegeName">
              College / Institution
            </label>

            <input
              id="collegeName"
              name="collegeName"
              value={form.collegeName}
              onChange={updateField}
              placeholder="Enter your college name"
              maxLength={150}
              required
              disabled={submitting}
            />

          </div>

          {/* TEAM MEMBERS */}

          <div className="form-section">

            <h2>Team Members</h2>

            <p>
              Each team must have 3 to 4 members.
              The first member will be considered the team leader.
            </p>

            {form.members.map((member, index) => (

              <div
                className="member-form-card"
                key={index}
              >

                <div className="member-form-heading">

                  <h3>
                    {index === 0
                      ? 'Team Leader'
                      : `Member ${index + 1}`}
                  </h3>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      disabled={
                        submitting ||
                        form.members.length <= MIN_MEMBERS
                      }
                    >
                      Remove
                    </button>
                  )}

                </div>

                <label htmlFor={`member-name-${index}`}>
                  Full Name
                </label>

                <input
                  id={`member-name-${index}`}
                  type="text"
                  value={member.name}
                  onChange={event =>
                    updateMember(
                      index,
                      'name',
                      event.target.value
                    )
                  }
                  placeholder="Enter member name"
                  maxLength={100}
                  required
                  disabled={submitting}
                />

                <label htmlFor={`member-email-${index}`}>
                  Email Address
                </label>

                <input
                  id={`member-email-${index}`}
                  type="email"
                  value={member.email}
                  onChange={event =>
                    updateMember(
                      index,
                      'email',
                      event.target.value
                    )
                  }
                  placeholder="Enter member email"
                  maxLength={120}
                  required
                  disabled={submitting}
                />

                <label htmlFor={`member-phone-${index}`}>
                  Phone Number
                </label>

                <input
                  id={`member-phone-${index}`}
                  type="tel"
                  value={member.phone}
                  onChange={event =>
                    updateMember(
                      index,
                      'phone',
                      event.target.value
                    )
                  }
                  placeholder="Enter member phone"
                  maxLength={20}
                  required
                  disabled={submitting}
                />

                {/* ACADEMIC YEAR */}

                <label htmlFor={`member-year-${index}`}>
                  Academic Year
                </label>

                <select
                  id={`member-year-${index}`}
                  value={member.academicYear}
                  onChange={event =>
                    updateMember(
                      index,
                      'academicYear',
                      event.target.value
                    )
                  }
                  required
                  disabled={submitting}
                >
                  <option value="">
                    Select Academic Year
                  </option>

                  {ACADEMIC_YEARS.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}

                </select>

              </div>

            ))}

            {form.members.length < MAX_MEMBERS && (

              <button
                type="button"
                className="secondary-button"
                onClick={addMember}
                disabled={submitting}
              >
                + Add Team Member
              </button>

            )}

          </div>

          {/* TIER SELECTION */}

          <div className="form-section">

            <h2>Select Competition Tier</h2>

            <p className="tier-guidance">
              Your team's eligible tier is automatically
              determined by the highest academic year
              among all members.
            </p>

            {!allYearsSelected ? (

              <p className="eligibility-message">
                Select the academic year of every team member
                to determine eligible tiers.
              </p>

            ) : (

              <>
                <div className="tier-selection-grid">

                  {tiers.map(tier => {

                    const tierId =
                      tier._id || tier.id || tier.name;

                    const tierName =
                      tier.name || tier.tier;

                    const isEligible =
                      eligibleTiers.includes(tierName);

                    const isSelected =
                      form.tier === tierName;

                    const displayName =
                      getDisplayTierName(tierName);

                    const description =
                      getTierDescription(tierName);

                    const tierPrice = Number(
                      tier.price ?? tier.amount ?? 0
                    );

                    return (

                      <label
                        key={tierId}
                        className={`eligibility-tier-card ${
                          isSelected ? 'selected' : ''
                        } ${
                          isEligible ? 'eligible' : 'restricted'
                        }`}
                      >

                        <input
                          type="radio"
                          name="tier"
                          value={tierName}
                          checked={isSelected}
                          onChange={updateField}
                          disabled={!isEligible || submitting}
                        />

                        <span className="tier-status-dot">
                          {isEligible ? '●' : '🔒'}
                        </span>

                        <span className="tier-card-details">

                          <strong>
                            {displayName}
                          </strong>

                          <small>
                            {description}
                          </small>

                          <small>
                            ₹
                            {Number.isFinite(tierPrice)
                              ? tierPrice.toLocaleString('en-IN')
                              : 'Price unavailable'}
                            {' '}per participant
                          </small>

                        </span>

                        <span className="tier-card-status">
                          {isEligible
                            ? 'Eligible'
                            : 'Restricted'}
                        </span>

                      </label>

                    );

                  })}

                </div>

                {/* AUTOMATIC ELIGIBILITY SUMMARY */}

                <div className="eligibility-summary">

                  <span>
                    Automatically determined eligibility
                  </span>

                  <strong>
                    {eligibleTiers
                      .map(getDisplayTierName)
                      .join(' / ')}
                  </strong>

                  <small>
                    Highest academic year: {highestAcademicYear}
                    {highestAcademicYear === 1
                      ? 'st'
                      : highestAcademicYear === 2
                        ? 'nd'
                        : highestAcademicYear === 3
                          ? 'rd'
                          : 'th'} Year
                  </small>

                </div>

              </>

            )}

            {/* TOTAL REGISTRATION FEE */}

            {form.tier && selectedTier && (

              <div className="registration-total">

                <p>
                  Price per participant:

                  <strong>
                    ₹{perHeadPrice.toLocaleString('en-IN')}
                  </strong>
                </p>

                <p>
                  Number of participants:

                  <strong>
                    {form.members.length}
                  </strong>
                </p>

                <h3>
                  Total Registration Fee:
                  {' '}₹{totalAmount.toLocaleString('en-IN')}
                </h3>

              </div>

            )}

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              submitting ||
              tiers.length === 0 ||
              !allYearsSelected ||
              !eligibleTiers.includes(form.tier)
            }
          >
            {submitting
              ? 'Submitting Registration...'
              : 'Submit Team Registration'}
          </button>

        </form>

      </section>

    </main>
  );
}
