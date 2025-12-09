// src/pages/search/SearchPage.tsx

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Tables } from '../../types/database.types';
import './SearchPage.css';

type Product = Tables<'products'>;

export default function SearchPage() {
    const location = useLocation();
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // URL'deki ?q=sorgu kısmını al
    const query = new URLSearchParams(location.search).get('q') || '';

    useEffect(() => {
        const searchProducts = async () => {
            setLoading(true);
            setError(null);
            setResults([]);

            if (!query.trim()) {
                setLoading(false);
                return;
            }

            try {
                console.log('🔍 Searching for:', query);

                // Supabase ile arama - name, description ve category alanlarında ILIKE ile arama
                const searchTerm = `%${query}%`;

                const { data, error: searchError } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                    .order('created_at', { ascending: false });

                if (searchError) {
                    console.error('❌ Search error:', searchError);
                    throw searchError;
                }

                console.log(`✅ Found ${data?.length || 0} products`);
                setResults(data || []);
            } catch (err: any) {
                console.error('❌ Unexpected search error:', err);
                setError('Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };

        searchProducts();
    }, [query]);

    return (
        <div className="search-page">
            <div className="search-container">
                <h1>{query ? `"${query.toUpperCase()}" İÇİN SONUÇLAR` : 'ÜRÜN ARAMA'}</h1>
                <p className="search-subtitle">
                    {loading ? 'Arama yapılıyor...' :
                        error ? error :
                            (results.length > 0 ? `${results.length} adet ürün bulundu.` : 'Arama kriterlerinize uygun ürün bulunamadı.')}
                </p>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                <div className="search-results-grid">
                    {loading ? (
                        <div className="loading-spinner">YÜKLENİYOR...</div>
                    ) : (
                        results.map(product => (
                            <Link
                                to={`/products/${product.slug || product.id}`}
                                key={product.id}
                                className="search-result-card"
                            >
                                <div className="card-image">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} />
                                    ) : (
                                        <div className="card-image-placeholder">
                                            {product.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="card-info">
                                    <h4>{product.name.toUpperCase()}</h4>
                                    <p className="card-price">₺{product.price.toFixed(2)}</p>
                                    {product.description && (
                                        <p className="card-desc">
                                            {product.description.length > 80
                                                ? `${product.description.substring(0, 80)}...`
                                                : product.description}
                                        </p>
                                    )}
                                    {product.category && (
                                        <p className="card-category">{product.category}</p>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {!loading && !error && results.length === 0 && query && (
                    <div className="no-results-message">
                        <p>Lütfen farklı anahtar kelimelerle tekrar deneyin.</p>
                        <Link to="/categories/all" className="browse-all-link">
                            Tüm Ürünlere Göz At
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}