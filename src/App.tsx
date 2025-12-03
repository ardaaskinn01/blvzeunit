import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Layouts
import ShopLayout from './layouts/ShopLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/home/HomePage';
import CategoryPage from './pages/categories/CategoryPage';
import ProductPage from './pages/products/ProductPage';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import ContactPage from './pages/contact/ContactPage';
import AboutPage from './pages/about/AboutPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* (shop) GRUBU: Navbar ve Footer'a sahip rotalar */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* (auth) GRUBU: Navbar/Footer yok, sadece form düzeni */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
