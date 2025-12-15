import './AboutPage.css';

export default function AboutPage() {

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
          <h2>Bİzİm Hİkayemİz</h2>
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

        <div className="about-section">
          <h2>ÜRETİM FELSEFEMİZ</h2>
          <p>
            Her bir BLVZEUNIT ürünü, sadece bir giyim parçası değil, bir manifestodur. Üretim sürecimizde
            kaliteden asla ödün vermiyor, sokağın ruhunu kullanıyoruz.
            Tüm ürünlerimiz Türkiye'de, yerel iş gücü ve etik çalışma standartları gözetilerek üretilmektedir.
            Bu sayede hem kaliteyi kontrol altında tutuyor hem de yerel ekonomiyi destekliyoruz.
          </p>
        </div>
      </div>
    </div>
  );
}
