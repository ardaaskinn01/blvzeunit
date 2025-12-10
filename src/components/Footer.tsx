import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Content */}
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3>BLVZEUNIT</h3>
            <p>Kaliteli giyim ürünleriyle tarzınızı yansıtın. Modern tasarım, uygun fiyatlar ve hızlı teslimat.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/blvzeunit/" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61584021405184&ref=pl_edit_xav_ig_profile_page_web" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>HIZLI LİNKler</h4>
            <ul>
              <li><Link to="/">Anasayfa</Link></li>
              <li><Link to="/categories">Kategoriler</Link></li>
              <li><Link to="/categories/all">Ürünler</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-section">
            <h4>POLİTİKALAR</h4>
            <ul>
              <li><Link to="/privacy-policy">Gizlilik Politikası</Link></li>
              <li><Link to="/refund-policy">Para İade Politikası</Link></li>
              <li><Link to="/shipping-policy">Kargo Politikası</Link></li>
              <li><Link to="/terms-of-service">Hizmet Şartları</Link></li>
              <li><Link to="/legal-notice">Yasal Bildirim</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>İLETİŞİM</h4>
            <p>Email: blvzeunit@gmail.com</p>
            <p>Adres: 4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir</p>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; 2025 BLVZEUNIT. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
