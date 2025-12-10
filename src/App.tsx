import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import ShopLayout from './layouts/ShopLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/home/HomePage';
import CategoryPage from './pages/categories/CategoryPage';
import ProductPage from './pages/products/ProductPage';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import AccountPage from './pages/account/Account';
import AdminDashboard from './pages/admin/AdminDashboard';
import ContactPage from './pages/contact/ContactPage';
import AboutPage from './pages/about/AboutPage';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import ResetPasswordPage from './pages/auth/ResetPassword';
import AuthCallbackPage from './pages/auth/AuthCallback';
import EmailConfirmationPage from './pages/auth/emailConfirmationPage';
import { useEffect, useState } from 'react';
import SearchPage from './pages/search/SearchPage';
import CategoryProductsPage from './pages/categories/CategoryProductsPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';

// Legal Pages
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import RefundPolicyPage from './pages/legal/RefundPolicyPage';
import ShippingPolicyPage from './pages/legal/ShippingPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import LegalNoticePage from './pages/legal/LegalNoticePage';

// Minimal Loading Component
function GlobalLoading() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}></div>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  // 3 saniye sonra loading'i bypass et (fallback)
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Eğer loading uzun sürüyorsa, fallback göster
  if (loading && !showFallback) {
    return <GlobalLoading />;
  }

  // Loading uzun sürdüyse bile uygulamayı göster
  return (
    <Routes>
      {/* (shop) GRUBU */}
      <Route element={<ShopLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/categories/:slug" element={<CategoryProductsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/legal-notice" element={<LegalNoticePage />} />
      </Route>

      {/* (auth) GRUBU */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/confirm-email" element={<EmailConfirmationPage />} />
      </Route>

      {/* AuthCallback */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;