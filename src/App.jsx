import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landingpage";
import Login from "./components/login";
import Signup from "./components/signup";
import Profile from "./components/profile";
import AdminRoutes from "./components/admin";
import Notifications from "./components/notifications";
import { Payment } from "./components/payment";
import PaymentSuccess from "./components/PaymentSuccess"; // 🔥 ADD THIS LINE
import { AuthProvider, useAuth } from "./contexts/authcontext";
import OfflineDetector from "./components/OfflineDetector";

// 🔥 Loading Screen Component
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(59, 130, 246, 0.3)',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      <p style={{ fontSize: '18px', fontWeight: '500' }}>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// 🔥 Protected Route (Shows loading screen while checking auth)
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, userRole, authChecked } = useAuth();

  // Wait for session check with loading screen
  if (!authChecked) return <LoadingScreen />;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Admin required but user is not admin
  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

// 🔥 Public Route (Instant redirect if logged in, loading only if uncertain)
const PublicRoute = ({ children }) => {
  const { user, userRole, authChecked } = useAuth();

  // If user exists, redirect immediately (no loading)
  if (user) {
    return userRole === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/profile" replace />;
  }

  // Only show loading if auth check hasn't completed yet
  if (!authChecked) return <LoadingScreen />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      {/* 🔥 PWA Offline Detector */}
      <OfflineDetector />
      
      <Router>
        <Routes>

          {/* Public Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* User Profile Page - Main dashboard for regular users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/:id"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* 🔥 ADD THIS NEW ROUTE */}
          <Route
            path="/payment-success/:id"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Admin protected page */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;