import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/jasmine_cosmetics',
  jwtSecret: process.env.JWT_SECRET ?? 'dev_secret_change_me',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};

export const SHIPPING_FEE = 120;

// Delivery fee per governorate (EGP).
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

// Returns the delivery fee for a governorate, falling back to the flat fee if unknown.
export function shippingFor(governorate?: string): number {
  return governorate && SHIPPING_FEES[governorate] != null
    ? SHIPPING_FEES[governorate]
    : SHIPPING_FEE;
}
