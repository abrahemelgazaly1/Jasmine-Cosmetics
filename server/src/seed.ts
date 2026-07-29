import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { slugify } from './middleware/error.js';
import mongoose from 'mongoose';

// Uses remote image URLs for seed data. Admin-uploaded images are stored as base64.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/600`;

// The store only sells these three categories.
const categoryData = [
  { name: 'Lip Gloss', slug: 'lip-gloss', image: '/lipglows.jpeg' },
  { name: 'Brows', slug: 'brows', image: '/eyebrow.jpeg' },
  {
    name: 'Liquid Blush',
    slug: 'liquid-blush',
    image:
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
  },
];

// Available shades per category (must match client PRODUCT_COLORS names).
const colorsBySlug: Record<string, string[]> = {
  'lip-gloss': [
    'Angel',
    'Cloe',
    'Jade',
    'Polita',
    'Dana',
    'Jasmine',
    'Bratz',
    'Sasha',
    'Old',
    'Zoe',
    'Color changing',
    'Hot chocolate',
    'Baby girl',
  ],
  'liquid-blush': ['Bloom baby', 'Warm peach'],
};

const howToUse =
  'Apply an even layer to clean skin. Blend gently with fingertips or a brush for a flawless, natural finish. Reapply as needed throughout the day.';

const description =
  'A premium, long-lasting formula crafted for a luxurious feel. Imported quality at prices that can\u2019t be compared. Suitable for all skin types.';

async function run() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);

  const adminHash = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@jasmine.com',
    passwordHash: adminHash,
    role: 'admin',
  });
  console.log('Created admin: admin@jasmine.com / admin123');

  const categories = await Category.insertMany(
    categoryData.map((c) => ({ name: c.name, slug: c.slug, image: c.image }))
  );

  const products = [];
  let counter = 0;
  for (const cat of categories) {
    const palette = colorsBySlug[cat.slug] ?? [];
    for (let i = 1; i <= 6; i++) {
      counter++;
      const name = `${cat.name} ${['Rose', 'Velvet', 'Glow', 'Luxe', 'Silk', 'Bloom'][i - 1]}`;
      // Give each product a rotating subset of shades (blush uses all its shades).
      const colors =
        palette.length === 0
          ? []
          : cat.slug === 'liquid-blush'
            ? palette
            : palette.slice((i - 1) % palette.length, ((i - 1) % palette.length) + 3);
      products.push({
        name,
        slug: slugify(`${name}-${counter}`),
        description,
        howToUse,
        price: 150 + i * 45,
        images: [img(`${cat.slug}-${i}-a`), img(`${cat.slug}-${i}-b`)],
        colors,
        category: cat._id,
        isFeatured: i <= 2, // 2 best sellers per category
        isOffer: false, // offers are created from the admin panel only
        offerPrice: null,
        isSoldOut: false,
        stock: 100,
      });
    }
  }
  await Product.insertMany(products);
  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
