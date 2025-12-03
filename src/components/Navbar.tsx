import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          My Shop
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              Ana Sayfa
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/categories/all" className="navbar-link">
              Kategoriler
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/products/all" className="navbar-link">
              Ürünler
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">
              Hakkımızda
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/contact" className="navbar-link">
              İletişim
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
