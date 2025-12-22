import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './Account.css';

// Tipleri buraya manuel tanımlıyoruz çünkü database.types.ts güncellenmediyse hata almayalım
interface OrderItem {
    id: string;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
    image_url: string | null;
}

interface Order {
    id: string;
    created_at: string;
    payment_status: string;
    total_amount: number;
    cargo_tracking_number?: string;
    cargo_tracking_url?: string;
    shipping_address?: {
        address: string;
        city: string;
        district?: string;
        postal_code?: string;
    };
    items: OrderItem[]; // Basitlik için JSONB veya ayrı tablodan çekilebilir, şimdilik ayrı tablo varsayalım
}

export default function OrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Not: 'orders' tablosu ve ilişkili 'order_items' tablosu varsayılıyor
            // Gerçekten var mı bilmiyoruz, henüz oluşturulmadıysa bu boş dönecektir veya hata verecektir.

            const { data, error } = await supabase
                .from('orders' as any)
                .select(`
          *,
          items:order_items (
            id,
            product_name,
            size,
            quantity,
            unit_price,
            image_url
          )
        `)
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Siparişler çekilirken hata:', error);
                // Tablo yoksa mock data gösterelim ki UI'ı test edebilelim
                setOrders([]);
            } else {
                setOrders(data as any || []);
            }
        } catch (error) {
            console.error('Beklenmeyen hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusMap: Record<string, string> = {
        // Sipariş Durumları
        pending: 'Beklemede',
        processing: 'Hazırlanıyor',
        shipped: 'Kargolandı',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi',
        // Ödeme Durumları
        paid: 'Ödendİ',
        unpaid: 'Ödenmedi',
        failed: 'Başarısız'
    };

    if (loading) {
        return <div className="text-center p-4">Yükleniyor...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="empty-orders">
                <h3>HENÜZ SİPARİŞİNİZ BULUNMUYOR.</h3>
                <p>Stilinizi yansıtacak parçaları keşfetmek için alışverişe başlayın.</p>
            </div>
        );
    }

    return (
        <div className="order-history">
            <h2>SİPARİŞ GEÇMİŞİ</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order.id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <span className="order-date">{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                                <span className="order-number">Sipariş No: #{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <span className={`order-status status-${order.payment_status}`}>
                                {statusMap[order.payment_status] || order.payment_status.toUpperCase()}
                            </span>
                        </div>

                        {/* Teslimat Adresi */}
                        {order.shipping_address && (
                            <div className="shipping-address-section">
                                <strong>TESLİMAT ADRESİ:</strong>
                                <p>
                                    {order.shipping_address.address}<br />
                                    {order.shipping_address.district && `${order.shipping_address.district}, `}
                                    {order.shipping_address.city}
                                    {order.shipping_address.postal_code && ` - ${order.shipping_address.postal_code}`}
                                </p>
                            </div>
                        )}

                        <div className="order-items">
                            {order.items?.map((item) => (
                                <div key={item.id} className="order-item">
                                    {item.image_url && (
                                        <img src={item.image_url} alt={item.product_name} className="item-image" />
                                    )}
                                    <div className="item-details">
                                        <span className="item-name">{item.product_name}</span>
                                        <span className="item-meta">Beden: {item.size} | Adet: {item.quantity}</span>
                                        <span className="item-price">₺{item.unit_price.toLocaleString('tr-TR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-footer">
                            <div className="order-actions">
                                <div className="cargo-info">
                                    {order.cargo_tracking_number ? (
                                        <>
                                            <strong>📦 DURUM:</strong>
                                            {order.cargo_tracking_url ? (
                                                <a
                                                    href={order.cargo_tracking_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="tracking-link"
                                                >
                                                    KARGOYA VERİLDİ - TAKİP ET ({order.cargo_tracking_number}) →
                                                </a>
                                            ) : (
                                                <span className="tracking-number">KARGOYA VERİLDİ: {order.cargo_tracking_number}</span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <strong>📦 DURUM:</strong>
                                            <span style={{ fontStyle: 'italic', color: '#666' }}>ÜRÜN HAZIRLANIYOR...</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="total-wrapper">
                                <span>TOPLAM</span>
                                <span className="total-amount">₺{order.total_amount.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
