
import './LegalPages.css';

export default function PreliminaryInformationForm() {
    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Ön Bilgilendirme Formu</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <div className="agreement-intro">
                    <p>
                        <strong>ÖNEMLİ:</strong> Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca,
                        tüketicinin mesafeli sözleşme kurulmadan önce bilgilendirilmesi amacıyla hazırlanmıştır.
                    </p>
                </div>

                <section>
                    <h2>1. SATICI BİLGİLERİ</h2>
                    <div className="company-details">
                        <p><strong>Ticari Ünvan:</strong> BLVZEUNIT</p>
                        <p><strong>Satıcı Adı:</strong> HÜSEYİN CEYLAN</p>
                        <p><strong>Adres:</strong> 4562 Sokak No:31 Kat:2 Daire:2 Sevgi Mahallesi Karabağlar/İzmir</p>
                        <p><strong>E-posta:</strong> <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a></p>
                        {/* <p><strong>Telefon:</strong> (Opsiyonel)</p> */}
                        {/* <p><strong>Mersis No:</strong> (Varsa)</p> */}
                    </div>
                </section>

                <section>
                    <h2>2. SÖZLEŞME KONUSU ÜRÜN VE HİZMETLER</h2>
                    <p>
                        Malın/Ürünün/Hizmetin temel özellikleri (türü, rengi, bedeni) Satıcı'ya ait internet sitesinde yer almaktadır.
                        Satıcı tarafından düzenlenen kampanyalar ilgili ürün sayfalarında belirtilmiştir.
                    </p>
                    <p>
                        Listelenen ve sitede ilan edilen fiyatlar satış fiyatıdır. İlan edilen fiyatlar ve vaatler güncelleme yapılana ve değiştirilene kadar geçerlidir.
                        Süreli olarak ilan edilen fiyatlar ise belirtilen süre sonuna kadar geçerlidir.
                    </p>
                </section>

                <section>
                    <h2>3. SATIŞ FİYATI VE ÖDEME</h2>
                    <p>
                        Sözleşme konusu malın veya hizmetin tüm vergiler dâhil satış fiyatı, ödeme şekli ve teslimat planı sipariş özetinde belirtildiği gibidir.
                    </p>
                    <p>
                        Ürün sevkiyat masrafı olan kargo ücreti, aksi belirtilmedikçe Alıcı tarafından ödenir.
                    </p>
                </section>

                <section>
                    <h2>4. TESLİMAT VE İFA</h2>
                    <p>
                        Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için Alıcı'nın yerleşim yerinin uzaklığına bağlı olarak
                        internet sitesinde ön bilgiler kısmında açıklanan süre zarfında Alıcı veya gösterdiği adresteki kişi/kuruluşa teslim edilir.
                    </p>
                    <p>
                        Ürün teslimatı anında ürünün kargo görevlisi nezdinde kontrol edilmesi, hasarlı ise teslim alınmaması ve tutanak tutulması gerekmektedir.
                    </p>
                </section>

                <section>
                    <h2>5. CAYMA HAKKI</h2>
                    <div className="return-policy">
                        <p>
                            Alıcı; mal satışına ilişkin mesafeli sözleşmelerde, ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren
                            <strong> 14 (on dört) gün</strong> içerisinde, Satıcı'ya bildirmek şartıyla hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve
                            hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir.
                        </p>
                        <p>
                            Cayma hakkının kullanılması için bu süre içinde Satıcı'ya yazılı olarak veya kalıcı veri saklayıcısı ile bildirimde bulunulması şarttır.
                            Cayma hakkının kullanılması halinde, ürünün iadesi kargo firması aracılığıyla yapılmalıdır.
                        </p>
                        <p>
                            <strong>Cayma Hakkının Kullanılamayacağı Durumlar:</strong>
                        </p>
                        <ul>
                            <li>Alıcının istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan ürünler.</li>
                            <li>Teslimden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanlar (örneğin iç giyim vb.).</li>
                        </ul>
                    </div>
                </section>

                <section>
                    <h2>6. UYUŞMAZLIK ÇÖZÜMÜ</h2>
                    <p>
                        Tüketici, şikayet ve itirazları konusunda başvurularını, Bakanlıkça her yıl Aralık ayında belirlenen parasal sınırlar dâhilinde
                        tüketicinin mal veya hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine yapabilir.
                    </p>
                </section>

                <p>
                    <i>İşbu Ön Bilgilendirme Formu, elektronik ortamda Alıcı tarafından okunup kabul edildikten sonra Mesafeli Satış Sözleşmesi kurulması aşamasına geçilecektir.</i>
                </p>
            </div>
        </div>
    );
}
