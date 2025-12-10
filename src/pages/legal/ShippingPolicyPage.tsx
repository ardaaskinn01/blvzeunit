
import './LegalPages.css';

export default function ShippingPolicyPage() {
    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Kargo Politikası</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <section>
                    <h2>1. Gönderim Süresi</h2>
                    <p>
                        Ürünler standart prosedür ile sipariş onayından sonraki 1-3 iş günü içerisinde kargoya verilir.
                        Özel üretim veya ön sipariş ürünlerinin teslimat süreleri ürün sayfasında belirtilmiştir.
                    </p>
                </section>

                <section>
                    <h2>2. Kargo Ücretleri</h2>
                    <p>
                        Belirli bir tutarın üzerindeki siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde standart kargo ücreti uygulanır.
                        Güncel kargo ücretleri ödeme sayfasında görüntülenebilir.
                    </p>
                </section>

                <section>
                    <h2>3. Teslimat Alanları</h2>
                    <p>
                        Türkiye'nin 81 iline gönderim yapmaktayız. Kırsal bölgelere teslimat süreleri kargo firmasının dağıtım planına göre değişiklik gösterebilir.
                    </p>
                </section>

                <section>
                    <h2>4. Hasarlı Teslimat</h2>
                    <p>
                        Kargonuzu teslim alırken pakette hasar olup olmadığını kontrol ediniz. Hasar durumunda kargo görevlisine tutanak tutturarak ürünü teslim almayınız
                        ve bizimle iletişime geçiniz.
                    </p>
                </section>
            </div>
        </div>
    );
}
