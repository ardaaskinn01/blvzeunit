import './LegalPages.css';

export default function TermsOfServicePage() {
    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Kullanım Şartları ve Mesafeli Satış Sözleşmesi</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <div className="agreement-intro">
                    <p>
                        <strong>ÖNEMLİ:</strong> BLVZEUNIT web sitesini kullanmadan önce bu kullanım şartlarını ve mesafeli satış sözleşmesini dikkatlice okuyunuz.
                        Siteyi kullanmanız bu şartları kabul ettiğiniz anlamına gelir.
                    </p>
                </div>

                <section>
                    <h2>1. TARAFLAR VE TANIMLAR</h2>
                    <div className="definitions">
                        <p><strong>Satıcı (BLVZEUNIT):</strong> Ürünleri satan ve hizmet sunan taraf</p>
                        <p><strong>Alıcı (Müşteri):</strong> Ürünleri satın alan gerçek veya tüzel kişi</p>
                        <p><strong>Ürün:</strong> BLVZEUNIT tarafından satışa sunulan giyim ürünleri</p>
                        <p><strong>Sipariş:</strong> Alıcı tarafından verilen ve Satıcı tarafından kabul edilen satın alma talebi</p>
                        <p><strong>Sözleşme:</strong> Bu Kullanım Şartları ve Mesafeli Satış Sözleşmesi</p>
                    </div>
                </section>

                <section>
                    <h2>2. SÖZLEŞMENİN KONUSU</h2>
                    <p>
                        Bu sözleşme, BLVZEUNIT'in web sitesi üzerinden sunduğu ürünlerin satışına ve sitenin kullanımına ilişkin
                        şartları ve tarafların hak ve yükümlülüklerini düzenler.
                    </p>
                </section>

                <section>
                    <h2>3. HESAP OLUŞTURMA VE GÜVENLİK</h2>
                    <ol className="detailed-list">
                        <li>
                            <strong>Üyelik:</strong> Site üzerinden alışveriş yapmak için üyelik oluşturmanız gerekebilir.
                        </li>
                        <li>
                            <strong>Doğru Bilgi:</strong> Üyelik formunda gerçek, doğru ve güncel bilgiler vermekle yükümlüsünüz.
                        </li>
                        <li>
                            <strong>Hesap Güvenliği:</strong> Hesap bilgilerinizin gizliliğinden ve güvenliğinden siz sorumlusunuz.
                        </li>
                        <li>
                            <strong>Yetkisiz Kullanım:</strong> Hesabınızın yetkisiz kullanımından doğacak tüm sorumluluk size aittir.
                        </li>
                        <li>
                            <strong>Hesap Askıya Alma:</strong> Şartlara aykırı kullanım durumunda hesabınız askıya alınabilir veya silinebilir.
                        </li>
                    </ol>
                </section>

                <section>
                    <h2>4. SİPARİŞ VE SÖZLEŞMENİN KURULMASI</h2>
                    <ol className="detailed-list">
                        <li>
                            <strong>Teklif:</strong> Web sitedeki ürünler müşteriye satış teklifidir.
                        </li>
                        <li>
                            <strong>Kabul:</strong> Siparişinizi tamamlayıp "Siparişi Onayla" butonuna tıklamanız teklifimizi kabul ettiğiniz anlamına gelir.
                        </li>
                        <li>
                            <strong>Sipariş Onayı:</strong> Siparişiniz otomatik olarak onaylanır ve onay e-postası gönderilir.
                        </li>
                        <li>
                            <strong>Fiyat Değişikliği:</strong> Siparişinizdeki fiyatlar, sipariş anındaki fiyatlardır.
                        </li>
                    </ol>
                </section>

                <section>
                    <h2>5. FİYATLANDIRMA VE ÖDEME</h2>
                    <div className="payment-details">
                        <h3>5.1. Fiyatlar</h3>
                        <ul>
                            <li>Tüm fiyatlar Türk Lirası (₺) cinsindendir.</li>
                            <li>Fiyatlara KDV dahildir.</li>
                            <li>Fiyatlar stok durumuna ve kampanyalara göre değişebilir.</li>
                            <li>Sipariş anındaki fiyat geçerlidir.</li>
                        </ul>

                        <h3>5.2. Ödeme Seçenekleri</h3>
                        <ul>
                            <li>Kredi Kartı</li>
                            <li>Banka Kartı</li>
                            <li>Ön Ödemeli Kart</li>
                        </ul>

                        <h3>5.3. Ödeme Kuralları</h3>
                        <ul>
                            <li>Havale/EFT ile ödemelerde sipariş onayı 24 saat içinde yapılmalıdır.</li>
                            <li>Kapıda ödemede ek hizmet bedeli uygulanabilir.</li>
                            <li>Ödeme işlemleri üçüncü taraf ödeme sistemleri üzerinden yapılır.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>6. TESLİMAT VE NAKLİYE</h2>
                    <div className="shipping-details">
                        <h3>6.1. Teslimat Süreleri</h3>
                        <ul>
                            <li>Kargoya Teslim (Standart Prosedür): 1-3 iş günü</li>
                            <li>Kargo Firmasından Alıcıya Teslim: 1-3 iş günü</li>
                            <li>Kargo firmasının yoğunluğuna göre süreler değişebilir.</li>
                        </ul>

                        <h3>6.2. Teslimat Kuralları</h3>
                        <ul>
                            <li>Teslimat adresinin doğru ve güncel olması müşteri sorumluluğundadır.</li>
                            <li>Adres hatalarından kaynaklanan gecikmelerden satıcı sorumlu değildir.</li>
                            <li>Ürün teslim alınırken kargo personeli önünde kontrol edilmelidir.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>7. İADE VE DEĞİŞİM</h2>
                    <div className="return-policy">
                        <p>
                            İade ve değişim koşulları <a href="/refund-policy">Para İade Politikası</a> sayfamızda detaylandırılmıştır.
                            Özetle:
                        </p>
                        <ul>
                            <li>14 gün içinde iade hakkı</li>
                            <li>Ürün kullanılmamış ve etiketi sökülmemiş olmalı</li>
                            <li>İade kargo ücreti müşteriye aittir</li>
                            <li>İade onayı sonrası 7-10 iş gününde para iadesi</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>8. GARANTİ VE SORUMLULUK</h2>
                    <div className="warranty-terms">
                        <h3>8.1. Ürün Garantisi</h3>
                        <ul>
                            <li>İmalat hatası durumunda ücretsiz tamir veya değişim.</li>
                            <li>Kullanıcı hatasından kaynaklanan hasarlar garanti kapsamında değildir.</li>
                        </ul>

                        <h3>8.2. Sorumluluk Sınırlaması</h3>
                        <p>
                            BLVZEUNIT, aşağıdaki durumlardan sorumlu tutulamaz:
                        </p>
                        <ul>
                            <li>Doğal afet, savaş, grev gibi mücbir sebepler</li>
                            <li>Alıcının verdiği yanlış bilgiler</li>
                            <li>Kargo firmasının gecikme veya kayıpları</li>
                            <li>Üçüncü taraf hizmetlerindeki aksaklıklar</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>9. FİKRİ MÜLKİYET HAKLARI</h2>
                    <div className="ip-rights">
                        <p>
                            BLVZEUNIT web sitesinde bulunan tüm içerikler (logo, tasarım, metin, görsel, yazılım vb.)
                            5846 sayılı Fikir ve Sanat Eserleri Kanunu ve ilgili mevzuat kapsamında korunmaktadır.
                        </p>
                        <ul>
                            <li>İçerikler izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz.</li>
                            <li>BLVZEUNIT markası ticari amaçlı kullanılamaz.</li>
                            <li>Site içeriği kişisel kullanım dışında kullanılamaz.</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>10. KİŞİSEL VERİLERİN KORUNMASI</h2>
                    <p>
                        Kişisel verilerinizin işlenmesi ve korunması <a href="/privacy-policy">Gizlilik Politikası</a>
                        sayfamızda detaylandırılmıştır. 6698 sayılı KVKK kapsamında haklarınız saklıdır.
                    </p>
                </section>

                <section>
                    <h2>11. ÜÇÜNCÜ TARAF HİZMETLERİ</h2>
                    <div className="third-party">
                        <p>
                            Hizmetlerimizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:
                        </p>
                        <ul>
                            <li><strong>Supabase:</strong> Veri depolama ve kimlik doğrulama</li>
                            <li><strong>Iyzico:</strong> Ödeme işleme</li>
                            <li><strong>Kargo Firması:</strong> Teslimat hizmetleri</li>
                        </ul>
                        <p>
                            Bu hizmetlerin kendi gizlilik politikaları ve kullanım şartları geçerlidir.
                        </p>
                    </div>
                </section>

                <section>
                    <h2>12. MÜCBİR SEBEPLER</h2>
                    <p>
                        Tarafların kontrolü dışında gelişen ve öngörülemeyen olaylar (doğal afet, savaş, terör, grev,
                        internet kesintileri, enerji kesintileri vb.) mücbir sebep sayılır. Bu durumlarda tarafların
                        sözleşme yükümlülükleri askıya alınır.
                    </p>
                </section>

                <section>
                    <h2>13. YÜRÜRLÜK VE DEĞİŞİKLİKLER</h2>
                    <div className="effective-terms">
                        <p>
                            <strong>13.1. Yürürlük:</strong> Bu sözleşme siteyi kullandığınız andan itibaren yürürlüğe girer.
                        </p>
                        <p>
                            <strong>13.2. Değişiklikler:</strong> BLVZEUNIT, bu sözleşmeyi dilediği zaman değiştirme hakkını saklı tutar.
                            Değişiklikler sitede yayınlandığı andan itibaren geçerli olur. Önemli değişiklikler e-posta ile bildirilir.
                        </p>
                        <p>
                            <strong>13.3. Bildirimler:</strong> Tüm bildirimler e-posta veya site duyuruları üzerinden yapılır.
                        </p>
                    </div>
                </section>

                <section className="contact-section">
                    <h2>14. İLETİŞİM BİLGİLERİ</h2>
                    <div className="company-details">
                        <p><strong>Ticari Ünvan (Marka):</strong> BLVZEUNIT</p>
                        <p><strong>Şirket Sahibi:</strong> HÜSEYİN CEYLAN</p>
                        <p><strong>Adres:</strong> 4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir</p>
                        <p><strong>E-posta:</strong> <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a></p>
                        <p><strong>ETBİS Kayıt No:</strong> 6152243016</p>
                    </div>
                </section>

                <div className="legal-footer">
                    <p>
                        Bu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun, 6563 sayılı Elektronik Ticaretin Düzenlenmesi
                        Hakkında Kanun ve ilgili mevzuat hükümlerine uygun olarak hazırlanmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
}