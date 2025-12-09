import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';


// Basit CSS (App.css veya yeni Cart.css içinde olabilir, şimdilik inline style veya basit classlar kullanacağız)
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '60vh',
    },
    header: {
        fontSize: '2rem',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem',
    },
    emptyCart: {
        textAlign: 'center' as const,
        padding: '4rem 0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '4rem',
    },
    item: {
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #eee',
        alignItems: 'center',
    },
    image: {
        width: '100px',
        height: '100px',
        objectFit: 'cover' as const,
        borderRadius: '8px',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
    },
    itemMeta: {
        color: '#666',
        marginBottom: '0.5rem',
    },
    quantityControl: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
    },
    btn: {
        padding: '0.25rem 0.75rem',
        border: '1px solid #ddd',
        background: 'white',
        cursor: 'pointer',
        borderRadius: '4px',
    },
    removeBtn: {
        color: 'red',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        marginLeft: 'auto',
        fontSize: '0.9rem',
        textDecoration: 'underline',
    },
    summary: {
        background: '#f9f9f9',
        padding: '2rem',
        borderRadius: '12px',
        height: 'fit-content',
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        fontSize: '1.1rem',
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid #ddd',
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    checkoutBtn: {
        width: '100%',
        padding: '1rem',
        background: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        marginTop: '2rem',
        cursor: 'pointer',
        fontWeight: '600',
    }
};

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, userAddress } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div style={styles.container}>
                <h1 style={styles.header}>Alışveriş Sepeti</h1>
                <div style={styles.emptyCart}>
                    <h2>Sepetiniz boş</h2>
                    <p style={{ margin: '1rem 0 2rem' }}>Henüz sepetinize ürün eklemediniz.</p>
                    <Link to="/categories/all" style={{ ...styles.checkoutBtn, display: 'inline-block', width: 'auto', textDecoration: 'none' }}>
                        Alışverişe Devam Et
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Alışveriş Sepeti ({items.length} Ürün)</h1>

            {/* Kayıtlı adres bilgisi gösterimi */}
            {userAddress && (
                <div style={{
                    background: '#f0f8ff',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    border: '1px solid #b3d9ff',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>📦 Kayıtlı Adresiniz:</strong>
                            <div style={{ marginTop: '0.5rem' }}>
                                {userAddress.recipientName} - {userAddress.city}/{userAddress.district}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#0066cc',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem',
                            }}
                        >
                            Değiştir
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.grid}>
                {/* Liste */}
                <div>
                    {items.map((item) => (
                        <div key={item.id} style={styles.item}>
                            <img
                                src={item.image_url || '/placeholder.png'}
                                alt={item.name}
                                style={styles.image}
                            />

                            <div style={styles.itemInfo}>
                                <Link to={`/products/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 style={styles.itemTitle}>{item.name}</h3>
                                </Link>
                                <div style={styles.itemMeta}>Beden: {item.size}</div>
                                <div style={styles.itemMeta}>Birim Fiyat: {item.price.toLocaleString('tr-TR')} TL</div>

                                <div style={styles.quantityControl}>
                                    <button
                                        style={styles.btn}
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span style={{ margin: '0 0.5rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        style={styles.btn}
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {(item.price * item.quantity).toLocaleString('tr-TR')} TL
                                </div>
                                <button
                                    style={styles.removeBtn}
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Kaldır
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Özet */}
                <div style={styles.summary}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Sipariş Özeti</h2>

                    <div style={styles.summaryRow}>
                        <span>Ara Toplam</span>
                        <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span>Kargo</span>
                        <span>Ücretsiz</span>
                    </div>

                    <div style={styles.totalRow}>
                        <span>Toplam</span>
                        <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                    </div>

                    <button style={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
                        {userAddress ? 'Ödemeye Geç' : 'Adres Bilgilerini Doldur'}
                    </button>
                </div>
            </div>
        </div>
    );
}