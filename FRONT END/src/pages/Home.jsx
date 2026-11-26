
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Code2,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

import TierPyramid from '../components/TierPyramid';
import Countdown from '../components/Countdown';
import SilverJubilee from '../components/SliverJubliee';

const highlights = [
  {
    icon: Code2,
    title: 'Build solutions',
    text: 'Turn organizer-provided problem statements into working prototypes.',
    number: '01'
  },
  {
    icon: Users,
    title: 'Collaborate',
    text: 'Bring your teammates together and turn different skills into one solution.',
    number: '02'
  },
  {
    icon: Trophy,
    title: 'Compete & win',
    text: 'Present your work, demonstrate your impact and earn recognition.',
    number: '03'
  },
  {
    icon: Zap,
    title: '24-hour sprint',
    text: 'Plan, build, test and present within an intensive 24-hour challenge.',
    number: '04'
  }
];

export default function Home() {
  return (
    <main>

      {/* HERO SECTION */}

      <section className="hero">
        <div className="hero-grid" />

        <div className="container hero-content">

          {/* OFFER AND EVENT BADGES */}

          <div className="hero-badges">

            <div className="early-bird-pill">
              <span className="early-bird-dot" />

              <span className="early-bird-label">
                EARLY BIRD LIVE
              </span>

              <span className="early-bird-divider">/</span>

              <span className="early-bird-text">
                First 25 registrations only
              </span>

              <span className="early-bird-arrow">↗</span>
            </div>

            <div className="eyebrow-pill">
              <span className="status-dot" />

              22–23 DECEMBER 2026

              <span className="eyebrow-divider">/</span>

              24-HOUR HACKATHON BY RAIC
            </div>

          </div>

          {/* HERO TITLE */}

          <h1 className="hero-title">
            <span className="hero-title-highlight">
              IGNITE
            </span>{' '}
            2026.
            <br />
            Build. Dominate.
          </h1>

          <p className="hero-description">
            24 hours of pure innovation · Real-world problem
            statements · Exciting prize pool.
          </p>

          {/* HERO ACTIONS */}

          <div className="hero-actions">

            <Link to="/signup" className="button button-light">
              Register now
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/about" className="button button-outline">
              Explore event
            </Link>

          </div>

          {/* COUNTDOWN */}

          <div className="hero-countdown-wrap">

            <div className="hero-countdown-header">

              <span className="hero-countdown-label">
                <span className="status-dot" />
                THE COUNTDOWN IS ON
              </span>

              <span className="hero-countdown-tag">
                24H
              </span>

            </div>

            <h2 className="hero-countdown-title">
              Time to <span>innovate.</span>
            </h2>

            <Countdown />

            <div className="hero-countdown-footer">
              <span>INNOVATION</span>
              <span>TECHNOLOGY</span>
              <span>COLLABORATION</span>
            </div>

          </div>

          {/* EVENT META */}

          <div className="hero-meta">
            <span>24-HOUR CHALLENGE</span>

            <span>
              INNOVATION <i>•</i> TECHNOLOGY
            </span>
          </div>

          {/* SILVER JUBILEE */}

          <div className="hero-jubilee">
            <SilverJubilee />
          </div>

        </div>
      </section>

      {/* EVENT OVERVIEW */}

      <section
        className="section overview-section"
        id="event-overview"
      >
        <div className="container">

          <div className="section-heading">
            <span className="section-kicker">
              THE CHALLENGE
            </span>

            <h2>
              Ideas meet <span>execution.</span>
            </h2>

            <p>
              A 24-hour innovation challenge where teams work on
              real-world problem statements and turn ideas into
              demonstrable solutions.
            </p>
          </div>

          <div className="feature-grid">

            {highlights.map(({ icon: Icon, title, text, number }) => (
              <article
                className="feature-card"
                key={number}
              >
                <span className="feature-number">
                  {number}
                </span>

                <Icon
                  className="feature-icon"
                  size={27}
                />

                <h3>{title}</h3>

                <p>{text}</p>
              </article>
            ))}

          </div>

        </div>
      </section>

      {/* THREE-LEVEL TIER PYRAMID */}

      <section
        className="section tiers-preview"
        id="tiers-preview"
      >
        <div className="container">

          <div className="section-heading">
            <span className="section-kicker">
              CHOOSE YOUR CHALLENGE
            </span>

            <h2>
              Three tiers. <span>One stage.</span>
            </h2>

            <p>
              Three levels of challenges designed to test
              your team's creativity, technical skills and
              problem-solving abilities.
            </p>
          </div>

          <TierPyramid />

          <div className="section-action">
            <Link
              to="/tiers"
              className="text-link"
            >
              View all tier details
              <ArrowUpRight size={17} />
            </Link>
          </div>

        </div>
      </section>

      {/* REGISTRATION CTA */}

      <section className="register-strip">
        <div className="container register-strip-inner">

          <div>
            <span className="section-kicker">
              READY TO BUILD?
            </span>

            <h2>
              Your next 24 hours start here.
            </h2>

            <p>
              Bring your team. Take on a challenge.
              Build something meaningful.
            </p>
          </div>

          <Link
            to="/signup"
            className="button button-light"
          >
            Start registration
            <ArrowUpRight size={18} />
          </Link>

        </div>
      </section>

    </main>
  );
}
