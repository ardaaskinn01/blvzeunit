import { useParams } from 'react-router-dom';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="product-page">
      <h1>Ürün: {slug}</h1>
      <div className="product-details">
        {/* Ürün detayları buraya gelecek */}
      </div>
    </div>
  );
}
