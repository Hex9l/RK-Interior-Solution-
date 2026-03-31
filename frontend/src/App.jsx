import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ReactLenis } from 'lenis/react';

import { AuthProvider } from './context/AuthContext';

import Layout from './components/Layout';
const Home = React.lazy(() => import('./pages/Home'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Knowledge = React.lazy(() => import('./pages/Knowledge'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = React.lazy(() => import('./pages/VerifyEmail'));
const LikedDesigns = React.lazy(() => import('./pages/LikedDesigns'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminPackages = React.lazy(() => import('./pages/admin/Packages'));
const AdminWorks = React.lazy(() => import('./pages/admin/Works'));
const AdminInquiries = React.lazy(() => import('./pages/admin/Inquiries'));
const AdminIdeas = React.lazy(() => import('./pages/admin/Ideas'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));

import ScrollToTop from './components/ScrollToTop';
import { Suspense } from 'react';

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
  </div>
);

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothTouch: false }}>
      <ToastContainer 
        theme="dark" 
        position="top-right" 
        autoClose={1500} 
        hideProgressBar={false} 
        closeButton={false}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        draggable={false}
      />
      <Router>
        <ScrollToTop />
        <AuthProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="furniture-knowledge" element={<Knowledge />} />
            <Route path="contact" element={<Contact />} />
            <Route path="liked-designs" element={<LikedDesigns />} />
          </Route>

          {/* Auth Routes (standalone, no Layout navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="works" element={<AdminWorks />} />
            <Route path="ideas" element={<AdminIdeas />} />
            <Route path="inquiries" element={<AdminInquiries />} />
          </Route>

          {/* Catch-all: redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
    </ReactLenis>
  );
}

export default App;
