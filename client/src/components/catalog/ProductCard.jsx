import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/stores/cart";
import { useLang } from "@/stores/lang";
import { useToast } from "@/components/ui/Toast";

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

function Stars({ avg, count }) {
  if (!count) return null;
  const full = Math.round(avg);
  return (
    <div className="product__reviews">
      <span className="product__stars" aria-hidden="true">
        {"★".repeat(Math.max(0, Math.min(5, full)))}
        {"☆".repeat(Math.max(0, 5 - full))}
      </span>
      <span className="product__review-count">({count})</span>
    </div>
  );
}

export default function ProductCard({ product, index = 0 }) {
  const { lang } = useLang();
  const addItem = useCart((s) => s.addItem);
  const toast = useToast();

  const name = lang === "ar" ? (product.ar_name || product.en_name) : (product.en_name || product.ar_name);
  const price = product.price ?? product.ar_price ?? product.en_price ?? 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    toast(`<strong>${name}</strong> added to cart`);
  };

  return (
    <motion.article
      className="product is-visible"
      data-product
      data-id={product.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="product__media">
        <Link className="product__link" to={`/product?id=${product.id}`} aria-label={name}>
          {product.image ? (
            <img
              className="product__img"
              src={product.image}
              loading="lazy"
              decoding="async"
              alt={name}
            />
          ) : (
            <div className="product__img product__img--placeholder" />
          )}
        </Link>
        <button className="product__wish" type="button" aria-pressed="false" aria-label={`Add ${name} to wishlist`}>
          <HeartIcon />
        </button>
        <button className="product__atc" type="button" onClick={handleAddToCart}>
          Add to cart
        </button>
      </div>
      <div className="product__body">
        <Link className="product__name" to={`/product?id=${product.id}`}>{name}</Link>
        <Stars avg={product.review_avg} count={product.review_count} />
        <p className="product__price">{price} EGP</p>
      </div>
    </motion.article>
  );
}
