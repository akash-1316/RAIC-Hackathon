import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);

      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      navigate(
        location.state?.from?.pathname || '/participant',
        { replace: true }
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>

        <div className="auth-icon">
          ✦
        </div>

        <h1>Welcome Back</h1>

        <p>
          Sign in to continue your hackathon registration.
        </p>

        {error && (
          <div className="form-notice">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button
            type="submit"
            className="btn-primary button-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">Create Account</Link>
        </p>

      </section>
    </main>
  );
}