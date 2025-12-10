import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getActiveDiscounts, calculateDiscountedPrice, formatDiscountLabel, type Discount } from '../../utils/discount-utils';
import './CategoryProductsPage.css';

type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  const productsPerPage = 12;

  // Quick Add State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Discounts
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Filtreler
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const selectedCategory = slug || 'all';
  const [categoryName, setCategoryName] = useState('TÜM ÜRÜNLER');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchDiscounts();
  }, [slug, sortBy, currentPage]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug');

      if (error) {
        // products tablosundan al
        const { data: productData } = await supabase
          .from('products')
          .select('category')
          .not('category', 'is', null);

        const uniqueCategories = Array.from(
          new Set(productData?.map(item => item.category).filter(Boolean) || [])
        );
        setCategories(['all', ...uniqueCategories]);
        return;
      }

      if (data && data.length > 0) {
        const categorySlugs = data.map(cat => cat.slug);
        setCategories(['all', ...categorySlugs]);

        // Kategori adını bul
        if (slug && slug !== 'all') {
          const category = data.find(cat => cat.slug === slug);
          if (category) {
            setCategoryName(category.name.toUpperCase());
          } else {
            setCategoryName(slug.toUpperCase());
          }
        }
      }
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
      setCategories(['all']);
    }
  }

  // fetchDiscounts fonksiyonunu şu şekilde güncelle:
  async function fetchDiscounts() {
    try {
      const { data: discountData, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (discountData) {
        // Type assertion ile Discount türüne dönüştür ve null olan is_active değerlerini false yap
        const typedDiscounts: Discount[] = discountData.map(discount => ({
          ...discount,
          discount_type: discount.discount_type as "product" | "bulk",
          is_active: discount.is_active ?? false // null ise false yap
        }));
        setDiscounts(typedDiscounts);
      }
    } catch (error) {
      console.error('❌ İndirimler yüklenirken hata:', error);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const from = (currentPage - 1) * productsPerPage;
      query = query.range(from, from + productsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalProducts(count || 0);

    } catch (error) {
      console.error('❌ Ürünler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setSearchParams({ sort: value });
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      navigate('/categories/all');
    } else {
      navigate(`/categories/${category}`);
    }
  };

  const handleQuickAdd = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity === 0) return;

    setQuickAddProduct(product);
    setLoadingVariants(true);
    setIsModalOpen(true);
    setVariants([]);

    try {
      // Varyantları çek - doğru tablo adı ve tür dönüşümü
      const { data: variantsData, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (variantsData && variantsData.length > 0) {
        // Type assertion ile ProductVariant türüne dönüştür
        const typedVariants: ProductVariant[] = variantsData.map(variant => ({
          ...variant,
          created_at: variant.created_at || null
        }));
        setVariants(typedVariants);
      } else {
        // Varyantsız ürün -> Direkt ekle
        addToCart(product, 'Standart', 1);
        setIsModalOpen(false);
        setQuickAddProduct(null);
      }
    } catch (err) {
      console.error('Varyant kontrolü hatası:', err);
      setIsModalOpen(false);
    } finally {
      setLoadingVariants(false);
    }
  };

  const getProductPriceInfo = (product: Product) => {
    const validDiscounts = getActiveDiscounts(discounts, product.id, product.category);
    return calculateDiscountedPrice(product.price, validDiscounts);
  };

  const confirmVariantAdd = (variant: ProductVariant) => {
    if (!quickAddProduct) return;
    addToCart(quickAddProduct, variant.size, 1);
    setIsModalOpen(false);
    setQuickAddProduct(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuickAddProduct(null);
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="category-products-page">
      <div className="category-products-container">
        <h1>{categoryName}</h1>
        <p>BLVZEUNIT - SOKAĞIN RUHU BURADA</p>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>K0LEKSİYON</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">TÜM ÜRÜNLER</option>
              {categories
                .filter(cat => cat !== 'all')
                .map((category) => (
                  <option key={category} value={category}>
                    {category.toUpperCase()}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="filter-group">
            <label>SIRALAMA</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="created_at">EN YENİ</option>
              <option value="price_asc">EN UCUZ</option>
              <option value="price_desc">EN PAHALI</option>
              <option value="name">A-Z SIRALI</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Ürünler yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Bu koleksiyonda ürün bulunamadı.</h3>
            <Link to="/categories/all" style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-black)',
              color: 'var(--color-white)',
              textDecoration: 'none'
            }}>
              Tüm Ürünlere Göz At
            </Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => {
                const { price, discount } = getProductPriceInfo(product);

                return (
                  <div key={product.id} className="product-card">
                    <Link to={`/products/${product.slug}`} className="product-link">
                      <div className="product-image">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--color-light-gray)',
                            color: 'var(--color-dark-gray)'
                          }}>
                            ÜRÜN
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{product.name.toUpperCase()}</h4>

                        <div className="product-price-container">
                          {discount ? (
                            <>
                              <span className="product-price discounted" style={{ color: 'red', marginRight: '0.5rem' }}>
                                ₺{price.toFixed(2)}
                              </span>
                              <span className="product-price original" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em' }}>
                                ₺{product.price.toFixed(2)}
                              </span>
                              <div className="discount-badge-card" style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'red',
                                color: 'white',
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                borderRadius: '4px'
                              }}>
                                {formatDiscountLabel(discount)}
                              </div>
                            </>
                          ) : (
                            <p className="product-price">₺{product.price.toFixed(2)}</p>
                          )}
                        </div>

                        <p className="product-description">
                          {product.description.length > 80
                            ? `${product.description.substring(0, 80)}...`
                            : product.description}
                        </p>
                      </div>
                    </Link>
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => handleQuickAdd(product, e)}
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity > 0 ? 'Sepete Ekle' : 'STOK YOK'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Önceki
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={currentPage === idx + 1 ? 'active' : ''}
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sonraki →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {loadingVariants ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Yükleniyor...</p>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                  {quickAddProduct?.name}
                </h2>

                {variants.length > 0 ? (
                  <>
                    <p style={{ marginBottom: '1rem', color: '#666' }}>Lütfen beden seçiniz:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => confirmVariantAdd(variant)}
                          disabled={variant.stock_quantity === 0}
                          style={{
                            padding: '1rem',
                            border: '2px solid black',
                            background: variant.stock_quantity === 0 ? '#f0f0f0' : 'white',
                            cursor: variant.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            opacity: variant.stock_quantity === 0 ? 0.5 : 1,
                          }}
                        >
                          {variant.size}
                          {variant.stock_quantity === 0 && <div style={{ fontSize: '0.7rem' }}>Tükendi</div>}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Varyant bilgisi yükleniyor...</p>
                )}

                <button
                  onClick={closeModal}
                  style={{
                    marginTop: '1.5rem',
                    padding: '0.75rem 1.5rem',
                    background: '#f0f0f0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: '600',
                  }}
                >
                  İptal
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}