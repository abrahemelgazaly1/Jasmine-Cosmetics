import { Link } from 'react-router-dom';
import { InstagramIcon } from './icons';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-white text-ink">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-11 w-11 ring-1 ring-black/10" />
            <h3 className="font-serif text-2xl">
              Jasmine <span className="text-pink-accent">Cosmetics</span>
            </h3>
          </div>
          <p className="mt-4 text-sm text-ink/60">
            Premium beauty essentials, USA-imported quality, at prices that can&rsquo;t be compared.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Shop</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/products" className="hover:text-pink-accent">All Products</Link></li>
            <li><Link to="/offers" className="hover:text-pink-accent">Offers</Link></li>
            <li><Link to="/wishlist" className="hover:text-pink-accent">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-pink-accent">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Account</h4>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link to="/login" className="hover:text-pink-accent">Login</Link></li>
            <li><Link to="/register" className="hover:text-pink-accent">Register</Link></li>
            <li><Link to="/account" className="hover:text-pink-accent">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">Follow Us</h4>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-pink-accent"
          >
            <InstagramIcon className="h-5 w-5" /> @jasminecosmetics
          </a>
        </div>
      </div>
      <div className="border-t border-black/10 py-5 text-center text-xs text-ink/50">
        &copy; {new Date().getFullYear()} Jasmine Cosmetics. All rights reserved.
      </div>
    </footer>
  );
}
