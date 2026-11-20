
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import '../styles/Pricing.css';

export default function Pricing() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchTiers() {
      try {
        const data = await apiRequest('/tiers');

        if (active) {
          setTiers(data.tiers || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchTiers();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="page-shell">
        Loading pricing...
      </main>
    );
  }

  return (
    <main className="pricing-page">
      <section className="pricing-container">

        <h1>Hackathon Pricing</h1>

        <p>
          Choose the participation tier that suits your team.
          Prices shown are per participant.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {tiers.length === 0 && !error && (
          <p>
            Pricing information is currently unavailable.
          </p>
        )}

        <div className="pricing-grid">
          {tiers.map(tier => (
            <article
              className="pricing-card"
              key={tier._id || tier.id || tier.name}
            >
              <h2>{tier.name || tier.tier}</h2>

              <div className="pricing-amount">
                ₹
                {Number(
                  tier.price ?? tier.amount ?? 0
                ).toLocaleString('en-IN')}
              </div>

              <p className="pricing-per-head">
                Per participant
              </p>

              {tier.description && (
                <p>{tier.description}</p>
              )}

              {tier.features?.length > 0 && (
                <ul>
                  {tier.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              )}

              <Link
                to="/register-team"
                className="pricing-button"
              >
                Select Tier
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
