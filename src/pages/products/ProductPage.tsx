import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import type { Tables } from '../../types/database.types';
import {
  calculateDiscountedPrice,
  formatDiscountLabel,
  getActiveDiscounts,
  type Discount
} from '../../utils/discount-utils';
import './ProductPage.css';
import Modal from '../../components/Modal';
import ImageMagnifier from '../../components/ImageMagnifier';

// Veritabanı tipleri
type Product = Tables<'products'>;
type ProductVariant = Tables<'product_variants'>;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeDiscount, setActiveDiscount] = useState<Discount | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (slug) {
      // Sayfa değiştiğinde en tepeye scroll et
      window.scrollTo(0, 0);
      initPage();
    }
  }, [slug]);

  async function initPage() {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      // Kategori kontrolü - slug'ı direkt string olarak kullanıyoruz
      const { data: categoryData } = await supabase
        .from('categories')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (categoryData) {
        navigate(`/categories/${slug}`);
        return;
      }

      await fetchProductData(slug);

    } catch (err) {
      console.error('Sayfa başlatma hatası:', err);
      setError('Bir hata oluştu.');
      setLoading(false);
    }
  }

  async function fetchProductData(productSlug: string) {
    try {
      // 1. Ürünü bul
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .single();

      if (productError || !productData) {
        throw new Error('Ürün bulunamadı');
      }

      setProduct(productData);

      // Set initial selected image
      if (productData.image_url) {
        setSelectedImage(productData.image_url);
      }

      // 2. Varyantları çek - product_variants tablosu için özel sorgu
      // Tip güvenliği için any kullanıyoruz çünkü types güncel değil
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants' as any)
        .select('*')
        .eq('product_id', productData.id)
        .order('created_at', { ascending: true });

      if (!variantsError && variantsData) {
        // Tip uyumsuzluğunu düzeltmek için as ProductVariant[] kullanıyoruz
        const typedVariants: ProductVariant[] = variantsData.map((v: any) => ({
          id: v.id,
          product_id: v.product_id,
          size: v.size,
          stock_quantity: v.stock_quantity,
          created_at: v.created_at
        }));
        setVariants(typedVariants);
        setSelectedVariant(null);
        setQuantity(1);
      }

      // 3. Kategori adını çek
      if (productData.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', productData.category)
          .maybeSingle();

        if (categoryData) {
          setCategoryName(categoryData.name);
        } else {
          // Eğer categories tablosunda bulunamazsa, category slug'ını kullan
          setCategoryName(productData.category);
        }
      }

      // 4. Benzer ürünleri çek
      if (productData.category) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', productData.category)
          .neq('id', productData.id)
          .limit(4);

        if (relatedData) {
          setRelatedProducts(relatedData);
        }
      }

      // 5. İndirimleri kontrol et
      const { data: allDiscounts } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true);

      if (allDiscounts) {
        // Type assertion ile Discount türüne dönüştür
        const typedDiscounts: Discount[] = allDiscounts.map(discount => ({
          ...discount,
          discount_type: discount.discount_type as "product" | "bulk",
          is_active: discount.is_active ?? false
        }));

        const validDiscounts = getActiveDiscounts(typedDiscounts, productData.id, productData.category);
        const { price, discount } = calculateDiscountedPrice(productData.price, validDiscounts);

        if (discount) {
          setActiveDiscount(discount);
          setDiscountedPrice(price);
        }
      }


    } catch (err: any) {
      console.error('Ürün yükleme hatası:', err);
      setError(err.message || 'Ürün bulunamadı.');
    } finally {
      setLoading(false);
    }
  }

  const handleSizeSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };



  const handleAddToCart = () => {
    if (!product) return;

    if (variants.length > 0 && !selectedVariant) {
      alert('Lütfen sepete eklemeden önce bir BEDEN seçiniz.');
      return;
    }

    // Seçilen varyant yoksa (bedensiz ürün) - stok kontrolü kaldırıldı
    if (variants.length === 0) {
      // Sadece 0 stok kontrolünü kaldırdık, ancak başka validasyonlar eklenebilir.
    }

    // İndirimli fiyat varsa onu kullan, yoksa normal fiyat
    const finalPrice = discountedPrice || product.price;

    const productToAdd = { ...product, price: finalPrice };

    addToCart(productToAdd, selectedVariant ? selectedVariant.size : 'Standart', quantity);
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-container">
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <h2>YÜKLENİYOR...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <div className="product-container">
          <div style={{ textAlign: 'center', padding: '5rem', border: '2px solid #000' }}>
            <h1>ÜRÜN BULUNAMADI</h1>
            <p>{error || 'Aradığınız ürün mevcut değil veya kaldırılmış olabilir.'}</p>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/" className="add-to-cart" style={{ textDecoration: 'none', display: 'inline-block' }}>
                ANA SAYFAYA DÖN
              </Link>
              <Link to="/categories/all" className="add-to-wishlist" style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginLeft: '1rem'
              }}>
                TÜM ÜRÜNLER
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxStock = 999;

  return (
    <div className="product-page">
      <div className="product-container">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Anasayfa</Link> /
          <Link to={`/categories/${product.category || 'all'}`}>
            {categoryName || 'Ürünler'}
          </Link> /
          <span> {product.name.toUpperCase()}</span>
        </div>

        <div className="product-detail">

          {/* Galeri */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              {selectedImage || product.image_url ? (
                <ImageMagnifier
                  src={selectedImage || product.image_url || ''}
                  alt={product.name}
                  width="100%"
                  height="100%"
                  zoomLevel={2} // 2 kat büyütme
                />
              ) : (
                <div style={{ fontSize: '4rem', color: '#ccc' }}>
                  👕
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {(product as any).additional_images && (product as any).additional_images.length > 0 && (
              <div className="product-thumbnails">
                {/* Main image thumbnail */}
                {product.image_url && (
                  <div
                    className={`thumbnail ${selectedImage === product.image_url ? 'active' : ''}`}
                    onClick={() => product.image_url && setSelectedImage(product.image_url)}
                  >
                    <img
                      src={product.image_url}
                      alt="Main"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Additional images thumbnails */}
                {(product as any).additional_images.map((imgUrl: string, index: number) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImage(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detaylar */}
          <div className="product-details">
            <h1 className="product-name">{product.name}</h1>

            <div className="product-price-section">
              {activeDiscount && discountedPrice ? (
                <>
                  <span className="current-price" style={{ color: 'red' }}>₺{discountedPrice.toFixed(2)}</span>
                  <span className="original-price" style={{ textDecoration: 'line-through', color: '#999', marginLeft: '1rem', fontSize: '1.2rem' }}>
                    ₺{product.price.toFixed(2)}
                  </span>
                  <span className="discount-badge" style={{ marginLeft: '1rem', background: 'red', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                    {formatDiscountLabel(activeDiscount)}
                  </span>
                </>
              ) : (
                <span className="current-price">₺{product.price.toFixed(2)}</span>
              )}
            </div>

            {/* Ürün Açıklaması */}
            <div className="product-description-section">
              <h3>Ürün Açıklaması</h3>
              <p className="product-description">
                {product.description || 'Ürün açıklaması bulunmuyor.'}
              </p>
            </div>

            {/* Ürün Özellikleri */}
            {((product as any).features && (product as any).features.length > 0) || product.category || product.color ? (
              <div className="product-specs">
                <h3>Ürün Bilgileri</h3>
                {product.category && (
                  <div className="spec-item">
                    <span className="spec-label">Kategori</span>
                    <span className="spec-value">{categoryName || product.category}</span>
                  </div>
                )}
                {product.color && (
                  <div className="spec-item">
                    <span className="spec-label">Renk</span>
                    <span className="spec-value">{product.color}</span>
                  </div>
                )}
                {(product as any).features && (product as any).features.map((feature: { label: string; value: string }, index: number) => (
                  <div className="spec-item" key={index}>
                    <span className="spec-label">{feature.label}</span>
                    <span className="spec-value">{feature.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {variants.length > 0 ? (
              <div className="size-selector">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="size-label" style={{ margin: 0 }}>BEDEN SEÇİNİZ:</label>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#000',
                      fontFamily: "'Bebas Neue', monospace",
                      letterSpacing: '0.5px'
                    }}
                  >
                    BEDEN TABLOSU
                  </button>
                </div>
                <div className="size-options">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      className={`size-button ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                      onClick={() => handleSizeSelect(variant)}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>

              </div>
            ) : null}

            {/* Adet Seçimi */}
            <div className="quantity-selector">
              <label>ADET:</label>
              <input
                type="number"
                value={quantity}
                min="1"
                max={maxStock}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= maxStock) {
                    setQuantity(val);
                  }
                }}
                className="quantity-input"
              />
            </div>

            {/* Butonlar */}
            <div className="action-buttons">
              <button
                className="add-to-cart"
                onClick={handleAddToCart}
                disabled={variants.length > 0 && !selectedVariant}
              >
                {variants.length > 0 && !selectedVariant
                  ? 'BEDEN SEÇİNİZ'
                  : 'SEPETE EKLE'
                }
              </button>
            </div>

          </div>
        </div>

        {/* Benzer Ürünler */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>BENZER ÜRÜNLER</h2>
            <div className="related-grid">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="product-card">
                  <div className="card-image" style={{ padding: '2rem', textAlign: 'center', fontSize: '2rem' }}>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} style={{ maxHeight: '150px', objectFit: 'contain' }} />
                    ) : '👕'}
                  </div>
                  <div className="card-info">
                    <h4>{p.name}</h4>
                    <p className="card-price">₺{p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <Modal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        title="BEDEN TABLOSU"
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="/table.png"
            alt="Beden Tablosu"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </Modal>

    </div>
  );
}