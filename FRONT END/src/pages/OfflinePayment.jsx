
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import upiQr from '../assets/hackathon-upi-qr.jpeg';

export default function OfflinePayment() {
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('not_submitted');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    transactionId: '',
    proof: null
  });

  // =====================================
  // LOAD REGISTRATION DETAILS
  // =====================================

  useEffect(() => {
    let active = true;

    async function loadRegistration() {
      try {
        setLoading(true);

        const data = await apiRequest('/registrations/mine');

        if (!active) return;

        if (
          !data.registration ||
          data.registration.status !== 'active'
        ) {
          navigate('/register-team', { replace: true });
          return;
        }

        const latestPayment = data.payments?.[0];

        const status = latestPayment?.status || 'not_submitted';

        // Pending or approved payments are handled
        // through the participant dashboard.
        if (status === 'approved' || status === 'pending') {
          navigate('/participant', { replace: true });
          return;
        }

        setRegistration(data.registration);
        setPaymentStatus(status);

      } catch (err) {
        if (active) {
          console.error('[Payment] Loading failed:', err);
          setError(err.message || 'Unable to load registration details.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRegistration();

    return () => {
      active = false;
    };
  }, [navigate]);

  // =====================================
  // HANDLE INPUT CHANGES
  // =====================================

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setError('');
  };

  // =====================================
  // HANDLE PAYMENT PROOF UPLOAD
  // =====================================

  const handleFileChange = event => {
    const file = event.target.files?.[0];

    if (!file) {
      setForm(previous => ({
        ...previous,
        proof: null
      }));
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Upload only JPG, PNG or PDF files.');
      event.target.value = '';

      setForm(previous => ({
        ...previous,
        proof: null
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must not exceed 5 MB.');
      event.target.value = '';

      setForm(previous => ({
        ...previous,
        proof: null
      }));

      return;
    }

    setError('');

    setForm(previous => ({
      ...previous,
      proof: file
    }));
  };

  // =====================================
  // SUBMIT PAYMENT
  // =====================================

  const handleSubmit = async event => {
    event.preventDefault();

    console.log('[Payment] Submit button clicked.');

    if (submitting) return;

    setError('');
    setSuccess('');

    if (!registration?._id || registration.status !== 'active') {
      setError('Your registration is not active.');
      return;
    }

    if (
      paymentStatus === 'pending' ||
      paymentStatus === 'approved'
    ) {
      setError('A payment has already been submitted or approved.');
      return;
    }

    if (!form.transactionId.trim()) {
      setError('Please enter your transaction ID.');
      return;
    }

    if (!form.proof) {
      setError('Please upload your payment proof.');
      return;
    }

    const formData = new FormData();

    formData.append('registrationId', registration._id);
    formData.append('transactionId', form.transactionId.trim());

    // Submit the complete team registration amount.
    formData.append('amount', String(registration.amount));

    formData.append('proof', form.proof);

    try {
      setSubmitting(true);

      console.log('[Payment] Sending payment submission...');

      await apiRequest('/payments', {
        method: 'POST',
        body: formData
      });

      console.log('[Payment] Payment proof submitted successfully.');

      setSuccess(
        'Payment proof submitted successfully. Your payment is awaiting verification.'
      );

      setPaymentStatus('pending');

      setForm({
        transactionId: '',
        proof: null
      });

      const fileInput = document.getElementById('proof');

      if (fileInput) {
        fileInput.value = '';
      }

      // Redirect after showing the confirmation.
      setTimeout(() => {
        navigate('/participant', { replace: true });
      }, 2000);

    } catch (err) {
      console.error('[Payment] Submission failed:', err);

      setError(
        err.message || 'Payment submission failed. Please try again.'
      );

    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // LOADING STATE
  // =====================================

  if (loading) {
    return (
      <main className="page-shell">
        Loading payment details...
      </main>
    );
  }

  // =====================================
  // REGISTRATION NOT AVAILABLE
  // =====================================

  if (!registration) {
    return (
      <main className="page-shell">
        <p>Registration details are unavailable.</p>

        <Link to="/participant">
          Go to Dashboard
        </Link>
      </main>
    );
  }

  // =====================================
  // PAYMENT PAGE
  // =====================================

  return (
    <main className="payment-page">

      <section className="payment-container">

        <h1>Hackathon Payment</h1>

        <p>
          Complete your team registration payment and submit
          the transaction details for verification.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success" role="status">
            {success}
          </div>
        )}

        {/* REGISTRATION SUMMARY */}

        <div className="payment-summary">

          <h2>Registration Summary</h2>

          <p>
            <strong>Team Name:</strong>{' '}
            {registration.teamName}
          </p>

          <p>
            <strong>Selected Tier:</strong>{' '}
            {registration.tier}
          </p>

          <p>
            <strong>Amount to Pay:</strong>{' '}
            <strong className="payment-total">
              ₹{Number(registration.amount || 0).toLocaleString('en-IN')}
            </strong>
          </p>

          <p className="team-payment-note">
            This amount includes the registration fee for all team members.
          </p>

        </div>

        {/* PAYMENT INSTRUCTIONS AND UPI QR */}

        <div className="payment-instructions">

          <h2>Payment Instructions</h2>

          <p>
            Scan the official UPI QR code below using
            Google Pay, PhonePe, Paytm or any UPI application.
          </p>

          <div className="upi-payment-card">

            <div className="upi-qr-wrapper">

              <img
                src={upiQr}
                alt="Official hackathon UPI payment QR code"
                className="upi-qr-image"
              />

            </div>

            <h3>Scan & Pay</h3>

            <p className="upi-amount">
              ₹{Number(registration.amount || 0).toLocaleString('en-IN')}
            </p>

            <p className="upi-caption">
              Total team registration fee
            </p>

            <p className="upi-note">
              Please verify the recipient name and amount
              in your UPI application before completing payment.
            </p>

          </div>

          <div className="payment-steps">

            <h3>After completing payment</h3>

            <ol>
              <li>Copy your transaction ID / UTR number.</li>
              <li>Take a screenshot of the successful payment.</li>
              <li>Enter your transaction reference below.</li>
              <li>Upload your payment screenshot.</li>
              <li>Submit the details for admin verification.</li>
            </ol>

          </div>

          <p>
            Your payment will be verified by the organizing team.
            Submission of proof does not mean payment approval.
          </p>

        </div>

        {/* REJECTED PAYMENT MESSAGE */}

        {paymentStatus === 'rejected' && (
          <div className="form-error">
            Your previous payment was rejected.
            Please submit corrected transaction details
            and payment proof.
          </div>
        )}

        {/* PAYMENT FORM */}

        <form onSubmit={handleSubmit}>

          <label htmlFor="transactionId">
            Transaction ID / UTR Number
          </label>

          <input
            id="transactionId"
            name="transactionId"
            type="text"
            value={form.transactionId}
            onChange={handleChange}
            placeholder="Enter your transaction reference"
            maxLength={100}
            required
            disabled={submitting}
          />

          <label htmlFor="proof">
            Upload Payment Proof
          </label>

          <input
            id="proof"
            name="proof"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            required
            disabled={submitting}
          />

          {form.proof && (
            <p className="selected-file">
              Selected file: {form.proof.name}
            </p>
          )}

          <p className="payment-upload-note">
            Accepted formats: JPG, PNG and PDF.
            Maximum file size: 5 MB.
          </p>

          <button
            type="submit"
            disabled={
              submitting ||
              paymentStatus === 'pending' ||
              paymentStatus === 'approved'
            }
          >
            {submitting
              ? 'Submitting Payment...'
              : paymentStatus === 'rejected'
                ? 'Resubmit Payment Proof'
                : 'Submit Payment Proof'}
          </button>

        </form>

        <Link to="/participant" className="back-link">
          ← Back to Dashboard
        </Link>

      </section>

    </main>
  );
}
