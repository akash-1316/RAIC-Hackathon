
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import raicLogo from '../assets/raic-logo.jpeg';
import '../styles/Footer.css';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">

        <div>
          <Link to="/" className="brand footer-brand">
            <img
              src={raicLogo}
              alt="RAIC"
              className="footer-logo raic-footer-logo"
            />
          </Link>

          <p className="footer-description">
            24 hours. Real problems. Extraordinary solutions.
          </p>

          <p className="footer-collaboration">
            In collaboration with Raghu Artificial Intelligence Club
          </p>
        </div>

        <div className="footer-links">
          <div>
            <span className="footer-heading">Explore</span>
            <Link to="/about">About</Link>
            <Link to="/tiers">Challenge tiers</Link>
            <Link to="/team">Organizers</Link>
          </div>

          <div>
            <span className="footer-heading">Participate</span>
            <Link to="/pricing">Pricing & rewards</Link>
            <Link to="/signup">Register</Link>
            <Link to="/offline-payment">Offline payment</Link>
          </div>

          <div>
            <span className="footer-heading">Support</span>
            <Link to="/contact">Contact</Link>
            <Link to="/signin">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Silver Jubilee × RAIC. All rights reserved.
        </span>

        <span>
          Built for innovators <ArrowUpRight size={14} />
        </span>
      </div>
    </footer>
  );
}
