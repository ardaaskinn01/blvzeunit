import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';
import './CategoryPage.css';

type Category = Tables<'categories'>;

// Products tablosundan oluşturduğumuz kategori için tip
interface GeneratedCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

// Union type - hem gerçek Category hem de oluşturduğumuz
type DisplayCategory = Category | GeneratedCategory;

export default function CategoryPage() {
  const { slug: _slug } = useParams<{ slug: string }>();
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      console.log('🔄 Kategoriler yükleniyor...');

      // İlk olarak categories tablosundan dene
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (!categoriesError && categoriesData && categoriesData.length > 0) {
        console.log('✅ Kategoriler categories tablosundan alındı:', categoriesData.length);
        setCategories(categoriesData);
        setLoading(false);
        return;
      }

      console.log('ℹ️ Categories tablosu boş, products tablosundan kategoriler oluşturuluyor...');

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

      // Her kategori için bir görsel al (ilk ürünün görselini kullan)
      const generatedCategories: GeneratedCategory[] = [];

      for (let i = 0; i < uniqueCategories.length; i++) {
        const categoryName = uniqueCategories[i];
        const { data: categoryProduct } = await supabase
          .from('products')
          .select('image_url')
          .eq('category', categoryName)
          .limit(1);

        generatedCategories.push({
          id: i + 1, // Geçici ID
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: `${categoryName} kategorisindeki ürünleri keşfedin`,
          image_url: categoryProduct?.[0]?.image_url || null,
          created_at: new Date().toISOString()
        });
      }

      console.log('✅ Kategoriler oluşturuldu:', generatedCategories.length);
      setCategories(generatedCategories);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="category-page">
      <div className="category-container">
        <h1>KOLEKSİYONLAR</h1>
        <p>BLVZEUNIT - STİLİNİZİ KEŞFEDİN</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Koleksiyonlar yükleniyor...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Henüz koleksiyon bulunmuyor.</h3>
            <p>Ürünler eklendikçe koleksiyonlar görünecektir.</p>
          </div>
        ) : (
          <>
            <div className="categories-grid">
              {/* Tüm Ürünler kartı */}
              <Link to="/categories/all" className="category-card">
                <div className="category-image">
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, var(--color-black) 0%, var(--color-medium-gray) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-white)',
                    fontSize: '3rem',
                    fontFamily: "'Roboto Mono', monospace",
                    fontWeight: 'bold'
                  }}>
                    ALL
                  </div>
                </div>
                <div className="category-overlay">
                  <h3>TÜM ÜRÜNLER</h3>
                  <p className="category-description">
                    Tüm koleksiyonu keşfedin
                  </p>
                </div>
              </Link>

              {/* Kategori kartları */}
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.slug}`}
                  className="category-card"
                >
                  <div className="category-image">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--color-light-gray) 0%, var(--color-dark-gray) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-black)',
                        fontSize: '2.5rem',
                        fontFamily: "'Roboto Mono', monospace",
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {category.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="category-overlay">
                    <h3>{category.name.toUpperCase()}</h3>
                    <p className="category-description">
                      {category.description || `${category.name} koleksiyonu`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sayfa altı açıklama */}
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--color-medium-gray)' }}>
              <p>Her koleksiyon için özel tasarlanmış ürünlerimizi keşfedin. Streetwear ruhunu yaşayın.</p>
              <Link to="/" className="all-categories-link">
                Ana Sayfaya Dön
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}