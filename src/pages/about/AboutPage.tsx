import './AboutPage.css';

export default function AboutPage() {
  const values = [
    { title: 'Kalite', description: 'En iyi ürünleri sunmayı taahhüt ediyoruz' },
    { title: 'Hız', description: 'Hızlı teslimat ve müşteri hizmeti' },
    { title: 'Güven', description: 'Müşteri memnuniyeti bizim önceliğimiz' },
  ];

  const team: { name: string; role: string }[] = [
  ];

  return (
    <div className="about-page">
      <div className="about-container">
        <h1>Hakkımızda</h1>
        <p className="about-intro">
          BLVZEUNIT olarak, 2025 yılından beri kaliteli giyim ürünleriyle müşterilerimize hizmet veriyoruz.
          Misyonumuz, herkesin erişebilecek fiyatlarda en iyi ürünleri sunmaktır.
        </p>

        {/* Hikaye */}
        <div className="about-section">
          <h2>Bizim Hikayemiz</h2>
          <p>
            BLVZEUNIT, bir grup genç girişimci tarafından kurulmuştur. Giyim sektöründeki kalite sorunlarını görerek,
            bu alanda bir değişim yaratma kararı aldık. Ürün seçiminden müşteri hizmetine kadar her adımda mükemmeli
            hedefleyen bir ekibiz.
          </p>
          <p>
            Günümüzde binlerce müşteriye hizmet veriyor, yüz binlerce memnun alıcımız bulunuyor. Bize olan güveniniz
            ve desteğiniz için teşekkür ederiz.
          </p>
        </div>

        {/* Değerlerimiz */}
        <div className="about-section">
          <h2>Değerlerimiz</h2>
          <div className="values-grid">
            {values.map((value, idx) => (
              <div key={idx} className="value-card">
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="about-section">
          <h2>İletişim</h2>
          <p>Email: info@blvzeunit.com</p>
          <p>Telefon: </p>
          <p>Adres: Karabağlar, İzmir</p>
        </div>
      </div>
    </div>
  );
}
