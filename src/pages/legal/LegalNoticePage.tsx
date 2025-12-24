
import './LegalPages.css';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function LegalNoticePage() {
    const { settings } = useSiteSettings();
    // ... (mevcut import ve component tanımı)

    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Yasal Bildirim</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <section>
                    <h2>Firma Bilgileri</h2>
                    <div className="company-info">
                        {/* Yasal Zorunlu Unvan: Şahıs şirketi sahibinin adı */}
                        <p><strong>Unvan:</strong> HÜSEYİN CEYLAN</p>
                        <p><strong>Marka Adı:</strong> BLVZEUNIT</p>
                        <p><strong>Adres:</strong> {settings.contact_address}</p>
                        <p><strong>Email:</strong> <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></p>
                        {/* Zorunlu Bilgiler */}
                        {settings.contact_phone && <p><strong>Telefon:</strong> {settings.contact_phone}</p>}
                        <p><strong>Vergi Dairesi:</strong> Karabağlar Vergi Dairesi Müdürlüğü</p>
                        {/* VKN/TCKN yasal unvanın kim olduğunu belirtir */}
                        <p><strong>Vergi Numarası:</strong> 2080909268</p>
                        <p>
                            <strong>ETBİS Kayıt No:</strong> 6152243016
                            <span style={{ fontSize: '0.9rem', marginLeft: '5px' }}>
                                (<a href="https://etbis.ticaret.gov.tr/tr/Home/SearchSite?url=blvzeunit" target="_blank" rel="noopener noreferrer">Sorgula</a>)
                            </span>
                        </p>
                    </div>
                </section>

                <section>
                    <h2>Telif Hakkı</h2>
                    <p>
                        Bu web sitesindeki tüm içerik (metinler, görseller, logolar vb.) BLVZEUNIT'e aittir ve ulusal/uluslararası telif hakkı yasalarıyla korunmaktadır.
                        İzin alınmadan kullanılamaz.
                    </p>
                </section>

                {/* ⚠️ Önemli: Elektronik Ticaret Bilgilendirme Yükümlülüğü */}
                <section>
                    <h2>Hizmet Sağlayıcı Bilgileri</h2>
                    <p>
                        6563 Sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca, bu web sitesinin hizmet sağlayıcısı:
                        BLVZEUNIT (Yukarıda belirtilen adres ve iletişim bilgileri ile.)
                    </p>
                </section>

                {/* ⚠️ Zorunlu: KVKK ve Çerez Politikası Linkleri */}
                <section>
                    <h2>Gizlilik ve Kişisel Veriler</h2>
                    <p>
                        Kişisel verilerinizin işlenmesi, korunması ve çerez kullanımımıza ilişkin tüm detaylara
                        <a href="/privacy-policy"> Gizlilik Politikası</a> sayfamızdan ulaşabilirsiniz.
                        Bu politika, aynı zamanda Çerez Politikamızı ve 6698 sayılı KVKK yükümlülüklerimizi de kapsamaktadır.
                    </p>
                </section>



                {/* ⚠️ Şart ve Koşullar (Link zorunludur) */}
                <section>
                    <h2>Diğer Yasal Metinler</h2>
                    <p>
                        Sitemizden alışveriş yapmadan önce lütfen <a href="/terms-of-service">Kullanım Şartları</a> metinlerini okuyunuz.
                    </p>
                </section>
            </div>
        </div>
    );
}
