# Jasmine Cosmetics

Full-stack e-commerce for the **Jasmine Cosmetics** brand.

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (customer + admin roles)
- **State:** React Context (cart, wishlist, auth) + TanStack Query
- **Images:** base64 stored in MongoDB (admin uploads auto-resized to 800px)

## Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - **Local:** install MongoDB Community Server, or
  - **Cloud:** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

## Setup

1. Configure the backend environment:

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `server/.env` and set `MONGO_URI` (local default is
   `mongodb://127.0.0.1:27017/jasmine_cosmetics`) and a strong `JWT_SECRET`.

2. Install dependencies (from the repo root):

   ```bash
   npm run install:all
   ```

3. Seed the database with 6 categories and sample products:

   ```bash
   npm run seed
   ```

   This also creates an admin account:

   - **Email:** `admin@jasmine.com`
   - **Password:** `admin123`

## Run (development)

From the repo root (runs API + client together):

```bash
npm install          # installs the root 'concurrently' helper
npm run dev
```

Or run each app separately:

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend on port 5000.

## Build

```bash
npm run build
```

## Project structure

```
server/   Express API, Mongoose models, JWT auth, seed script
client/   React app (pages, components, contexts, admin dashboard)
docs/     Original product spec
```

## Admin

Log in with the seeded admin account and open **/admin** to manage products
(featured/offer flags, How-to-Use content, base64 image uploads), categories,
and orders.
