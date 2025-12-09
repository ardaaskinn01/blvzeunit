import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';
import { getActiveDiscounts, calculateDiscountedPrice, formatDiscountLabel, type Discount } from '../../utils/discount-utils';
import './HomePage.css';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

interface GeneratedCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}

type DisplayCategory = Category | GeneratedCategory;

// Kayan Yazı (Marquee) verisi
const marqueeText = "BLVZEUNIT | WHERE STREET MEETS SOUL | ";

// Lookbook verisi (public/images/banner.jpg varsayılarak)
const lookbookData = {
  title: "MONEY TALKS",
  subtitle: "'WHERE STREET MEETS SOUL'",
  imageUrl: "/banner.png", // public klasöründeki görsel
  cta: "KOLEKSİYONU GÖR"
};

// --- SAYFA KOMPONENTİ ---

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fetchCategories();
    fetchCategories();
    fetchDiscountsAndProducts();
  }, []);

  // ... (fetchCategories fonksiyonu değişmedi)

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
        .select('category, image_url')
        .not('category', 'is', null);

      if (productsError) throw productsError;

      // Benzersiz kategorileri oluştur
      const uniqueCategories = Array.from(
        new Set(productsData?.map(item => item.category).filter(Boolean) || [])
      );

      const generatedCategories: GeneratedCategory[] = uniqueCategories.map((categoryName, i) => {
        // Her kategori için bir görsel al (ilk ürünün görselini kullan)
        const categoryProduct = productsData?.find(p => p.category === categoryName);
        return {
          id: i + 1,
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          image_url: categoryProduct?.image_url || null,
        };
      });

      setCategories(generatedCategories);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
    }
  }

  async function fetchDiscountsAndProducts() {
    try {
      setLoading(true);

      // 1. Aktif indirimleri çek
      const { data: discountData } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true);

      const activeDiscounts = (discountData as unknown as Discount[]) || [];
      setDiscounts(activeDiscounts);

      // 2. Ürünleri çek
      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        // En yeni ürünleri almak için created_at'e göre sırala
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const allProducts = productData || [];
      setProducts(allProducts); // Tümünü çekip aşağıda filtreleyelim

    } catch (error) {
      console.error('❌ Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  // Helper to calculate price stats for a product
  const getProductPriceInfo = (product: Product) => {
    const validDiscounts = getActiveDiscounts(discounts, product.id, product.category);
    return calculateDiscountedPrice(product.price, validDiscounts);
  };

  // İndirimli ürünleri filtrele (activeDiscounts kullanarak)
  const discountedProductsList = products.filter(p => {
    const { discount } = getProductPriceInfo(p);
    return discount !== null;
  });

  // * YENİ: En yeni 8 ürünü al - New Drops için kullanılacak *
  const newDropsProducts = products.slice(0, 8);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderProductCard = (product: Product) => {
    const { price, discount } = getProductPriceInfo(product);
    const isDiscounted = discount !== null;
    return (
      <Link
        key={product.id}
        to={`/products/${product.slug}`}
        className="product-card"
      >
        <div className="product-image">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
          {isDiscounted && (
            <span className="discount-badge">
              {formatDiscountLabel(discount!)}
            </span>
          )}
        </div>
        <div className="product-info">
          <h4>{product.name}</h4>
          {isDiscounted ? (
            <div className="price-box">
              <span className="current-price" style={{ color: 'red' }}>₺{price.toFixed(2)}</span>
              <span className="old-price" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em', marginLeft: '8px' }}>
                ₺{product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <p className="product-price">₺{product.price.toFixed(2)}</p>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="home-page">
      <div className="home-container">

        {/* YENİ: Marquee (Kayan Yazı) Bölümü */}
        <div className="marquee-section">
          <div className="marquee-content">{marqueeText.repeat(5)}</div>
        </div>

        <section className="lookbook-section" style={{ backgroundImage: `url(${lookbookData.imageUrl})` }}>
          <div className="lookbook-overlay">
            <div className="lookbook-content">
              <h2>{lookbookData.title}</h2>
              <p>{lookbookData.subtitle}</p>
              <Link to="/categories/all" className="cta-button lookbook-cta">
                {lookbookData.cta}
              </Link>
            </div>
          </div>
        </section>

        {/* Hero Section: Slogan Devrede */}
        <section className="hero-section">
          <h1>BLVZEUNIT</h1>
          <p>"Where street meets soul." </p>
          <Link to="/categories/all" className="cta-button">
            ÜRÜNLERİ KEŞFET
          </Link>
        </section>

        {/* Categories Scroll Section */}
        {categories.length > 0 && (
          <section className="categories-scroll-section">
            <h2 className="section-title">KATEGORİLER</h2>
            <div className="categories-scroll-container">
              <button
                className="scroll-button scroll-left"
                onClick={() => scrollCategories('left')}
                aria-label="Sola kaydır"
              >
                ‹
              </button>
              <div className="categories-scroll" ref={categoriesScrollRef}>
                <Link to="/categories/all" className="category-scroll-item">
                  <div className="category-scroll-image">
                    <div className="category-scroll-placeholder">ALL</div>
                  </div>
                  <span>Tüm Ürünler</span>
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="category-scroll-item"
                  >
                    <div className="category-scroll-image">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} />
                      ) : (
                        <div className="category-scroll-placeholder">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>{category.name}</span>
                  </Link>
                ))}
              </div>
              <button
                className="scroll-button scroll-right"
                onClick={() => scrollCategories('right')}
                aria-label="Sağa kaydır"
              >
                ›
              </button>
            </div>
          </section>
        )}

        {/* YENİ: Discounted Products Section (İndirimli Fırsatlar) - Konumu Korundu */}
        {discountedProductsList.length > 0 && (
          <section className="discounted-products-section">
            <h2 className="section-title">İNDİRİMLİ FIRSATLAR</h2>
            <div className="products-grid">
              {discountedProductsList.slice(0, 4).map((product) => renderProductCard(product))}
            </div>
          </section>
        )}


        {/* YENİ: New Drops / Bestsellers Section (Eski Products Preview yerine) */}
        <section className="new-drops-section products-preview-section">
          <h2 className="section-title">YENİ DÜŞENLER (NEW DROPS)</h2>
          {loading ? (
            <div className="loading-message">Ürünler yükleniyor...</div>
          ) : newDropsProducts.length === 0 ? (
            <div className="no-products-message">Henüz yeni ürün bulunmuyor.</div>
          ) : (
            <div className="products-grid">
              {newDropsProducts.map((product) => renderProductCard(product))}
            </div>
          )}
          <div className="all-products-link-container">
            <Link to="/categories/all" className="cta-button secondary-cta">
              TÜM ÜRÜNLERİ GÖR
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}