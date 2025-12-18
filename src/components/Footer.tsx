import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="bebas-font">BLVZEUNIT</h3>
            <p>Kaliteli giyim ürünleriyle tarzınızı yansıtın. Modern tasarım, uygun fiyatlar ve hızlı teslimat.</p>
            <div className="social-links">
              <a href="https://www.instagram.com/blvzeunit/" target="_blank" rel="noopener noreferrer" className="bebas-font">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61584021405184&ref=pl_edit_xav_ig_profile_page_web" target="_blank" rel="noopener noreferrer" className="bebas-font">Facebook</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="bebas-font">HIZLI LİNKLER</h4>
            <ul>
              <li><Link to="/" className="bebas-font">Anasayfa</Link></li>
              <li><Link to="/categories" className="bebas-font">Kategoriler</Link></li>
              <li><Link to="/categories/all" className="bebas-font">Ürünler</Link></li>
              <li><Link to="/about" className="bebas-font">Hakkımızda</Link></li>
              <li><Link to="/contact" className="bebas-font">İletişim</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="bebas-font">POLİTİKALAR</h4>
            <ul>
              <li><Link to="/privacy-policy" className="bebas-font">Gizlilik Politikası</Link></li>
              <li><Link to="/refund-policy" className="bebas-font">Para İade Politikası</Link></li>
              <li><Link to="/shipping-policy" className="bebas-font">Kargo Politikası</Link></li>
              <li><Link to="/terms-of-service" className="bebas-font">Hizmet Şartları</Link></li>
              <li><Link to="/legal-notice" className="bebas-font">Yasal Bildirim</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="bebas-font">İLETİŞİM</h4>
            <p>Email: blvzeunit@gmail.com</p>
            <p>Adres: 4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir</p>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-trust-section">
          <div className="trust-logos">
            {/* iyzico Logo Band */}
            <div className="footer-payment">
              <img
                src="/iyzico-logo-pack/footer_iyzico_ile_ode/White/logo_band_white.svg"
                alt="Visa, Mastercard ve diğer ödeme yöntemleri"
                className="payment-band-logo"
              />
            </div>

            {/* ETBIS Logo & Link */}
            <div className="footer-etbis">
              <a
                href="https://etbis.ticaret.gov.tr/tr/Home/SearchSite?url=blvzeunit"
                target="_blank"
                rel="noopener noreferrer"
                className="etbis-link"
              >
                <img src="/logo-etbis.png" alt="ETBİS" className="etbis-logo" />
              </a>
            </div>
          </div>

          <p className="trust-text">
            Tüm ödemeleriniz iyzico güvencesi altında 256-bit SSL şifrelemesi ile korunmaktadır. Bu site ETBİS'e kayıtlıdır.
          </p>
        </div>

        <div className="footer-bottom">
          <p className="bebas-font">&copy; 2025 BLVZEUNIT. TÜM HAKLARI SAKLIDIR.</p>
        </div>
      </div>
    </footer>
  );
}