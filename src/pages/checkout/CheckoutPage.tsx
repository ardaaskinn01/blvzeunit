import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/Modal';
import TermsOfServicePage from '../legal/TermsOfServicePage';
import PreliminaryInformationForm from '../legal/PreliminaryInformationForm';


import './CheckoutPage.css';

export default function CheckoutPage() {
    const { items, cartTotal, shippingCost, finalTotal, userAddress, saveAddressToStorage } = useCart();
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
        // Kart bilgileri (3DS Payment API için)
        cardHolderName: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: '',
    });

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPreliminary, setShowPreliminary] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [show3DS, setShow3DS] = useState(false);
    const [threeDSHtml, setThreeDSHtml] = useState('');


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
        }
    }, [userAddress]);

    // Kullanıcı oturum açmışsa e-posta adresini otomatik doldur
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({
                ...prev,
                email: user.email || ''
            }));
        }
    }, [user]);

    if (items.length === 0) {
        navigate('/cart');
        return null;
    }

    // 3DS Başarı Mesajını Dinle
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PAYMENT_SUCCESS') {
                // Başarılı ödeme -> Modal'ı kapat ve Yönlendir
                setShow3DS(false);
                setThreeDSHtml('');
                navigate(`/payment-callback?status=success&paymentId=${event.data.paymentId}`);
            } else if (event.data?.type === 'PAYMENT_FAILURE') {
                // Başarısız ödeme -> Modal'ı kapat ve hata göster
                setShow3DS(false);
                setThreeDSHtml('');
                alert('Ödeme başarısız: ' + (event.data.message || 'Bilinmeyen hata'));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [navigate]);

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

        // Kart bilgiler doğrulama
        if (!formData.cardHolderName.trim()) newErrors.cardHolderName = 'Kart sahibi adı zorunludur';
        if (!formData.cardNumber.trim()) {
            newErrors.cardNumber = 'Kart numarası zorunludur';
        } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
            newErrors.cardNumber = 'Geçerli bir kart numarası girin';
        }
        if (!formData.expireMonth) newErrors.expireMonth = 'Son kullanma ayı zorunludur';
        if (!formData.expireYear) newErrors.expireYear = 'Son kullanma yılı zorunludur';
        if (!formData.cvc.trim()) {
            newErrors.cvc = 'CVV zorunludur';
        } else if (formData.cvc.length < 3) {
            newErrors.cvc = 'CVV en az 3 hane olmalı';
        }

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
                    total_amount: finalTotal, // Kargo dahil toplam tutar
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
                product_id: item.product_id, // item.id contains size suffix (uuid-M), using product_id which is pure UUID
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

            // 3. iyzico Ödeme Başlatma
            const nameParts = formData.fullName.trim().split(' ');
            const surname = nameParts.length > 1 ? nameParts.pop() : 'Bey/Hanım';
            const firstName = nameParts.join(' ') || 'Değerli Müşteri';

            const paymentData = {
                orderId: orderData.id,
                basketId: orderData.id,
                price: cartTotal.toFixed(2), // Ürünlerin toplamı (kargo hariç)
                paidPrice: finalTotal.toFixed(2), // Ödenen toplam tutar (kargo dahil)
                currency: 'TRY',
                paymentGroup: 'PRODUCT',
                // callbackUrl backend'de ayarlanıyor
                paymentCard: {
                    cardHolderName: formData.cardHolderName,
                    cardNumber: formData.cardNumber.replace(/\s/g, ''),
                    expireYear: formData.expireYear,
                    expireMonth: formData.expireMonth,
                    cvc: formData.cvc,
                },
                buyer: {
                    id: user?.id || 'guest',
                    name: firstName,
                    surname: surname,
                    gsmNumber: `+90${formData.phone.replace(/\D/g, '').replace(/^0/, '').replace(/^90/, '')}`,
                    email: formData.email,
                    identityNumber: '11111111111',
                    registrationAddress: formData.fullAddress,
                    ip: '', // Backend handle edecek
                    city: formData.city,
                    country: 'Turkey',
                    zipCode: formData.zipCode
                },
                shippingAddress: {
                    contactName: formData.fullName,
                    city: formData.city,
                    country: 'Turkey',
                    address: formData.fullAddress,
                    zipCode: formData.zipCode
                },
                billingAddress: {
                    contactName: formData.fullName,
                    city: formData.city,
                    country: 'Turkey',
                    address: formData.fullAddress,
                    zipCode: formData.zipCode
                },
                basketItems: items.map(item => ({
                    id: item.product_id,
                    name: item.name,
                    category1: 'Clothing',
                    itemType: 'PHYSICAL',
                    price: (item.price * item.quantity).toFixed(2)
                }))
            };

            const response = await fetch('/.netlify/functions/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            // Yanıtı önce text olarak alıp kontrol edelim
            const responseText = await response.text();
            let result;

            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (e) {
                console.error('JSON Parse Hatası:', e);
                console.log('Ham Yanıt:', responseText);
                throw new Error('Sunucu yanıtı geçersiz (JSON değil).');
            }

            if (!response.ok) {
                const detailedError = result.message || result.error || 'Bilinmeyen hata';
                throw new Error(`Sunucu Hatası (${response.status}): ${detailedError}`);
            }

            if (result.success && result.threeDSHtmlContent) {
                // 3DS HTML content'i göster
                setThreeDSHtml(result.threeDSHtmlContent);
                setShow3DS(true);
                // PaymentId'yi session storage'a kaydet (callback için)
                sessionStorage.setItem('iyzico_paymentId', result.paymentId);
                sessionStorage.setItem('iyzico_orderId', orderData.id);
                sessionStorage.setItem('iyzico_paidPrice', finalTotal.toFixed(2));
                sessionStorage.setItem('iyzico_basketId', orderData.id);
            } else {
                throw new Error(result.error || 'Ödeme başlatılamadı');
            }

        } catch (error: any) {
            console.error('Sipariş/Ödeme Hatası:', error);
            alert('İşlem sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-container">
            <h1 className="checkout-header">Ödeme & Teslİmat</h1>

            {/* iyzico Integration Notice */}
            <div className="iyzico-notice">
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                        Güvenli Ödeme - İyzİco ile Korunuyorsunuz
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
                        Tüm ödemelerİnİz İyzİco'nun güvenli ödeme altyapısı ile 256-bit SSL şifrelemesİS altında İşlenİr.
                        Kredİ kartı Bİlgİlerİnİz hİçbİr zaman sİstemİmİzde saklanmaz.
                    </div>
                </div>
                <img
                    src="/iyzico-logo-pack/checkout_iyzico_ile_ode/TR/Tr_White/iyzico_ile_ode_white.png"
                    alt="iyzico"
                    style={{ height: '35px', width: 'auto', opacity: 0.95 }}
                />
            </div>

            <form onSubmit={handleSubmit} className="checkout-layout">
                {/* Sol Taraf: Adres Bilgileri */}
                <div className="form-section">
                    <h2 style={{ marginBottom: '1.5rem' }}>Teslİmat Bİlgİlerİ</h2>

                    {userAddress && (
                        <div className="user-info-box">
                            <p>Daha önce kaydettİğİniz adres otomatİk yüklendİ.</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Ad Soyad*</label>
                        <input
                            required
                            name="fullName"
                            className="form-input"
                            value={formData.fullName}
                            onChange={handleInputChange}
                        />
                        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta*</label>
                        <input
                            required
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Telefon Numarası*</label>
                        <input
                            required
                            type="tel"
                            name="phone"
                            placeholder="05XX XXX XX XX"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                        {errors.phone && <div className="error-message">{errors.phone}</div>}
                    </div>

                    <div className="grid-2-col">
                        <div className="form-group">
                            <label className="form-label">İl*</label>
                            <input
                                required
                                name="city"
                                placeholder="İliniz"
                                className="form-input"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                            {errors.city && <div className="error-message">{errors.city}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">İlçe*</label>
                            <input
                                required
                                name="district"
                                placeholder="İlçeniz"
                                className="form-input"
                                value={formData.district}
                                onChange={handleInputChange}
                            />
                            {errors.district && <div className="error-message">{errors.district}</div>}
                        </div>
                    </div>

                    <div className="grid-2-col">
                        <div className="form-group">
                            <label className="form-label">Posta Kodu*</label>
                            <input
                                required
                                name="zipCode"
                                placeholder="Posta kodunuz"
                                className="form-input"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                            />
                            {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Detaylı Adres (Sokak, Bİna No, Daİre No)*</label>
                        <textarea
                            required
                            name="fullAddress"
                            placeholder="Mahalle, sokak, bina no, daire no, kat..."
                            className="form-input"
                            value={formData.fullAddress}
                            onChange={(e) => handleInputChange(e as any)}
                            rows={3}
                        />
                        {errors.fullAddress && <div className="error-message">{errors.fullAddress}</div>}
                    </div>

                    <h2 style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>Ödeme Bİlgİlerİ</h2>

                    <div className="form-group">
                        <label className="form-label">Kart Sahİbİ Adı Soyadı*</label>
                        <input
                            required
                            name="cardHolderName"
                            placeholder="Kart üzerindeki isim"
                            className="form-input"
                            value={formData.cardHolderName}
                            onChange={handleInputChange}
                        />
                        {errors.cardHolderName && <div className="error-message">{errors.cardHolderName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Kart Numarası*</label>
                        <input
                            required
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            className="form-input"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            maxLength={19}
                        />
                        {errors.cardNumber && <div className="error-message">{errors.cardNumber}</div>}
                    </div>

                    <div className="grid-2-col">
                        <div className="form-group">
                            <label className="form-label">Son Kullanma Tarİhİ*</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <select
                                    required
                                    name="expireMonth"
                                    className="form-select"
                                    value={formData.expireMonth}
                                    onChange={(e) => handleInputChange(e as any)}
                                >
                                    <option value="">Ay</option>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const month = (i + 1).toString().padStart(2, '0');
                                        return <option key={month} value={month}>{month}</option>;
                                    })}
                                </select>
                                <select
                                    required
                                    name="expireYear"
                                    className="form-select"
                                    value={formData.expireYear}
                                    onChange={(e) => handleInputChange(e as any)}
                                >
                                    <option value="">Yıl</option>
                                    {Array.from({ length: 20 }, (_, i) => {
                                        const year = new Date().getFullYear() + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                            {errors.expireMonth && <div className="error-message">{errors.expireMonth}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">CVV*</label>
                            <input
                                required
                                name="cvc"
                                placeholder="123"
                                className="form-input"
                                value={formData.cvc}
                                onChange={handleInputChange}
                                maxLength={4}
                                type="text"
                                pattern="[0-9]*"
                            />
                            {errors.cvc && <div className="error-message">{errors.cvc}</div>}
                        </div>
                    </div>

                    {/* Sözleşme Onayı */}
                    <div className="checkbox-container">
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
                                    Ön Bİlgİlendİrme Formu
                                </span>
                                'nu ve{' '}
                                <span
                                    onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                                    style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}
                                >
                                    Mesafelİ Satış Sözleşmesİ
                                </span>
                                'ni okudum, onaylıyorum.*
                            </label>
                        </div>
                    </div>
                    {errors.terms && <div className="error-message">{errors.terms}</div>}

                </div>

                {/* Sağ Taraf: Özet */}
                <div className="summary-section">
                    <h3 style={{ marginBottom: '1.5rem' }}>SİPARİŞ ÖZETİ</h3>

                    <div className="items-container">
                        {items.map(item => (
                            <div key={item.id} className="summary-item">
                                <div className="item-image">
                                    <img
                                        src={item.image_url || ''}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="item-details">
                                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                                    <div style={{ color: '#000000ff' }}>Beden: {item.size}</div>
                                    <div style={{ color: '#000000ff' }}>{item.quantity} x {item.price.toLocaleString('tr-TR')} TL</div>
                                </div>
                                <div>{(item.price * item.quantity).toLocaleString('tr-TR')} TL</div>
                            </div>
                        ))}
                    </div>

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

                    <button
                        type="submit"
                        className="submit-btn"
                        style={{
                            backgroundColor: termsAccepted ? 'black' : '#ccc',
                            cursor: termsAccepted ? 'pointer' : 'not-allowed',
                        }}
                        disabled={!termsAccepted || isSubmitting}
                    >
                        {isSubmitting ? 'İşlenİyor...' : 'SİPARİŞİ TAMAMLA'}
                    </button>

                    {/* iyzico Payment Logo */}
                    <div className="iyzico-summary-logo">
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
                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#ffffffff' }}>
                            Güvenli ödeme altyapısı
                        </p>
                    </div>

                    <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#000000ff', textAlign: 'center' }}>
                        Ödeme İşlemİnİz İyzİco güvencesi ile yapılacaktır.
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

            {/* 3DS Doğrulama Modal'i */}
            {show3DS && threeDSHtml && (
                <div className="tds-overlay">
                    <div className="tds-modal">
                        <div className="tds-header">
                            3D Secure Doğrulama
                        </div>
                        <iframe
                            srcDoc={atob(threeDSHtml)}
                            className="tds-iframe"
                            title="3D Secure"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}