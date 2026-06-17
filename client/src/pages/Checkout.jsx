import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/stores/cart";
import { useAuth } from "@/stores/auth";
import { useLang } from "@/stores/lang";
import { checkout as apiCheckout } from "@/lib/api";

const PAYMENT_METHODS = [
  { id: "cash_on_delivery", label: "Cash on delivery", desc: "Pay when delivered" },
  { id: "vodafone_cash", label: "Vodafone Cash", desc: "Mobile wallet" },
  { id: "instapay", label: "InstaPay", desc: "Instant bank transfer" },
];

export default function Checkout() {
  const { lang } = useLang();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    payment_method: "cash_on_delivery",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.product.price ?? i.product.ar_price ?? 0) * i.qty,
    0
  );

  if (items.length === 0 && !success) {
    return (
      <div className="store-container" style={{ paddingBlock: "4rem", textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>Your cart is empty.</p>
        <Link className="btn btn--primary" to="/shop/perfumes" style={{ marginTop: "1rem" }}>Browse store</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="store-container">
        <motion.div
          className="checkout-success"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="checkout-success__mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", color: "var(--ink)" }}>
            Order placed!
          </h1>
          <p className="checkout-success__ref">#{success.checkout_reference?.slice(0, 8).toUpperCase()}</p>
          <p style={{ color: "var(--muted)" }}>
            Total: <strong style={{ color: "var(--gold)" }}>{success.total_amount} EGP</strong>
          </p>
          <Link className="btn btn--secondary" to="/account?tab=orders">View my orders</Link>
          <Link className="btn btn--ghost" to="/shop/perfumes">Continue shopping</Link>
        </motion.div>
      </div>
    );
  }

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.customer_name || !form.customer_phone || !form.customer_address) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await apiCheckout(
        {
          items: items.map((i) => ({ productId: i.product.id, size: i.size, qty: i.qty })),
          ...form,
        },
        token
      );
      clearCart();
      setSuccess(res.data);
    } catch (err) {
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-container">
      <header className="page-head">
        <h1 className="page-head__title">Checkout</h1>
      </header>

      <form className="checkout" onSubmit={handleSubmit} noValidate>
        <div className="co-sections">
          <div className="co-card">
            <p className="co-card__title">
              <span className="co-card__num">1</span> Delivery details
            </p>
            <div className="form-grid">
              <div className="field">
                <label className="field__label" htmlFor="c-name">
                  Full name <span className="field__req">*</span>
                </label>
                <input
                  id="c-name"
                  className="input"
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="c-phone">
                  Phone <span className="field__req">*</span>
                </label>
                <input
                  id="c-phone"
                  className="input"
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="field field--full">
                <label className="field__label" htmlFor="c-address">
                  Address <span className="field__req">*</span>
                </label>
                <textarea
                  id="c-address"
                  className="textarea"
                  value={form.customer_address}
                  onChange={(e) => handleChange("customer_address", e.target.value)}
                  required
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="co-card">
            <p className="co-card__title">
              <span className="co-card__num">2</span> Payment
            </p>
            <div className="pay-options">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className="pay-option">
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={form.payment_method === m.id}
                    onChange={() => handleChange("payment_method", m.id)}
                  />
                  <span className="pay-option__label">{m.label}</span>
                  <span className="pay-option__desc">{m.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--danger)", fontSize: "var(--fs-sm)" }}>{error}</p>
          )}

          <button
            className={`btn btn--primary btn--block btn--lg${loading ? " is-loading" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "" : "Place order"}
          </button>
        </div>

        <div className="summary">
          <h2 className="summary__title">Order summary</h2>
          <div className="summary__items">
            {items.map((item) => {
              const name = lang === "ar"
                ? (item.product.ar_name || item.product.en_name)
                : (item.product.en_name || item.product.ar_name);
              const price = item.product.price ?? item.product.ar_price ?? 0;
              return (
                <div key={item.key} className="summary__item">
                  {item.product.image ? (
                    <img className="summary__item-img" src={item.product.image} alt={name} />
                  ) : (
                    <div className="summary__item-img summary__item-img--empty" />
                  )}
                  <div className="summary__item-info">
                    <span className="summary__item-name">{name}</span>
                    <span className="summary__item-meta">Qty: {item.qty}{item.size ? ` · ${item.size}` : ""}</span>
                  </div>
                  <span className="summary__item-price">{price * item.qty} EGP</span>
                </div>
              );
            })}
          </div>
          <div className="summary__divider" />
          <div className="summary__row">
            <span>Subtotal</span>
            <span className="val">{subtotal} EGP</span>
          </div>
          <div className="summary__row">
            <span>Shipping</span>
            <span className="val summary__free">Free</span>
          </div>
          <div className="summary__row summary__row--total">
            <span>Total</span>
            <span className="val">{subtotal} EGP</span>
          </div>
          <p className="summary__note">Cash on delivery · Free shipping across Egypt</p>
        </div>
      </form>
    </div>
  );
}
