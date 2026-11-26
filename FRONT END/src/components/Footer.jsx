
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  MessageCircle
} from 'lucide-react';

import '../styles/Footer.css';

// Official social links
const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/raic_rec?utm_source=ig_web_button_share_sheet&cnvx=ZDNlZDc0MzIxNw==',
    icon: Instagram
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/raghuaiclub/posts/',
    icon: Linkedin
  },
  {
    name: 'WhatsApp',
    href: '#',
    icon: MessageCircle
  }
];

const footerGroups = [
  {
    title: 'Explore',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Challenge tiers', path: '/tiers' },
      { label: 'Organizers', path: '/team' }
    ]
  },
  {
    title: 'Participate',
    links: [
      { label: 'Pricing & rewards', path: '/pricing' },
      { label: 'Register', path: '/signup' },
      { label: 'Offline payment', path: '/offline-payment' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', path: '/contact' },
      { label: 'Sign in', path: '/signin' }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="site-footer">

      <div className="footer-grid-bg" />

      <div className="container footer-main">

        {/* BRAND SECTION */}

        <div className="footer-brand-section">

          <Link to="/" className="footer-wordmark">
            <span className="footer-ignite">
              IGN<span>ITE</span>
            </span>

            <span className="footer-year">
              2026
            </span>
          </Link>

          <div className="footer-brand-line" />

          <p className="footer-description">
            24 hours. Real problems.
            <br />
            Extraordinary solutions.
          </p>

          <p className="footer-collaboration">
            Presented by <strong>RAIC</strong>
            <br />
            Raghu Artificial Intelligence Club
          </p>

          {/* SOCIAL LINKS */}

          <div className="footer-socials">

            {socialLinks.map(({ name, href, icon: Icon }) => {
              const isConfigured =
                !href.startsWith('YOUR_');

              return (
                <a
                  key={name}
                  href={isConfigured ? href : undefined}
                  target={isConfigured ? '_blank' : undefined}
                  rel={isConfigured ? 'noopener noreferrer' : undefined}
                  aria-label={name}
                  title={
                    isConfigured
                      ? name
                      : `Add official ${name} URL`
                  }
                  className={`footer-social-link ${
                    !isConfigured ? 'footer-social-unconfigured' : ''
                  }`}
                  onClick={
                    !isConfigured
                      ? (event) => event.preventDefault()
                      : undefined
                  }
                >
                  <Icon size={19} strokeWidth={1.8} />
                </a>
              );
            })}

          </div>

        </div>

        {/* NAVIGATION LINKS */}

        <div className="footer-links">

          {footerGroups.map((group) => (
            <div className="footer-link-group" key={group.title}>

              <span className="footer-heading">
                {group.title}
              </span>

              {group.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="footer-link"
                >
                  {link.label}
                  <ArrowUpRight
                    className="footer-link-arrow"
                    size={13}
                  />
                </Link>
              ))}

            </div>
          ))}

        </div>

      </div>

      {/* BOTTOM BAR */}

      <div className="container footer-bottom">

        <span>
          © {new Date().getFullYear()} IGNITE × RAIC.
          All rights reserved.
        </span>

        <span className="footer-bottom-message">
          <span className="footer-bottom-dot" />
          Built for innovators.
          <ArrowUpRight size={14} />
        </span>

      </div>

    </footer>
  );
}
