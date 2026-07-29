import ProductBrowser from '../components/ProductBrowser';
import { useDocumentTitle } from '../lib/seo';

export default function Products() {
  useDocumentTitle('Shop All Products');
  return (
    <div className="container-x py-12">
      <h1 className="section-title mb-8 text-center">Products</h1>
      <ProductBrowser />
    </div>
  );
}
