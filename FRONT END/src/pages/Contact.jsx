
import { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const update = event => {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setSent(false);
    setError('');
  };

  const submit = async event => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSent(false);
    setError('');

    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(form)
      });

      setSent(true);

      setForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(
        err.message ||
        'Unable to submit your enquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="container page-content">

        <div className="page-hero">
          <span className="section-kicker">
            CONTACT
          </span>

          <h1>
            Let's talk <span>innovation.</span>
          </h1>

          <p>
            Have a question about registration, payment or the event?
            Send the organizing team a message.
          </p>
        </div>

        <div className="contact-layout">

          <div className="contact-details">

            <article>
              <Mail />

              <div>
                <h3>Email</h3>
                <p>
                  Official contact email will be announced.
                </p>
              </div>
            </article>

            <article>
              <MapPin />

              <div>
                <h3>Venue</h3>
                <p>
                  Event venue details will be announced.
                </p>
              </div>
            </article>

          </div>

          <form className="form-card" onSubmit={submit}>

            <h2>Send an enquiry</h2>

            {sent && (
              <div className="form-success" role="status">
                Your enquiry has been submitted successfully.
                The organizing team will review your message.
              </div>
            )}

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <label>
              Full name

              <input
                name="name"
                value={form.name}
                onChange={update}
                required
                maxLength={100}
                placeholder="Your name"
                disabled={loading}
              />
            </label>

            <label>
              Email address

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                required
                maxLength={150}
                placeholder="you@example.com"
                disabled={loading}
              />
            </label>

            <label>
              Subject

              <input
                name="subject"
                value={form.subject}
                onChange={update}
                required
                maxLength={150}
                placeholder="How can we help?"
                disabled={loading}
              />
            </label>

            <label>
              Message

              <textarea
                name="message"
                value={form.message}
                onChange={update}
                required
                minLength={5}
                maxLength={5000}
                rows={5}
                placeholder="Write your message..."
                disabled={loading}
              />
            </label>

            <button
              className="button button-light"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Send message'}
              <Send size={17} />
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
