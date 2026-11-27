
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Layers3,
  Brain
} from 'lucide-react';

import TierPyramid, {
  tierData
} from '../components/TierPyramid';

import '../styles/Tiers.css';

const tierIcons = {
  basic: Code2,
  advanced: Layers3,
  hard: Brain
};

function Tiers() {
  return (
    <main className="tiers-page">

      <section className="tiers-hero">
        <div className="container">
          <span className="section-kicker">
            HACKATHON CHALLENGE STRUCTURE
          </span>

          <h1>
            Choose your <span>level.</span>
          </h1>

          <p>
            Three distinct challenge levels. One 25-hour
            innovation experience. Find the level that
            matches your team's technical readiness.
          </p>
        </div>
      </section>

      <section className="tiers-pyramid-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              THREE-LEVEL STRUCTURE
            </span>

            <h2>
              Understand the <span>tiers.</span>
            </h2>

            <p>
              Each level offers a different degree of
              technical complexity and problem-solving.
            </p>
          </div>

          <TierPyramid detailed />
        </div>
      </section>

      <section className="tier-details-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-kicker">
              EXPLORE EACH LEVEL
            </span>

            <h2>
              What each tier <span>demands.</span>
            </h2>
          </div>

          <div className="tier-details-grid">
            {tierData.map(tier => {
              const Icon = tierIcons[tier.id];

              return (
                <article
                  className={`tier-detail-card detail-${tier.color}`}
                  id={tier.id}
                  key={tier.id}
                >
                  <div className="tier-detail-top">
                    <span>{tier.number} / 03</span>
                    <Icon size={26} />
                  </div>

                  <h3>{tier.name}</h3>

                  <p className="tier-detail-description">
                    {tier.description}
                  </p>

                  <div className="tier-detail-divider" />

                  <h4>Challenge expectations</h4>

                  <ul>
                    {tier.details.map((detail, index) => (
                      <li key={index}>
                        <CheckCircle2 size={17} />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/signup"
                    className="tier-detail-link"
                  >
                    Register your team
                    <ArrowUpRight size={17} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tier-rules-section">
        <div className="container">
          <span className="section-kicker">
            PARTICIPATION GUIDELINES
          </span>

          <h2>
            Important <span>rules.</span>
          </h2>

          <div className="rules-grid">
            <div className="rule-item">
              <span>01</span>
              <h3>Team Size</h3>
              <p>
                Each team must consist of 3–4 participants.
              </p>
            </div>

            <div className="rule-item">
              <span>02</span>
              <h3>Problem Statements</h3>
              <p>
                Teams must work only on organizer-provided
                problem statements.
              </p>
            </div>

            <div className="rule-item">
              <span>03</span>
              <h3>Original Work</h3>
              <p>
                Previously developed or submitted projects
                are not permitted.
              </p>
            </div>

            <div className="rule-item">
              <span>04</span>
              <h3>Open Innovation</h3>
              <p>
                Open-innovation submissions are not
                accepted for this challenge.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="tier-register-section">
        <div className="container tier-register-inner">
          <div>
            <span className="section-kicker">
              READY FOR THE CHALLENGE?
            </span>

            <h2>
              Your team's journey starts here.
            </h2>

            <p>
              Choose your level and get ready for 25 hours
              of innovation.
            </p>
          </div>

          <Link
            to="/signup"
            className="button button-light"
          >
            Register now
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}

export default Tiers;
