# Jasmine Cosmetics — Website Development Prompt

## Project Overview
Build a professional e-commerce website for a cosmetics brand called **Jasmine Cosmetics**.

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Node.js
- Database: MongoDB

## Brand Identity / Visual Style
- Primary background color: **White**
- Brand accent color: **Light pink** (not dark pink — must be light)
- Text/contrast color: **Black** (mix of light pink and black across the UI)
- Typography: Use a premium, elegant font (high-quality, "wow" typography — final choice left to the designer/developer, but it must feel premium)

---

## 1. Navbar
- Layout:
  - **Left:** Brand logo icon
  - **Center:** Brand name text — "Jasmine Cosmetics"
  - **Right:** Cart icon
- Default state (top of page):
  - Navbar background: White
  - Brand name text: Light pink
  - Cart icon: Normal/default brown-ish/neutral icon color
  - Logo: Its natural brand colors
- On scroll:
  - Navbar background changes to **light pink**
  - Brand name text changes to **white**

---

## 2. Home Page

### 2.1 Hero Section
- Full background image
- Overlaid text on top of the image
- A button labeled **"Shop Now"**
- Clicking "Shop Now" navigates to the **Products** page
- Typography must look premium/elegant

### 2.2 Featured Products Section
- Title: **"Featured Products"**
- Auto-playing slider/carousel
- Displays products marked as "featured" by the admin (selected from the Admin Dashboard)
- Product card design:
  - Product image
  - On hover: image switches to the product's second image (if no second image exists, keep showing the first)
  - Product name below the image
  - Price below the name
  - Clicking the card navigates to the **Product Details** page

### 2.3 Categories Section
- Displays **6 categories** relevant to cosmetics products in general
- Each category card:
  - Category image
  - Category name below the image
- Clicking a category navigates to the **Category** page for that category

### 2.4 Offers Section
- Title: **"Offers"**
- Displays **8 products**
- Grid layout: **2 products per row**
- Below the products, a button labeled **"More Offers"**
  - Clicking it navigates to an **Offers** page
- Product card design (same style as Featured Products):
  - Image (hover switches to second image)
  - Name
  - Price
  - Clicking navigates to Product Details page

### 2.5 Newsletter Section
- Displays brand news/highlights
- Talks about the brand story, competitive pricing ("prices that can't be compared"), and that product quality is imported from the USA

### 2.6 Instagram Section
- Displays a grid of images with links (Instagram feed style)

### 2.7 Footer
- Standard footer (appears on all pages)

---

## 3. Products Page
- Navbar at top
- Page title: **"Products"**
- Search bar:
  - Functional — filters products live by matching product name
- Below the search bar, two buttons:
  - **"Sort By"** — positioned on the left
  - **"Filter"** — positioned on the right
- Product grid:
  - **2 products per row**
  - Product image (hover switches to the second image)
  - Product name
  - Price
- On hover, show **2 icons** on the top-left of the product card:
  1. **Cart icon** → opens **Quick Order** (see below)
  2. **Wishlist icon** → adds the product to the Wishlist page

### 3.1 Quick Order (triggered by cart icon hover action)
- Opens as a **side panel/sidebar** containing:
  - Product image
  - Product name
  - Price
  - A dropdown/expandable section for the product **description**
  - Two buttons at the bottom:
    - **"Add to Cart"** — takes 70% of the row width
    - **"Cancel"** — takes 25% of the row width

### 3.2 Wishlist Icon Behavior
- Clicking adds the product to the **Wishlist** page

---

## 4. Wishlist Page
- Navbar
- Footer
- Page title: **"Wishlist"**
- Below the title: grid of wishlisted products (same card style as Products page)

---

## 5. Product Details Page
- URL should include the **product ID**
- Page slug/title created from the **product name**

**Layout (top to bottom):**
1. Breadcrumb navigation: `Home > Products > [Product Name]`
2. Product images:
   - Displayed as a **manual slider** (not automatic)
   - Thumbnail images shown in **2 rows**
   - Clicking a thumbnail switches the main displayed image
3. Product name
4. Price (currency: **EGP**)
5. Expandable/dropdown section labeled **"Description"**
   - Clicking it reveals the product description
6. **Quantity counter** (Count button/stepper)
7. Two buttons:
   - **"Add to Cart"** — 70% of row width
   - **"Wishlist"** — 25% of row width
8. **"Proceed to Checkout"** button (full width, below the two buttons)
9. Fixed heading: **"How to Use?"**
   - Content below it is written per-product by the admin via the Admin Dashboard
10. **"Similar Products"** section
    - Displays **4 products**
    - Grid layout: **2 products per row**
11. Footer

---

## 6. Category Page
- Same layout/structure as the Products page:
  - Navbar
  - Page title = category name
  - Functional search bar
  - Product grid (same design as Products page)
- **Difference:** Only shows products belonging to that specific category

---

## 7. Cart Page
- Navbar cart icon shows a **badge/counter** with the total number of items currently in the cart

**Cart Page Content:**
- For each product in the cart:
  - Image
  - Name
  - Price
  - Category
  - Quantity counter (Count)
- Summary section:
  - Subtotal (sum of product prices)
  - **Shipping/Delivery fee: 120 EGP** (fixed)
  - Divider line
  - **Total** (subtotal + shipping fee)
- **"Proceed to Checkout"** button → navigates to Checkout page

---

## 8. Checkout Page

### 8.1 Order Summary
- Card showing:
  - Each ordered product (name, price, quantity)
  - Subtotal
  - Delivery fee
  - Total

### 8.2 Personal Information Form
Fields, in order:
1. Full Name
2. Email
3. Governorate (dropdown/select)
4. Address
5. Phone Number 1
   - Pre-filled with Egypt flag icon and **+20** country code prefix
   - User completes the rest of the number
6. Phone Number 2 (**optional**)

- Checkbox: **"Save Information on This Website"**
  - If checked, the entered information is saved for future visits/orders

### 8.3 Payment Method
- Section labeled **"Payment Method"**
- Only option available: **Cash on Delivery (COD)**
  - Since it's the only method, it should be shown as already selected/locked in

### 8.4 Final Action
- Button labeled **"Order Product"** to place the order

---

## Notes for Developer
- Maintain consistent card designs for products across Home, Products, Category, Offers, and Similar Products sections (image + hover-swap image, name, price).
- Maintain consistent light pink / white / black brand palette throughout every page.
- Ensure responsive design across desktop and mobile.
