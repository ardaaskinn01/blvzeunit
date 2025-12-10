// Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Tables } from '../types/database.types';

type Category = Tables<'categories'>;

interface GeneratedCategory {
  id: number;
  name: string;
  slug: string;
}

type DisplayCategory = Category | GeneratedCategory;

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      // İlk olarak categories tablosundan dene
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!categoriesError && categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        return;
      }

      // Eğer categories tablosu boşsa, products tablosundan benzersiz kategorileri al
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (productsError) throw productsError;

      // Benzersiz kategorileri oluştur
      const uniqueCategories = Array.from(
        new Set(productsData?.map(item => item.category).filter(Boolean) || [])
      );

      const generatedCategories: GeneratedCategory[] = uniqueCategories.map((categoryName, i) => ({
        id: i + 1,
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
      }));

      setCategories(generatedCategories);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Kullanıcıyı arama sonuçları sayfasına yönlendir ve sorgu parametresini ekle
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Arama kutusunu temizle
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-top">
          <Link to="/" className="navbar-logo">
            <img src="/logo.jpeg" alt="BLVZEUNIT" className="navbar-logo-img" />
          </Link>

          {/* Burger Menu Button - Sadece mobilde görünür */}
          <button
            className="navbar-burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
            <span className={isMobileMenuOpen ? 'active' : ''}></span>
          </button>
        </div>

        <div className={`navbar-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="navbar-menu">
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
                Anasayfa
              </Link>
            </li>
            <li className="navbar-item navbar-item-dropdown">
              <Link
                to={categories.length === 1 ? `/categories/${categories[0].slug}` : "/categories"}
                className="navbar-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Koleksİyonlar
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/about" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
                Hakkımızda
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/contact" className="navbar-link" onClick={() => setIsMobileMenuOpen(false)}>
                İletİşİm
              </Link>
            </li>
          </ul>

          <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="ARA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">
              🔍
            </button>
          </form>

          <div className="navbar-actions">
            <button className="navbar-cart" onClick={() => { navigate('/cart'); setIsMobileMenuOpen(false); }}>
              Sepet ({cartCount})
            </button>
            {user ? (
              <div className="navbar-user">
                <Link to="/account" className="navbar-account-link" onClick={() => setIsMobileMenuOpen(false)}>
                  {/* Giriş yapılmışsa: Hesabım */}
                  HESABIM
                </Link>
              </div>
            ) : (
              <Link to="/login" className="navbar-account" onClick={() => setIsMobileMenuOpen(false)}>
                {/* Giriş yapılmamışsa: Giriş Yap */}
                GİRİŞ YAP
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}