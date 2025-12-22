import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';


// Basit CSS (App.css veya yeni Cart.css içinde olabilir, şimdilik inline style veya basit classlar kullanacağız)
import './CartPage.css';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, shippingCost, finalTotal, userAddress } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="cart-container">
                <h1 className="cart-header">Alışveriş Sepeti</h1>
                <div className="empty-cart">
                    <h2>Sepetiniz boş</h2>
                    <p style={{ margin: '1rem 0 2rem' }}>Henüz sepetinize ürün eklemediniz.</p>
                    <Link to="/categories/all" className="checkout-btn" style={{ display: 'inline-block', width: 'auto' }}>
                        Alışverİşe Devam Et
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1 className="cart-header">Alışveriş Sepeti ({items.length} Ürün)</h1>

            {/* Kayıtlı adres bilgisi gösterimi */}
            {userAddress && (
                <div className="address-notice">
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
            )}

            <div className="cart-grid">
                {/* Liste */}
                <div>
                    {items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img
                                src={item.image_url || '/placeholder.png'}
                                alt={item.name}
                                className="cart-item-image"
                            />

                            <div className="cart-item-info">
                                <Link to={`/products/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 className="cart-item-title">{item.name}</h3>
                                </Link>
                                <div className="cart-item-meta">Beden: {item.size}</div>
                                <div className="cart-item-meta">Birim Fiyat: {item.price.toLocaleString('tr-TR')} TL</div>

                                <div className="quantity-control">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span style={{ margin: '0 0.5rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        className="quantity-btn"
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
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Kaldır
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Özet */}
                <div className="cart-summary">
                    <h2 style={{ marginBottom: '1.5rem' }}>Sipariş Özeti</h2>

                    <div className="summary-row">
                        <span>Ara Toplam</span>
                        <span>{cartTotal.toLocaleString('tr-TR')} TL</span>
                    </div>

                    <div className="summary-row">
                        <span>Kargo</span>
                        <span>{shippingCost === 0 ? 'Ücretsiz' : `${shippingCost.toLocaleString('tr-TR')} TL`}</span>
                    </div>

                    <div className="total-row">
                        <span>Toplam</span>
                        <span>{finalTotal.toLocaleString('tr-TR')} TL</span>
                    </div>

                    <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                        {userAddress ? 'Ödemeye Geç' : 'Adres Bilgilerini Doldur'}
                    </button>
                </div>
            </div>
        </div>
    );
}
