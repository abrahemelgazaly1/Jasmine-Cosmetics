import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Category, Paginated, Product } from '../types';
import ProductCard from './ProductCard';
import QuickOrderPanel from './QuickOrderPanel';
import Spinner from './Spinner';
import { SearchIcon, ChevronDown } from './icons';

interface Props {
  categorySlug?: string;
  lockCategory?: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

export default function ProductBrowser({ categorySlug, lockCategory = false }: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterCategory, setFilterCategory] = useState<string>(categorySlug ?? '');
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  const activeCategory = lockCategory ? categorySlug : filterCategory;

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<{ items: Category[] }>('/categories')).data.items,
    enabled: !lockCategory,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, sort, activeCategory }],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Product>>('/products', {
        params: {
          search: search || undefined,
          sort,
          category: activeCategory || undefined,
          limit: 48,
        },
      });
      return data;
    },
  });

  const products = data?.items ?? [];
  const currentSortLabel = useMemo(
    () => SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort By',
    [sort]
  );

  return (
    <div>
      {/* Search */}
      <div className="relative mx-auto max-w-2xl">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-accent" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="input pl-12"
        />
      </div>

      {/* Sort + Filter row */}
      <div className="mt-6 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => {
              setShowSort((v) => !v);
              setShowFilter(false);
            }}
            className="btn-outline gap-2 py-2"
          >
            {currentSortLabel}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showSort && (
            <div className="absolute left-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-pink-light bg-white shadow-card">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setSort(o.value);
                    setShowSort(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-pink-light ${
                    sort === o.value ? 'text-pink-deep font-medium' : 'text-ink/70'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {!lockCategory && (
          <div className="relative">
            <button
              onClick={() => {
                setShowFilter((v) => !v);
                setShowSort(false);
              }}
              className="btn-outline gap-2 py-2"
            >
              Filter
              <ChevronDown className="h-4 w-4" />
            </button>
            {showFilter && (
              <div className="absolute right-0 z-20 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-pink-light bg-white shadow-card">
                <button
                  onClick={() => {
                    setFilterCategory('');
                    setShowFilter(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-pink-light ${
                    filterCategory === '' ? 'text-pink-deep font-medium' : 'text-ink/70'
                  }`}
                >
                  All Categories
                </button>
                {categoriesData?.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      setFilterCategory(c.slug);
                      setShowFilter(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-pink-light ${
                      filterCategory === c.slug ? 'text-pink-deep font-medium' : 'text-ink/70'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid: 2 per row */}
      {isLoading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <p className="py-20 text-center text-ink/50">No products found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} showActions onQuickOrder={setQuickProduct} />
          ))}
        </div>
      )}

      <QuickOrderPanel product={quickProduct} onClose={() => setQuickProduct(null)} />
    </div>
  );
}
