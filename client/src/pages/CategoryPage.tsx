import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category } from '../types';
import ProductBrowser from '../components/ProductBrowser';
import Spinner from '../components/Spinner';
import { useDocumentTitle } from '../lib/seo';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => (await api.get<{ category: Category }>(`/categories/${slug}`)).data.category,
    enabled: Boolean(slug),
  });

  useDocumentTitle(category?.name);

  return (
    <div className="container-x py-12">
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <h1 className="section-title mb-8 text-center text-pink-deep">{category?.name ?? 'Category'}</h1>
          <ProductBrowser categorySlug={slug} lockCategory />
        </>
      )}
    </div>
  );
}
