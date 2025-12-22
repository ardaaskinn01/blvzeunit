import './LegalPages.css';

export default function ShippingPolicyPage() {
    return (
        <div className="legal-page-container shipping-policy-page">
            <div className="legal-content">
                <h1>Kargo ve Teslimat Politikası</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>


                <section>
                    <h2>1. KARGO FİRMASİ VE ANLAŞMALARIMIZ</h2>
                    <div className="shipping-partner">
                        <div className="partner-info">
                            <h3>DHL Kargo</h3>
                            <p>
                                BLVZEUNIT olarak, güvenilir ve hızlı teslimat sağlamak için <strong>DHL Kargo</strong> ile resmi anlaşma yapmış bulunmaktayız. Tüm gönderilerimiz DHL Kargo güvencesiyle taşınmaktadır.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2>2. HAZIRLIK VE GÖNDERİM SÜRECİ</h2>

                    <h3>2.1. Sipariş İşleme Süresi</h3>
                    <ul>
                        <li>Kargoya Teslim (Standart Prosedür): 1-3 iş günü</li>
                        <li>Kargo Firmasından Alıcıya Teslim: 1-3 iş günü</li>
                        <li>Kargo firmasının yoğunluğuna göre süreler değişebilir.</li>
                    </ul>

                    <h3>2.2. Hafta Sonu ve Resmi Tatiller</h3>
                    <p>
                        Hafta sonları (Cumartesi-Pazar) ve resmi tatillerde hazırlık yapılmamaktadır.
                        Bu günler sipariş işleme süresine dahil edilmez.
                    </p>
                </section>

                <section>
                    <h2>3. KARGO ÜCRETLERİ VE KAMPANYALAR</h2>

                    <div className="shipping-fees-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sipariş Tutarı</th>
                                    <th>Kargo Ücreti</th>
                                    <th>Açıklama</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>0 - 799 ₺</strong></td>
                                    <td><span className="fee-badge">85 ₺</span></td>
                                    <td>Standart DHL Kargo ücreti</td>
                                </tr>
                                <tr>
                                    <td><strong>800 ₺ ve Üzeri</strong></td>
                                    <td><span className="free-badge">ÜCRETSİZ</span></td>
                                    <td>Otomatik ücretsiz kargo</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3>3.1. Kargo Ücreti Hesaplama</h3>
                    <p>
                        Kargo ücreti, sipariş toplam tutarına göre otomatik olarak hesaplanır.
                        800 ₺ altındaki siparişlerde <strong>85 ₺</strong> kargo ücreti uygulanır.
                    </p>

                    <h3>3.2. Ücretsiz Kargo Koşulları</h3>
                    <p>
                        800 ₺ ve üzeri alışverişlerde kargo ücretsizdir.
                        İndirimler, kampanyalar ve kuponlar ücretsiz kargo hakkını etkilemez.
                    </p>
                </section>


                <section>
                    <h2>4. KARGO TAKİP VE BİLDİRİMLER</h2>
                    <p>
                        Kargoya verildikten sonra sipariş takip numarası e-posta ile gönderilir.
                        Bu numara ile DHL Kargo web sitesinden anlık takip yapabilirsiniz.
                    </p>

                </section>

                <section>
                    <h2>5. TESLİMAT SÜRECİ VE KURALLAR</h2>

                    <h3>5.1. Teslimat Adresi</h3>
                    <p>
                        Teslimat adresinin doğru ve güncel olması müşteri sorumluluğundadır.
                        Yanlış adres bilgisi nedeniyle oluşan gecikme veya ek ücretlerden BLVZEUNIT sorumlu değildir.
                    </p>

                    <h3>5.2. Teslim Alma ve Kontrol</h3>
                    <p>
                        <strong>ADIM 1:</strong> Paketi teslim alırken dış ambalajı kontrol edin
                        <br />
                        <strong>ADIM 2:</strong> Hasar, ıslaklık veya açılma izi varsa kargo görevlisine tutanak tutturun
                        <br />
                        <strong>ADIM 3:</strong> Tutanak tutulmadan paketi teslim almayın
                        <br />
                        <strong>ADIM 4:</strong> Durumu <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a> adresine bildirin
                    </p>

                    <h3>5.3. Teslim Edilemeyen Paketler</h3>
                    <p>
                        Adreste bulunulmaması, kapı çalındığında açılmaması veya geçersiz adres durumunda,
                        DHL Kargo paketi 3 iş günü boyunca depoda tutar. Bu süre sonunda paket iade edilir.
                    </p>
                </section>

                <section>
                    <h2>6. HASARLI VE EKSİK TESLİMAT</h2>

                    <h3>6.1. Hasar Durumu</h3>
                    <p>
                        Pakette hasar tespit ederseniz:
                    </p>
                    <ol>
                        <li>Kargo görevlisine tutanak tutturarak paketi teslim almayın</li>
                        <li>Fotograflı ve videolu belgeleyin</li>
                        <li>Hemen bizimle iletişime geçin</li>
                        <li>Paketi geri göndermeyin</li>
                    </ol>

                    <h3>6.2. Eksik Ürün</h3>
                    <p>
                        Pakette eksik ürün varsa 24 saat içinde bildirimde bulunmanız gerekmektedir.
                        Kargo firmasının paket ağırlık kayıtları kontrol edilir.
                    </p>
                </section>

                <section>
                    <h2>7. İADE KARGOLARI</h2>

                    <div className="return-shipping-info">
                        <h3>7.1. İade Kargo Ücreti</h3>
                        <p>
                            İade edilecek ürünlerin kargo ücreti <strong>müşteriye aittir</strong>.
                            Ancak aşağıdaki durumlarda kargo ücreti BLVZEUNIT tarafından karşılanır:
                        </p>
                        <ul>
                            <li>Yanlış ürün gönderimi</li>
                            <li>Hasarlı ürün gönderimi</li>
                            <li>Eksik ürün gönderimi</li>
                            <li>Ürün hatası veya kusuru</li>
                        </ul>

                        <h3>7.2. İade Adresi</h3>
                        <p>
                            İade için önce <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a> adresinden onay alın.
                            Onay sonrası size iade adresini ve talimatları göndeririz.
                        </p>
                    </div>
                </section>

                <section>
                    <h2>8. ÖZEL DURUMLAR VE DEĞİŞİKLİKLER</h2>

                    <h3>8.1. Mücbir Sebepler</h3>
                    <p>
                        Hava koşulları, doğal afetler, grevler, salgın hastalıklar vb. durumlarda
                        teslimat süreleri değişiklik gösterebilir.
                    </p>

                    <h3>8.2. Politika Değişiklikleri</h3>
                    <p>
                        BLVZEUNIT, bu kargo politikasını dilediği zaman güncelleyebilir.
                        Güncel versiyon her zaman web sitemizde yayınlanır.
                    </p>
                </section>

                <section className="contact-section">
                    <h2>9. İLETİŞİM VE DESTEK</h2>
                    <div className="contact-details">
                        <p>
                            Kargo ve teslimat ile ilgili sorularınız için:
                        </p>
                        <ul>
                            <li><strong>E-posta:</strong> <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a></li>
                            <li><strong>Konu Başlığı:</strong> "Kargo Sorusu - [Sipariş No]"</li>
                            <li><strong>Yanıt Süresi:</strong> 24 saat içinde</li>
                        </ul>
                        <p>
                            <li>DHL Kargo Müşteri Hizmetleri: 444 00 40 </li>
                        </p>
                    </div>
                </section>

                <div className="legal-footer">
                    <p>
                        Bu kargo politikası 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
                        6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun hükümlerine uygun olarak hazırlanmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
}