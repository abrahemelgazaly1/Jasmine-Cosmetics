export const SHIPPING_FEE = 120;
export const CURRENCY = 'EGP';

export function formatPrice(value: number): string {
  return `${value.toLocaleString('en-EG')} ${CURRENCY}`;
}

export interface ColorOption {
  name: string;
  hex: string;
}

// Color swatches available per category (keyed by category slug).
export const PRODUCT_COLORS: Record<string, ColorOption[]> = {
  'liquid-blush': [
    { name: 'Bloom baby', hex: '#E4577E' },
    { name: 'Warm peach', hex: '#F1A07A' },
  ],
  'lip-gloss': [
    { name: 'Angel', hex: '#F7C9D3' },
    { name: 'Cloe', hex: '#E8A0A8' },
    { name: 'Jade', hex: '#C97B84' },
    { name: 'Polita', hex: '#D98895' },
    { name: 'Dana', hex: '#B85C6E' },
    { name: 'Jasmine', hex: '#E39AAE' },
    { name: 'Bratz', hex: '#A83B5C' },
    { name: 'Sasha', hex: '#C56A7B' },
    { name: 'Old', hex: '#8C5A5A' },
    { name: 'Zoe', hex: '#D96B8A' },
    { name: 'Color changing', hex: '#B57EDC' },
    { name: 'Hot chocolate', hex: '#6B4226' },
    { name: 'Baby girl', hex: '#F4B6C2' },
  ],
};

function categorySlug(category: unknown): string {
  if (category && typeof category === 'object' && 'slug' in category) {
    return String((category as { slug: string }).slug).toLowerCase();
  }
  return '';
}

// Returns the color palette for a product based on its category, or [] if none.
export function colorsForCategory(category: unknown): ColorOption[] {
  return PRODUCT_COLORS[categorySlug(category)] ?? [];
}

// Maps a saved color name to its swatch (searches every palette).
export function findColorOption(name: string): ColorOption | undefined {
  for (const list of Object.values(PRODUCT_COLORS)) {
    const found = list.find((c) => c.name === name);
    if (found) return found;
  }
  return undefined;
}

// Effective unit price: the offer price when an active offer exists, otherwise the base price.
export function effectivePrice(product: { price: number; isOffer?: boolean; offerPrice?: number | null }): number {
  return product.isOffer && product.offerPrice != null ? product.offerPrice : product.price;
}


export const GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbia',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qaliubiya',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr El Sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
];
