import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import TermsOfServicePage from '../legal/TermsOfServicePage';
import PreliminaryInformationForm from '../legal/PreliminaryInformationForm';


const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '70vh',
    } as React.CSSProperties,
    header: {
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem',
    } as React.CSSProperties,
    layout: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '3rem',
    } as React.CSSProperties,
    formSection: {
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #eee',
    } as React.CSSProperties,
    formGroup: {
        marginBottom: '1.5rem',
    } as React.CSSProperties,
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 500,
    } as React.CSSProperties,
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
    } as React.CSSProperties,
    select: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '1rem',
        backgroundColor: 'white',
    } as React.CSSProperties,
    summarySection: {
        background: '#f9f9f9',
        padding: '2rem',
        borderRadius: '12px',
        height: 'fit-content',
        position: 'sticky' as 'sticky',
        top: '2rem',
    } as React.CSSProperties,
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
    } as React.CSSProperties,
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '2px solid #ddd',
        fontSize: '1.25rem',
        fontWeight: 'bold' as 'bold',
    } as React.CSSProperties,
    submitBtn: {
        width: '100%',
        padding: '1rem',
        background: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1.1rem',
        marginTop: '2rem',
        cursor: 'pointer',
        fontWeight: 600,
    } as React.CSSProperties,
    checkboxContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '6px',
    } as React.CSSProperties,
    error: {
        color: '#dc3545',
        fontSize: '0.875rem',
        marginTop: '0.25rem',
    } as React.CSSProperties,
    userInfo: {
        background: '#e8f4ff',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
    } as React.CSSProperties,
    itemsContainer: {
        marginBottom: '1.5rem',
        maxHeight: '300px',
        overflowY: 'auto' as 'auto',
    } as React.CSSProperties,
    itemContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        fontSize: '0.9rem',
    } as React.CSSProperties,
    itemImage: {
        width: '50px',
        height: '50px',
        background: '#eee',
        borderRadius: '4px',
        overflow: 'hidden' as 'hidden',
    } as React.CSSProperties,
    itemDetails: {
        flex: 1,
    } as React.CSSProperties,
    grid2Col: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    } as React.CSSProperties,
};

export default function CheckoutPage() {
    const { items, cartTotal, clearCart, userAddress, saveAddressToStorage } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        city: '',
        district: '',
        fullAddress: '',
        zipCode: '',
    });

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPreliminary, setShowPreliminary] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});


    // Kullanıcı adresi varsa formu doldur
    useEffect(() => {
        if (userAddress) {
            setFormData(prev => ({
                ...prev,
                fullName: userAddress.recipientName || '',
                phone: userAddress.phone || '',
                city: userAddress.city || '',
                fullAddress: userAddress.fullAddress || '',
                zipCode: userAddress.zipCode || '',
                district: userAddress.district || '',
            }));
            // İleri seviye: userAddress'teki şehir isminden cityCode bulup districts çekilebilir
            // Şimdilik kullanıcı tekrar seçsin
        }
    }, [userAddress]);

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Hata mesajını temizle
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };


    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Ad Soyad zorunludur';
        if (!formData.email.trim()) {
            newErrors.email = 'E-posta zorunludur';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Telefon numarası zorunludur';
        if (!formData.city.trim()) newErrors.city = 'İl seçimi zorunludur';
        if (!formData.district.trim()) newErrors.district = 'İlçe seçimi zorunludur';
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Detaylı adres zorunludur';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Posta kodu zorunludur';
        if (!termsAccepted) newErrors.terms = 'Sözleşmeleri kabul etmelisiniz';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Lütfen tüm zorunlu alanları doldurun ve sözleşmeleri kabul edin.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Adresi kaydet
            const address = {
                city: formData.city,
                district: formData.district,
                neighborhood: '',
                fullAddress: formData.fullAddress,
                zipCode: formData.zipCode,
                phone: formData.phone,
                recipientName: formData.fullName,
            };

            saveAddressToStorage(address);

            // 1. Siparişi Oluştur
            const { data: orderData, error: orderError } = await (supabase as any)
                .from('orders')
                .insert({
                    user_id: user?.id || null, // Giriş yapmışsa user id, yoksa null
                    status: 'pending', // Sipariş alındı - Hazırlanacak
                    total_amount: cartTotal,
                    currency: 'TRY',
                    shipping_address: {
                        full_name: formData.fullName,
                        address: formData.fullAddress,
                        city: formData.city,
                        district: formData.district,
                        zip_code: formData.zipCode,
                        country: 'Turkey'
                    },
                    contact_info: {
                        email: formData.email,
                        phone: formData.phone
                    }
                })
                .select()
                .single();

            if (orderError) throw orderError;

            if (!orderData) throw new Error('Sipariş oluşturulamadı.');

            // 2. Sipariş Kalemlerini (Items) Oluştur
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                size: item.size,
                product_name: item.name,
                image_url: item.image_url
            }));

            const { error: itemsError } = await (supabase as any)
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Sepeti temizle ve yönlendir
            console.log('Sipariş Başarıyla Kaydedildi:', orderData);
            clearCart();
            alert('Siparişiniz başarıyla alındı! Teşekkür ederiz.');
            navigate('/');

        } catch (error: any) {
            console.error('Sipariş Hatası:', error);
            alert('Sipariş oluşturulurken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Ödeme & Teslimat</h1>

            {/* iyzico Integration Notice */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
            }}>
                <div style={{ fontSize: '2rem' }}>🔒</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        Güvenli Ödeme - iyzico ile Korunuyorsunuz
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
                        Tüm ödemeleriniz iyzico'nun güvenli ödeme altyapısı ile 256-bit SSL şifrelemesi altında işlenir.
                        Kredi kartı bilgileriniz hiçbir zaman sistemimizde saklanmaz.
                    </div>
                </div>
                <img
                    src="/iyzico-logo-pack/checkout_iyzico_ile_ode/TR/Tr_White/iyzico_ile_ode_white.png"
                    alt="iyzico"
                    style={{ height: '35px', width: 'auto', opacity: 0.95 }}
                />
            </div>

            <form onSubmit={handleSubmit} style={styles.layout}>
                {/* Sol Taraf: Adres Bilgileri */}
                <div style={styles.formSection}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Teslimat Bilgileri</h2>

                    {userAddress && (
                        <div style={styles.userInfo}>
                            <p>✅ Daha önce kaydettiğiniz adres otomatik yüklendi.</p>
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Ad Soyad*</label>
                        <input
                            required
                            name="fullName"
                            style={styles.input}
                            value={formData.fullName}
                            onChange={handleInputChange}
                        />
                        {errors.fullName && <div style={styles.error}>{errors.fullName}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>E-posta*</label>
                        <input
                            required
                            type="email"
                            name="email"
                            style={styles.input}
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <div style={styles.error}>{errors.email}</div>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Telefon Numarası*</label>
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="05XX XXX XX XX"
                            style={styles.input}
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                        {errors.phone && <div style={styles.error}>{errors.phone}</div>}
                    </div>

                    <div style={styles.grid2Col}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>İl*</label>
                            <input
                                required
                                name="city"
                                placeholder="Örn: İstanbul"
                                style={styles.input}
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                            {errors.city && <div style={styles.error}>{errors.city}</div>}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>İlçe*</label>
                            <input
                                required
                                name="district"
                                placeholder="Örn: Kadıköy"
                                style={styles.input}
                                value={formData.district}
                                onChange={handleInputChange}
                            />
                            {errors.district && <div style={styles.error}>{errors.district}</div>}
                        </div>
                    </div>

                    <div style={styles.grid2Col}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Posta Kodu*</label>
                            <input
                                required
                                name="zipCode"
                                placeholder="34000"
                                style={styles.input}
                                value={formData.zipCode}
                                onChange={handleInputChange}
                            />
                            {errors.zipCode && <div style={styles.error}>{errors.zipCode}</div>}
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Detaylı Adres (Sokak, Bina No, Daire No)*</label>
                        <textarea
                            required
                            name="fullAddress"
                            placeholder="Mahalle, sokak, bina no, daire no, kat..."
                            style={styles.input}
                            value={formData.fullAddress}
                            onChange={(e) => handleInputChange(e as any)}
                            rows={3}
                        />
                        {errors.fullAddress && <div style={styles.error}>{errors.fullAddress}</div>}
                    </div>

                    {/* Sözleşme Onayı */}
                    <div style={styles.checkboxContainer}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                style={{ cursor: 'pointer', marginTop: '0.3rem' }}
                            />
                            <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: '1.4', fontSize: '0.95rem' }}>
                                <span
                                    onClick={(e) => { e.preventDefault(); setShowPreliminary(true); }}
                                    style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}
                                >
                                    Ön Bilgilendirme Formu
                                </span>
                                'nu ve{' '}
                                <span
                                    onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                                    style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}
                                >
                                    Mesafeli Satış Sözleşmesi
                                </span>
                                'ni okudum, onaylıyorum.*
                            </label>
                        </div>
                    </div>
                    {errors.terms && <div style={styles.error}>{errors.terms}</div>}

                </div>

                {/* Sağ Taraf: Özet */}
                <div style={styles.summarySection}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Sipariş Özeti</h3>

                    <div style={styles.itemsContainer}>
                        {items.map(item => (
                            <div key={item.id} style={styles.itemContainer}>
                                <div style={styles.itemImage}>
                                    <img
                                        src={item.image_url || ''}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' as 'cover' }}
                                    />
                                </div>
                                <div style={styles.itemDetails}>
                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ color: '#666' }}>Beden: {item.size}</div>
                                    <div style={{ color: '#666' }}>{item.quantity} x {item.price.toLocaleString('tr-TR')} TL</div>
                                </div>
                                <div>{(item.price * item.quantity).toLocaleString('tr-TR')} TL</div>
                            </div>
                        ))}
                    </div>

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

                    <button
                        type="submit"
                        style={{
                            ...styles.submitBtn,
                            backgroundColor: termsAccepted ? 'black' : '#ccc',
                            cursor: termsAccepted ? 'pointer' : 'not-allowed',
                        }}
                        disabled={!termsAccepted || isSubmitting}
                    >
                        {isSubmitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
                    </button>

                    {/* iyzico Payment Logo */}
                    <div style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #eee'
                    }}>
                        <img
                            src="/iyzico-logo-pack/checkout_iyzico_ile_ode/TR/Tr_White/iyzico_ile_ode_white.png"
                            alt="iyzico ile güvenli ödeme"
                            style={{
                                height: '45px',
                                width: 'auto',
                                display: 'block',
                                margin: '0 auto',
                                filter: 'brightness(0) invert(1)'
                            }}
                        />
                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#666' }}>
                            Güvenli ödeme altyapısı
                        </p>
                    </div>

                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
                        Ödeme işleminiz iyzico güvencesi ile yapılacaktır.
                    </p>
                </div>
            </form>


            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Mesafeli Satış Sözleşmesi"
            >
                {/* Modal içinde sayfa stilini biraz override ediyoruz */}
                <div style={{ fontSize: '0.9rem' }}>
                    <style>{`
                        .legal-page-container {
                            padding: 0 !important;
                            min-height: auto !important;
                        }
                        .legal-content {
                            box-shadow: none !important;
                            padding: 0 !important;
                        }
                    `}</style>
                    <TermsOfServicePage />
                </div>
            </Modal>

            <Modal
                isOpen={showPreliminary}
                onClose={() => setShowPreliminary(false)}
                title="Ön Bilgilendirme Formu"
            >
                <div style={{ fontSize: '0.9rem' }}>
                    <style>{`
                        .legal-page-container {
                            padding: 0 !important;
                            min-height: auto !important;
                        }
                        .legal-content {
                            box-shadow: none !important;
                            padding: 0 !important;
                        }
                    `}</style>
                    <PreliminaryInformationForm />
                </div>
            </Modal>
        </div>
    );
}