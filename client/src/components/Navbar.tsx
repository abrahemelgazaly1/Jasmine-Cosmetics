import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CartIcon, HeartIcon } from './icons';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/offers', label: 'Offers' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { count } = useCart();
  const { items: wishlist } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // White background site-wide; black text is dominant, pink is only an accent.
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-black/10'
      }`}
    >
      <nav className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Left: logo */}
        <Link to="/" className="justify-self-start" aria-label="Jasmine Cosmetics home">
          <Logo className="h-10 w-10 ring-1 ring-black/10" />
        </Link>

        {/* Center: brand name, always one line */}
        <Link
          to="/"
          className="justify-self-center whitespace-nowrap font-serif text-base font-semibold tracking-[0.03em] text-pink-accent sm:text-2xl"
        >
          Jasmine <span className="text-pink-accent">Cosmetics</span>
        </Link>

        {/* Right: nav + actions */}
        <div className="flex items-center justify-self-end gap-3 sm:gap-5">
          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium text-ink/85 transition-colors hover:text-pink-deep ${
                    isActive ? 'underline decoration-pink-accent decoration-2 underline-offset-4' : ''
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <Link to="/wishlist" className="relative text-ink/85 hover:text-pink-deep" aria-label="Wishlist">
            <HeartIcon className="h-6 w-6" />
            {wishlist.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-pink-accent px-1 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative text-ink/85 hover:text-pink-deep" aria-label="Cart">
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-pink-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}
