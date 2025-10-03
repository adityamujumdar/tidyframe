import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SitePasswordProvider } from './contexts/SitePasswordContext';
import { SitePasswordGate } from './components/auth/SitePasswordGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'sonner';

// Public pages
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import ApiDocsPage from './pages/ApiDocsPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

// Legal pages
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';

// Dashboard pages
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import FileUpload from './pages/dashboard/FileUpload';
import ProcessingStatus from './pages/dashboard/ProcessingStatus';
import Results from './pages/dashboard/Results';
import Analytics from './pages/dashboard/Analytics';
import Profile from './pages/dashboard/Profile';
import ApiKeys from './pages/dashboard/ApiKeys';
import Billing from './pages/dashboard/Billing';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDashboardTest from './pages/admin/AdminDashboardTest';

// Layout components
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <SitePasswordProvider>
      <SitePasswordGate>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background relative">
              <div className="relative">
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="docs" element={<ApiDocsPage />} />
            </Route>

            {/* Auth routes */}
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/reset-password" element={<PasswordResetPage />} />
            <Route path="/auth/verify-email" element={<EmailVerificationPage />} />

            {/* Legal routes */}
            <Route path="/legal/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="upload" element={<FileUpload />} />
              <Route path="processing" element={<ProcessingStatus />} />
              <Route path="results" element={<Results />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="profile" element={<Profile />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="billing" element={<Billing />} />
            </Route>

            {/* Protected admin routes */}
            <Route
              path="/admin"
              element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="stats" element={<AdminDashboard />} />
              <Route path="jobs" element={<AdminDashboard />} />
              <Route path="webhooks" element={<AdminDashboard />} />
              <Route path="test" element={<AdminDashboardTest />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
              </div>
            </div>
          </Router>
        </AuthProvider>
      </SitePasswordGate>
    </SitePasswordProvider>
  );
}

export default App;