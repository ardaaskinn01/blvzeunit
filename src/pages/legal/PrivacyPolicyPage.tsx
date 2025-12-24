import './LegalPages.css';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function PrivacyPolicyPage() {
    const { settings } = useSiteSettings();
    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Gizlilik Politikası</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <div className="policy-intro">
                    <p>
                        <strong>BLVZEUNIT</strong> olarak, müşterilerimizin gizlilik haklarına büyük önem veriyoruz.
                        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
                        kapsamında kişisel verilerinizin işlenmesi ve korunmasına ilişkin politikamız aşağıda açıklanmıştır.
                    </p>
                </div>

                <section>
                    <h2>1. Veri Sorumlusu</h2>
                    <p>
                        <strong>Veri Sorumlusu:</strong> BLVZEUNIT
                        <br />
                        <strong>Adres:</strong> {settings.contact_address}
                        <br />
                        <strong>E-posta:</strong> <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                        <strong>ETBİS Kayıt No:</strong> 6152243016
                    </p>
                </section>

                <section>
                    <h2>2. Toplanan Kişisel Veriler ve İşleme Amaçları</h2>
                    <p>Web sitemiz ve hizmetlerimiz aracılığıyla aşağıdaki kişisel verileri topluyoruz:</p>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Veri Kategorisi</th>
                                    <th>Toplama Yöntemi</th>
                                    <th>İşleme Amacı</th>
                                    <th>Hukuki Dayanak</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Kimlik Bilgileri</strong><br />(Ad, Soyad)</td>
                                    <td>Sipariş formu, üyelik kaydı</td>
                                    <td>Sipariş işleme, fatura kesme, yasal yükümlülükler</td>
                                    <td>KVKK md. 5/2-ç</td>
                                </tr>
                                <tr>
                                    <td><strong>İletişim Bilgileri</strong><br />(E-posta, telefon, adres)</td>
                                    <td>Sipariş formu, iletişim formu</td>
                                    <td>Sipariş teslimatı, müşteri iletişimi</td>
                                    <td>KVKK md. 5/2-ç, açık rıza</td>
                                </tr>
                                <tr>
                                    <td><strong>Kullanım Verileri</strong><br />(Sipariş geçmişi)</td>
                                    <td>Site etkileşimleri</td>
                                    <td>Kişiselleştirilmiş hizmet, müşteri memnuniyeti</td>
                                    <td>Açık rıza, meşru menfaat</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="note">
                        <strong>Not:</strong> Kredi kartı bilgileriniz ödeme işlemcisi (Iyzico) tarafından işlenmekte olup,
                        bizim sistemlerimizde saklanmamaktadır.
                    </p>
                </section>

                <section>
                    <h2>3. Verilerin Korunması ve Saklanması</h2>
                    <p>
                        Kişisel verileriniz, <strong>Supabase</strong> platformunda şifrelenmiş olarak saklanmaktadır.
                        Veri güvenliği için aşağıdaki önlemleri alıyoruz:
                    </p>
                    <ul>
                        <li>SSL/TLS şifreleme kullanımı</li>
                        <li>Veritabanı şifreleme ve yedekleme</li>
                        <li>Düzenli güvenlik denetimleri</li>
                    </ul>
                    <p>
                        Verileriniz, yasal saklama süreleri ve işleme amaçları doğrultusunda saklanır.
                        Süre sonunda verileriniz anonimleştirilir, silinir veya imha edilir.
                    </p>
                </section>

                <section>
                    <h2>4. Veri Paylaşımı ve Aktarımı</h2>
                    <p>
                        Kişisel verileriniz, yalnızca aşağıdaki durumlarda paylaşılmaktadır:
                    </p>
                    <ul>
                        <li>
                            <strong>Hizmet Sağlayıcılar: </strong>
                            Kargo firması, ödeme işlemcileri ile sınırlı veri paylaşımı
                        </li>
                        <li>
                            <strong>Yasal Zorunluluklar: </strong>
                            Mahkeme kararı, kanuni düzenlemeler gereği resmi makamlara
                        </li>
                    </ul>
                </section>

                <section>
                    <h2>5. Çerez Politikası</h2>
                    <p>
                        Web sitemizde aşağıdaki çerez türlerini kullanıyoruz:
                    </p>

                    <div className="cookie-types">
                        <div className="cookie-type">
                            <h3>Zorunlu Çerezler</h3>
                            <p>Sitenin temel işlevselliği için gereklidir. Oturum yönetimi, güvenlik özellikleri.</p>
                        </div>

                        <div className="cookie-type">
                            <h3>İşlevsellik Çerezleri</h3>
                            <p>Sepetteki ürünler, kullanıcı tercihlerinin hatırlanması.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>6. Haklarınızı Kullanma</h2>
                    <p>
                        Yukarıda belirtilen haklarınızı kullanmak için:
                    </p>
                    <ol>
                        <li>
                            <strong>E-posta:</strong> <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a> adresine yazılı başvuru ile
                        </li>
                    </ol>
                    <p>
                        Başvurunuz en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.
                        Reddedilmesi halinde gerekçesi yazılı olarak bildirilecektir.
                    </p>
                </section>

                <section>
                    <h2>7. Politika Değişiklikleri</h2>
                    <p>
                        Gizlilik politikamızı güncelleyebiliriz. Değişiklikler sitede yayınlandığında yürürlüğe girer.
                        Önemli değişikliklerden sizi e-posta ile haberdar ederiz.
                        Bu sayfanın "Son Güncelleme" tarihini düzenli olarak kontrol etmenizi öneririz.
                    </p>
                </section>

                <section className="contact-section">
                    <h2>8. İletişim</h2>
                    <p>
                        Gizlilik politikamız veya veri işleme uygulamalarımız hakkında sorularınız için:
                    </p>
                    <div className="contact-details">
                        <p><strong>Veri Sorumlusu:</strong> BLVZEUNIT</p>
                        <p><strong>Adres:</strong> {settings.contact_address}</p>
                        <p><strong>E-posta:</strong> <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></p>
                    </div>
                </section>

                <div className="legal-footer">
                    <p>
                        Bu politika 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat hükümlerine uygun olarak hazırlanmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
}