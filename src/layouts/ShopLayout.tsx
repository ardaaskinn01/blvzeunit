import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ShopLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Outlet, o anki aktif alt sayfayı (Home, Product vb.) buraya render eder */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* <Footer /> */}
    </div>
  );
}
