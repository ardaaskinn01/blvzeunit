import './LegalPages.css';

export default function RefundPolicyPage() {
    return (
        <div className="legal-page-container">
            <div className="legal-content">
                <h1>Para İade Politikası</h1>
                <p className="last-updated">Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>

                <section>
                    <h2>1. İade ve Cayma Hakkı</h2>
                    <p>
                        Müşterilerimiz, ürünün teslim alınmasından itibaren <strong>14 gün</strong> içinde herhangi bir sebep göstermeksizin cayma hakkını kullanabilirler.
                        Bu süre, ürünün teslim tarihinden itibaren başlar.
                    </p>
                </section>

                <section>
                    <h2>2. İade Edilebilirlik Koşulları</h2>
                    <p>
                        İade edilecek ürünlerde aşağıdaki koşullar aranır:
                    </p>
                    <ul>
                        <li>Ürün kullanılmamış, denenmemiş olmalıdır</li>
                        <li>Etiketleri sökülmemiş ve orijinal ambalajında olmalıdır</li>
                        <li>Satış faturası veya fişi ile birlikte gönderilmelidir</li>
                        <li>Üzerinde herhangi bir koku, leke veya hasar bulunmamalıdır</li>
                        <li>Hediyelik paket yapılmamış olmalıdır</li>
                    </ul>
                </section>

                <section>
                    <h2>3. İade Süreci</h2>
                    <p>
                        İade sürecini başlatmak için lütfen <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a> adresine
                        sipariş numaranız, iade etmek istediğiniz ürün/ürünler ve iade sebebinizle birlikte bir e-posta gönderin.
                        Size iade onayı ve kargo bilgilerini içeren bir yanıt göndereceğiz.
                    </p>
                </section>

                <section>
                    <h2>4. Kargo Ücretleri</h2>
                    <p>
                        <strong>İade kargo ücreti müşteriye aittir.</strong> Ürünü iade ederken kargo ücretini ödemeniz gerekmektedir.
                        Ancak, ürünün hatasından veya yanlış gönderilmesinden kaynaklanan iadelerde kargo ücreti tarafımıza aittir.
                    </p>
                </section>

                <section>
                    <h2>5. Para İadesi</h2>
                    <p>
                        İade edilen ürün tarafımıza ulaşıp kontrolleri yapıldıktan sonra, ödemeniz <strong>7-10 iş günü</strong> içerisinde orijinal ödeme yönteminizle iade edilir.
                    </p>
                    <p>
                        <strong>Önemli Not:</strong> İadeniz onaylandıktan sonra bankanızın işlem sürelerine bağlı olarak
                        paranızın hesabınıza yansıması 1-3 iş günü daha sürebilir.
                    </p>
                </section>

                <section>
                    <h2>7. Hatalı veya Hasarlı Ürünler</h2>
                    <p>
                        Ürün hatalı, hasarlı veya yanlış gönderilmişse, lütfen 48 saat içinde <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a> adresine
                        ürün fotoğrafları ve açıklamasıyla birlikte ulaşın. Bu durumda kargo ücreti tarafımıza aittir ve ücretsiz yeni ürün gönderimi veya tam iade yapılır.
                    </p>
                </section>

                <section>
                    <h2>8. İletişim</h2>
                    <p>
                        İade ile ilgili tüm sorularınız için:
                    </p>
                    <ul className="contact-info">
                        <li><strong>E-posta:</strong> <a href="mailto:blvzeunit@gmail.com">blvzeunit@gmail.com</a></li>
                    </ul>
                </section>

                <section className="important-note">
                    <h2>Önemli Hatırlatma</h2>
                    <p>
                        Lütfen iade gönderimi yapmadan önce mutlaka bizimle iletişime geçin. Onaysız gönderilen iadeler kabul edilemeyebilir.
                    </p>
                </section>

                <div className="legal-footer">
                    <p>
                        Bu politika 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Satış Sözleşmeleri Yönetmeliği hükümlerine uygun olarak hazırlanmıştır.
                    </p>
                </div>
            </div>
        </div>
    );
}