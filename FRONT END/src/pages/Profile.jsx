import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Profile.css';
export default function Profile() {
  const { user } = useAuth();

  return (
    <main className="profile-page">
      <section className="profile-container">
        <h1>My Profile</h1>
        <p>Your participant account information.</p>

        <div className="profile-card">
          <div className="profile-field">
            <span>Full Name</span>
            <strong>{user?.name || 'Not available'}</strong>
          </div>

          <div className="profile-field">
            <span>Email Address</span>
            <strong>{user?.email || 'Not available'}</strong>
          </div>

          <div className="profile-field">
            <span>Phone Number</span>
            <strong>{user?.phone || 'Not available'}</strong>
          </div>
        </div>

        <Link to="/participant">Back to Dashboard</Link>
      </section>
    </main>
  );
}