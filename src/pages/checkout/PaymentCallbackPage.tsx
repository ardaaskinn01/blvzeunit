import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function PaymentCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Ödeme durumunuz kontrol ediliyor...');

    useEffect(() => {
        // Eğer iframe içindeysek, parent'a mesaj at
        // Eğer iframe içindeysek, parent window'u yönlendir (Break out of iframe)
        if (window.self !== window.top && window.top) {
            const status = searchParams.get('status');
            const paymentId = searchParams.get('paymentId');
            const message = searchParams.get('message');

            const destination = status === 'success'
                ? `/payment-callback?status=success&paymentId=${paymentId}`
                : `/payment-callback?status=failure&message=${message || 'Unknown error'}`;

            window.top.location.href = destination;
            return;
        }

        const token = searchParams.get('token');
        const statusParam = searchParams.get('status');
        const messageParam = searchParams.get('message');

        // Yeni Akış (Status var)
        if (statusParam) {
            if (statusParam === 'success') {
                setStatus('success');
                setMessage('Ödemeniz başarıyla tamamlandı! Siparişiniz hazırlanıyor.');
                try {
                    clearCart();
                } catch (e) {
                    console.error('Sepet temizlenirken hata:', e);
                }
                setTimeout(() => navigate('/'), 3000);
            } else {
                setStatus('error');
                setMessage(messageParam || 'Ödeme işlemi başarısız oldu.');
                setTimeout(() => navigate('/checkout'), 3000);
            }
            return;
        }

        // Eski Akış (Sadece Token varsa)
        if (!token) {
            setStatus('error');
            setMessage('Ödeme bilgisi bulunamadı.');
            return;
        }

        // Call backend to verify payment (Legacy)
        fetch('/.netlify/functions/payment-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.paymentStatus === 'SUCCESS') {
                    setStatus('success');
                    setMessage('Ödemeniz başarıyla tamamlandı! Siparişiniz hazırlanıyor.');
                    clearCart();
                    setTimeout(() => navigate('/'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.errorMessage || 'Ödeme işlemi başarısız oldu.');
                }
            })
            .catch((error) => {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage('Ödeme doğrulama sırasında bir hata oluştu.');
            });
    }, [searchParams, navigate, clearCart]);

    const containerStyle: React.CSSProperties = {
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    };

    const cardStyle: React.CSSProperties = {
        maxWidth: '500px',
        width: '100%',
        background: '#fff',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    };

    const iconStyle: React.CSSProperties = {
        fontSize: '4rem',
        marginBottom: '1.5rem',
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
    };

    const messageStyle: React.CSSProperties = {
        color: '#666',
        lineHeight: '1.6',
        marginBottom: '2rem',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '0.75rem 2rem',
        background: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
        fontWeight: 600,
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {status === 'loading' && (
                    <>
                        <div style={iconStyle}>⏳</div>
                        <h1 style={titleStyle}>Lütfen Bekleyin</h1>
                        <p style={messageStyle}>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={iconStyle}>✅</div>
                        <h1 style={titleStyle}>Ödeme Başarılı!</h1>
                        <p style={messageStyle}>{message}</p>
                        <p style={{ fontSize: '0.875rem', color: '#888' }}>
                            Ana sayfaya yönlendiriliyorsunuz...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={iconStyle}>❌</div>
                        <h1 style={titleStyle}>Ödeme Başarısız</h1>
                        <p style={messageStyle}>{message}</p>
                        <button
                            style={buttonStyle}
                            onClick={() => navigate('/cart')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#000';
                            }}
                        >
                            Sepete Dön
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
