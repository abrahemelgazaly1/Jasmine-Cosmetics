import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart, lineId } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, effectivePrice, GOVERNORATES } from '../lib/constants';
import { swal } from '../lib/swal';
import { useDocumentTitle } from '../lib/seo';
import { TrashIcon } from '../components/icons';
import type { CustomerInfo, AppliedPromo } from '../types';

const emptyInfo: CustomerInfo = {
  fullName: '',
  email: '',
  governorate: '',
  address: '',
  phone1: '',
  phone2: '',
};

interface AxiosishError {
  response?: { data?: { message?: string } };
}

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items, subtotal, shipping, discount, total, promo, clear, applyPromo, removePromo } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState<CustomerInfo>(emptyInfo);
  const [saveInfo, setSaveInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [codeInput, setCodeInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [promoError, setPromoError] = useState('');

  async function checkPromo() {
    const code = codeInput.trim();
    if (!code) return;
    setChecking(true);
    setPromoError('');
    try {
      const { data } = await api.post<AppliedPromo & { valid: boolean }>('/promocodes/validate', {
        code,
      });
      applyPromo({ code: data.code, discountPercent: data.discountPercent });
      setCodeInput('');
    } catch (err) {
      const message =
        (err as AxiosishError)?.response?.data?.message ?? 'This promo code is not valid.';
      setPromoError(message);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    const local = localStorage.getItem('jc_saved_info');
    if (user?.savedInfo) {
      setInfo({ ...emptyInfo, ...user.savedInfo });
    } else if (local) {
      try {
        setInfo({ ...emptyInfo, ...JSON.parse(local) });
      } catch {
        /* ignore */
      }
    }
  }, [user]);

  function update(field: keyof CustomerInfo, value: string) {
    setInfo((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const phone1 = info.phone1.startsWith('+20') ? info.phone1 : `+20${info.phone1}`;
      const payload = {
        items: items.map((i) => ({ product: i.product._id, qty: i.qty, color: i.color ?? '' })),
        promoCode: promo?.code ?? '',
        customer: { ...info, phone1 },
      };
      const { data } = await api.post('/orders', payload);
      void data;

      if (saveInfo) {
        localStorage.setItem('jc_saved_info', JSON.stringify(info));
        if (user) {
          await api.put('/users/saved-info', info).catch(() => undefined);
        }
      }
      clear();
      await swal.fire({
        icon: 'success',
        title: 'Thank you for your order!',
        text: 'Your order has been placed. You will pay on delivery (COD).',
        confirmButtonText: 'Continue Shopping',
      });
      navigate('/');
    } catch (err) {
      const message =
        (err as AxiosishError)?.response?.data?.message ??
        'Could not place order. Please check your details and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="section-title mb-4">Checkout</h1>
        <p className="text-ink/50">Your cart is empty.</p>
        <Link to="/products" className="btn-primary mt-6">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="section-title mb-8">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-pink-light bg-pink-light p-6 lg:order-2">
          <h2 className="mb-4 font-serif text-xl text-ink">Order Summary</h2>
          <div className="space-y-3">
            {items.map(({ product, qty, color }) => (
              <div key={lineId(product._id, color)} className="flex justify-between gap-2 text-sm">
                <span className="text-ink/70">
                  {product.name}
                  {color ? <span className="text-ink/40"> ({color})</span> : null}{' '}
                  <span className="text-ink/40">x{qty}</span>
                </span>
                <span className="whitespace-nowrap font-medium">
                  {formatPrice(effectivePrice(product) * qty)}
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-pink-soft" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery Fee</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            {promo && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({promo.discountPercent}%)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="mt-5">
            <p className="mb-2 text-sm text-ink/70">Do you have a promo code?</p>
            {promo ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
                <span className="font-medium text-green-700">
                  {promo.code} applied ({promo.discountPercent}% off)
                </span>
                <button
                  onClick={() => {
                    removePromo();
                    setPromoError('');
                  }}
                  className="text-ink/50 hover:text-red-500"
                  aria-label="Remove promo code"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-stretch gap-2">
                  <input
                    value={codeInput}
                    onChange={(e) => {
                      setCodeInput(e.target.value.toUpperCase());
                      setPromoError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        checkPromo();
                      }
                    }}
                    placeholder="Enter code"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={checkPromo}
                    disabled={checking || !codeInput.trim()}
                    className="btn-primary shrink-0 px-5 disabled:opacity-60"
                  >
                    {checking ? '...' : 'CHECK'}
                  </button>
                </div>
                {promoError && <p className="mt-2 text-sm text-red-500">{promoError}</p>}
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-8 lg:order-1 lg:col-span-2">
          <section>
            <h2 className="mb-4 font-serif text-xl text-ink">Personal Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={info.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="input sm:col-span-2"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={info.email}
                onChange={(e) => update('email', e.target.value)}
                className="input sm:col-span-2"
              />
              <select
                required
                value={info.governorate}
                onChange={(e) => update('governorate', e.target.value)}
                className="input"
              >
                <option value="">Select Governorate</option>
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <input
                required
                placeholder="Address"
                value={info.address}
                onChange={(e) => update('address', e.target.value)}
                className="input"
              />
              {/* Phone 1 with +20 prefix */}
              <div className="flex items-stretch overflow-hidden rounded-lg border border-pink-soft focus-within:border-pink-accent">
                <span className="flex items-center gap-2 border-r border-pink-soft bg-pink-light px-3 text-sm">
                  <span aria-hidden>🇪🇬</span> +20
                </span>
                <input
                  required
                  placeholder="Phone Number 1"
                  value={info.phone1}
                  onChange={(e) => update('phone1', e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1 px-4 py-3 text-sm outline-none"
                />
              </div>
              <input
                placeholder="Phone Number 2 (optional)"
                value={info.phone2}
                onChange={(e) => update('phone2', e.target.value)}
                className="input"
              />
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="h-4 w-4 accent-pink-accent"
              />
              Save Information on This Website
            </label>
          </section>

          {/* Payment method */}
          <section>
            <h2 className="mb-4 font-serif text-xl text-ink">Payment Method</h2>
            <label className="flex items-center gap-3 rounded-xl border-2 border-pink-accent bg-pink-light p-4">
              <input type="radio" checked readOnly className="h-4 w-4 accent-pink-accent" />
              <span className="font-medium text-ink">Cash on Delivery (COD)</span>
            </label>
          </section>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? 'Placing Order...' : 'Order Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
