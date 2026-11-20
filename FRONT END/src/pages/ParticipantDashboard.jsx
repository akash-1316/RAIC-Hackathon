
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, downloadReceipt } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Partcipant.css';

export default function ParticipantDashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // =====================================
  // LOAD PARTICIPANT DASHBOARD
  // =====================================

  const loadDashboard = async () => {
    try {
      const result = await apiRequest('/registrations/mine');

      setData(result);
      setError('');

      return result;
    } catch (err) {
      setError(err.message || 'Unable to load dashboard.');
      throw err;
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await apiRequest('/registrations/mine');

        if (!active) return;

        // Keep the dashboard accessible even after payment approval.
        setData(result);
        setError('');

      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  // =====================================
  // DOWNLOAD PAYMENT RECEIPT
  // =====================================

  const handleReceiptDownload = async paymentId => {
    try {
      setReceiptLoading(true);
      setError('');

      await downloadReceipt(paymentId);

    } catch (err) {
      setError(err.message || 'Unable to download receipt.');
    } finally {
      setReceiptLoading(false);
    }
  };

  // =====================================
  // CANCEL REGISTRATION
  // =====================================

  const handleCancelRegistration = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this registration? You can register again after cancellation.'
    );

    if (!confirmed) return;

    try {
      setCancelling(true);
      setError('');

      await apiRequest(
        `/registrations/${data.registration._id}/cancel`,
        { method: 'POST' }
      );

      await loadDashboard();

    } catch (err) {
      setError(err.message || 'Unable to cancel registration.');
    } finally {
      setCancelling(false);
    }
  };

  // =====================================
  // LOADING STATE
  // =====================================

  if (loading) {
    return (
      <main className="page-shell">
        Loading your dashboard...
      </main>
    );
  }

  // =====================================
  // API ERROR STATE
  // =====================================

  if (error && !data) {
    return (
      <main className="page-shell">
        <div className="form-error">{error}</div>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </main>
    );
  }

  const registration = data?.registration;
  const payments = data?.payments || [];
  const registrationHistory = data?.registrationHistory || [];
  const latestPayment = payments[0];

  // =====================================
  // NO ACTIVE REGISTRATION
  // =====================================

  if (!registration) {
    return (
      <main className="participant-dashboard">
        <section className="dashboard-container">

          <h1>Welcome, {user?.name || 'Participant'}!</h1>

          {error && (
            <div className="form-error">{error}</div>
          )}

          <p>
            You currently have no active team registration.
          </p>

          {registrationHistory.length > 0 && (
            <div className="dashboard-card">
              <h2>Previous Registrations</h2>

              {registrationHistory.map(item => (
                <div
                  key={item._id}
                  className="payment-history-item"
                >
                  <p>
                    <strong>Team:</strong> {item.teamName}
                  </p>

                  <p>
                    <strong>Tier:</strong> {item.tier}
                  </p>

                  <p>
                    <strong>Status:</strong> {item.status}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            className="dashboard-primary-button"
            to="/register-team"
          >
            Register a New Team
          </Link>

        </section>
      </main>
    );
  }

  // =====================================
  // PAYMENT STATUS
  // =====================================

  const paymentStatus =
    latestPayment?.status || 'not_submitted';

  const canCancel =
    paymentStatus === 'not_submitted' ||
    paymentStatus === 'rejected';

  // =====================================
  // PARTICIPANT DASHBOARD
  // =====================================

  return (
    <main className="participant-dashboard">
      <section className="dashboard-container">

        {/* DASHBOARD HEADING */}

        <div className="dashboard-heading">
          <div>
            <h1>Participant Dashboard</h1>
            <p>
              Welcome back, {user?.name || 'Participant'}.
            </p>
          </div>

          <Link to="/profile">
            My Profile
          </Link>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* TEAM DETAILS */}

        <div className="dashboard-card">
          <h2>Team Details</h2>

          <p>
            <strong>Team Name:</strong> {registration.teamName}
          </p>

          <p>
            <strong>College:</strong> {registration.collegeName}
          </p>

          <p>
            <strong>Selected Tier:</strong> {registration.tier}
          </p>

          <p>
            <strong>Registration Amount:</strong>{' '}
            ₹{Number(registration.amount || 0).toLocaleString('en-IN')}
          </p>

          {registration.registrationId && (
            <p>
              <strong>Registration ID:</strong>{' '}
              {registration.registrationId}
            </p>
          )}
        </div>

        {/* TEAM MEMBERS */}

        <div className="dashboard-card">
          <h2>Team Members</h2>

          {(registration.members || []).map((member, index) => (
            <div
              className="payment-history-item"
              key={member._id || index}
            >
              <p>
                <strong>
                  {index === 0
                    ? 'Team Leader'
                    : `Member ${index + 1}`}:
                </strong>{' '}
                {member.name}
              </p>

              <p>
                <strong>Email:</strong> {member.email}
              </p>

              <p>
                <strong>Phone:</strong> {member.phone}
              </p>
            </div>
          ))}
        </div>

        {/* STATUS CARDS */}

        <div className="dashboard-status-grid">

          <div className="dashboard-card">
            <h3>Registration Status</h3>

            <p className="status-label active">
              Registered
            </p>
          </div>

          <div className="dashboard-card">
            <h3>Payment Status</h3>

            <p className={`status-label ${paymentStatus}`}>
              {paymentStatus.replace('_', ' ')}
            </p>
          </div>

        </div>

        {/* APPROVED PAYMENT */}

        {paymentStatus === 'approved' ? (

          <div className="dashboard-card">
            <h3>Payment Approved</h3>

            <p>
              Your payment has been verified successfully.
            </p>

            <p>
              Your team registration payment is complete.
            </p>

            {latestPayment?._id && (
              <button
                type="button"
                disabled={receiptLoading}
                onClick={() =>
                  handleReceiptDownload(latestPayment._id)
                }
              >
                {receiptLoading
                  ? 'Preparing Receipt...'
                  : 'Download Receipt'}
              </button>
            )}
          </div>

        ) : paymentStatus === 'pending' ? (

          /* PENDING PAYMENT */

          <div className="dashboard-card">
            <h3>Payment Under Verification</h3>

            <p>
              Your payment proof has been submitted and is
              awaiting verification by the organizing team.
            </p>
          </div>

        ) : paymentStatus === 'rejected' ? (

          /* REJECTED PAYMENT */

          <div className="dashboard-card">
            <h3>Payment Rejected</h3>

            <p>
              Your payment proof was rejected. Please check
              the administrator's remarks and submit the
              proof again.
            </p>

            {latestPayment?.remarks && (
              <p>
                <strong>Admin Remark:</strong>{' '}
                {latestPayment.remarks}
              </p>
            )}

            <Link to="/offline-payment">
              Resubmit Payment Proof
            </Link>
          </div>

        ) : (

          /* PAYMENT NOT SUBMITTED */

          <div className="dashboard-card">
            <h3>Payment Required</h3>

            <p>
              Your team registration is active. Submit your
              payment details to complete the registration.
            </p>

            <Link to="/offline-payment">
              Continue to Payment
            </Link>
          </div>

        )}

        {/* PAYMENT HISTORY */}

        {payments.length > 0 && (
          <div className="dashboard-card">
            <h2>Payment History</h2>

            {payments.map(payment => (
              <div
                className="payment-history-item"
                key={payment._id}
              >
                <p>
                  <strong>Transaction ID:</strong>{' '}
                  {payment.transactionId}
                </p>

                <p>
                  <strong>Amount:</strong>{' '}
                  ₹{Number(payment.amount || 0).toLocaleString('en-IN')}
                </p>

                <p>
                  <strong>Status:</strong> {payment.status}
                </p>

                {payment.remarks && (
                  <p>
                    <strong>Admin Remark:</strong>{' '}
                    {payment.remarks}
                  </p>
                )}

                {payment.status === 'approved' && (
                  <button
                    type="button"
                    disabled={receiptLoading}
                    onClick={() =>
                      handleReceiptDownload(payment._id)
                    }
                  >
                    {receiptLoading
                      ? 'Preparing Receipt...'
                      : 'Download Receipt'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CANCEL REGISTRATION */}

        {canCancel && (
          <div className="dashboard-card">
            <h3>Cancel Registration</h3>

            <p>
              You can cancel this registration and create a
              new one. Your previous registration will remain
              in your history.
            </p>

            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancelRegistration}
            >
              {cancelling
                ? 'Cancelling...'
                : 'Cancel Registration'}
            </button>
          </div>
        )}

      </section>
    </main>
  );
}
