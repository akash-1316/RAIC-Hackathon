import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProductedRoute.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Pricing from './pages/Pricing.jsx';
import Contact from './pages/Contact.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import OfflinePayment from './pages/OfflinePayment.jsx';
import Tiers from './pages/Tiers.jsx';
import TeamRegistration from './pages/TeamRegistration.jsx';
import ParticipantDashboard from './pages/ParticipantDashboard.jsx';
import Profile from './pages/Profile.jsx';

const authPaths = ['/signin', '/signup'];

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/tiers" element={<Tiers />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/participant"
          element={
            <ProtectedRoute>
              <ParticipantDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-team"
          element={
            <ProtectedRoute>
              <TeamRegistration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/offline-payment"
          element={
            <ProtectedRoute>
              <OfflinePayment />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!authPaths.includes(location.pathname) && <Footer />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}