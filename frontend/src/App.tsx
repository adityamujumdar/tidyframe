import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
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

// Payment pages
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentCancelledPage from './pages/payment/PaymentCancelledPage';

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

// Admin pages - Lazy loaded for better performance
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDashboardTest = lazy(() => import('./pages/admin/AdminDashboardTest'));

// Layout components
import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Loading component for Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

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

            {/* Auth routes with navbar */}
            <Route path="/auth" element={<PublicLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="reset-password" element={<PasswordResetPage />} />
              <Route path="verify-email" element={<EmailVerificationPage />} />
            </Route>

            {/* Payment routes without navbar (clean experience) */}
            <Route path="/payment">
              <Route path="success" element={<PaymentSuccessPage />} />
              <Route path="cancelled" element={<PaymentCancelledPage />} />
            </Route>

            {/* Legal routes with navbar */}
            <Route path="/legal" element={<PublicLayout />}>
              <Route path="terms-of-service" element={<TermsOfServicePage />} />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            </Route>

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
                    <Suspense fallback={<LoadingFallback />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                </ErrorBoundary>
              }
            >
              <Route index element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="dashboard" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="users" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="stats" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="jobs" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="webhooks" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="test" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboardTest />
                </Suspense>
              } />
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