import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ShopLayout.css';

export default function ShopLayout() {
  return (
    <div className="shop-layout">
      <Navbar />
      
      {/* Outlet, o anki aktif alt sayfayı (Home, Product vb.) buraya render eder */}
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
