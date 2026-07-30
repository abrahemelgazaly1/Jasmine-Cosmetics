export const CURRENCY = 'EGP';

// Delivery fee per governorate (EGP). Keys double as the governorate dropdown options.
export const SHIPPING_FEES: Record<string, number> = {
  Cairo: 75,
  Giza: 75,
  Alexandria: 75,
  Qaliubiya: 75,
  Menofia: 75,
  Gharbia: 75,
  Dakahlia: 75,
  'Kafr El Sheikh': 75,
  Damietta: 75,
  Beheira: 75,
  Sharkia: 65,
  Ismailia: 95,
  'Port Said': 95,
  Suez: 95,
  Fayoum: 110,
  'Beni Suef': 110,
  Minya: 110,
  Assiut: 110,
  Sohag: 130,
  Qena: 130,
  Luxor: 130,
  Aswan: 130,
  'Red Sea': 130,
  'New Valley': 140,
  'North Sinai': 140,
  'South Sinai': 140,
  Matrouh: 140,
};

// Returns the delivery fee for a governorate, or 0 when none/unknown is selected.
export function shippingFor(governorate?: string): number {
  return governorate ? SHIPPING_FEES[governorate] ?? 0 : 0;
}

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


export const GOVERNORATES = Object.keys(SHIPPING_FEES);
