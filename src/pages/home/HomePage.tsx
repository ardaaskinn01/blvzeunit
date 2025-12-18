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
  imageUrl: "/moneytalks.jpeg", // public klasöründeki görsel
  cta: "KOLEKSİYONU GÖR"
};

// --- SAYFA KOMPONENTİ ---

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const discountedRef = useRef<HTMLElement>(null);
  const newDropsRef = useRef<HTMLElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);


  useEffect(() => {
    fetchCategories();
    fetchDiscountsAndProducts();
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15, // %15'i görünür olduğunda tetikle
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Bir kere tetiklendikten sonra izlemeyi bırakabiliriz (performans için)
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = [
      marqueeRef.current,
      manifestoRef.current,
      lookbookRef.current,
      heroRef.current,
      categoriesRef.current,
      discountedRef.current,
      newDropsRef.current,
    ];

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [categories, products, discounts]);

  async function fetchCategories() {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!categoriesError && categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category, image_url')
        .not('category', 'is', null);

      if (productsError) throw productsError;

      const uniqueCategories = Array.from(
        new Set(productsData?.map(item => item.category).filter(Boolean) || [])
      );

      const generatedCategories: GeneratedCategory[] = uniqueCategories.map((categoryName, i) => {
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

      const { data: discountData } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true);

      const activeDiscounts = (discountData as unknown as Discount[]) || [];
      setDiscounts(activeDiscounts);

      const { data: productData, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const allProducts = productData || [];
      setProducts(allProducts);

    } catch (error) {
      console.error('❌ Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  const getProductPriceInfo = (product: Product) => {
    const validDiscounts = getActiveDiscounts(discounts, product.id, product.category);
    return calculateDiscountedPrice(product.price, validDiscounts);
  };

  const discountedProductsList = products.filter(p => {
    const { discount } = getProductPriceInfo(p);
    return discount !== null;
  });

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
        <div className="marquee-section fade-in-section" ref={marqueeRef}>
          <div className="marquee-content">{marqueeText.repeat(5)}</div>
        </div>

        <section
          className="lookbook-section fade-in-section"
          /* ... */
          style={{ backgroundImage: `url(${lookbookData.imageUrl})` }}
          ref={lookbookRef}
        >
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



        {/* Categories Scroll Section */}
        {categories.length > 0 && (
          <section className="categories-scroll-section fade-in-section" ref={categoriesRef}>
            <h2 className="section-title">KOLEKSİYONLAR</h2>
            <div className="categories-scroll-container">
              <button
                className="scroll-button scroll-left"
                onClick={() => scrollCategories('left')}
                aria-label="Sola kaydır"
              >
                ‹
              </button>
              <div
                className={`categories-scroll ${categories.length <= 3 ? 'center-items' : ''}`}
                ref={categoriesScrollRef}
              >

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
          <section className="discounted-products-section fade-in-section" ref={discountedRef}>
            <h2 className="section-title">İNDİRİMLİ FIRSATLAR</h2>
            <div className="products-grid">
              {discountedProductsList.slice(0, 4).map((product) => renderProductCard(product))}
            </div>
          </section>
        )}

        {/* YENİ: New Drops / Bestsellers Section (Eski Products Preview yerine) */}
        <section className="new-drops-section products-preview-section fade-in-section" ref={newDropsRef}>
          <h2 className="section-title">YENİ DÜŞENLER (NEW DROPS)</h2>
          {loading ? (
            <div className="loading-message">Ürünler yükleniyor...</div>
          ) : newDropsProducts.length === 0 ? (
            <div className="no-products-message">Henüz yenİ ürün bulunmuyor.</div>
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