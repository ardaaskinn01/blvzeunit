import './AboutPage.css';

export default function AboutPage() {
  const values = [
    { title: 'Kalite', description: 'En iyi ürünleri sunmayı taahhüt ediyoruz' },
    { title: 'Hız', description: 'Hızlı teslimat ve müşteri hizmeti' },
    { title: 'Güven', description: 'Müşteri memnuniyeti bizim önceliğimiz' },
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
            BLVZEUNIT olarak misyonumuz; sokak kültürünün ham, filtresiz enerjisini çağdaş tasarımla birleştirerek kendi sesini arayan herkese bir kimlik alanı yaratmaktır. Biz, trendleri takip eden değil; kendi ateşini yakıp yolu aydınlatanların birliğiyiz.

            Her parçamızda özgünlük, cesaret ve karakter taşırız. Kökü sokakta, ruhu isyanda, duruşu ise ait olmayanların dünyasındadır.
            Amacımız yalnızca giydirmek değil; insanların durduğu yeri, hissettikleri ağırlığı ve taşıdıkları hikâyeyi temsil edecek bir kültür inşa etmektir.


          </p>
          <p>
            BLVZEUNIT — Where street meets souls.
            Kendi ateşine güven, kendi birliğini yarat.
          </p>
        </div>
      </div>
    </div>
  );
}
