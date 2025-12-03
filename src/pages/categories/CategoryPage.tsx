import { useParams } from 'react-router-dom';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="category-page">
      <h1>Kategori: {slug}</h1>
      <div className="products-grid">
        {/* Ürünler buraya gelecek */}
      </div>
    </div>
  );
}
