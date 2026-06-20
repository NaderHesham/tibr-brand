import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProduct, getProductReviews } from "@/lib/api";
import { useCart } from "@/stores/cart";
import { useToast } from "@/components/ui/Toast";

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
    <rect x="9" y="11" width="14" height="10" rx="2" />
    <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
  </svg>
);

export default function Product() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const navigate = useNavigate();
  const addItem = useCart((s) => s.addItem);
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState(null);

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getProductReviews(id),
    enabled: !!id,
  });

  if (!id) {
    navigate("/shop/perfumes", { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="store-container">
        <div className="pdp" style={{ paddingTop: "2rem" }}>
          <div className="pdp__media skeleton" />
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="skeleton skeleton-line skeleton-line--sm" style={{ width: "40%" }} />
            <div className="skeleton skeleton-line skeleton-line--lg" style={{ width: "70%" }} />
            <div className="skeleton skeleton-line skeleton-line--price" style={{ width: "30%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !productData?.data) {
    return (
      <div className="store-container">
        <div className="rb-empty" style={{ paddingTop: "4rem" }}>
          <h2 className="rb-empty__title">Product not found</h2>
          <Link className="btn btn--secondary" to="/shop/perfumes">Back to shop</Link>
        </div>
      </div>
    );
  }

  const p = productData.data;
  const name = p.en_name || p.ar_name;
  const desc = p.en_desc || p.ar_desc;
  const price = p.price ?? p.ar_price ?? p.en_price ?? 0;
  const sizes = Array.isArray(p.sizes) ? p.sizes : [];
  const catPath = `/shop/${p.category || "perfumes"}`;
  const catLabel = p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "Perfumes";

  const handleAddToCart = () => {
    addItem(p, sizes.length > 0 ? selectedSize : null);
    toast(`<strong>${name}</strong> added to cart`);
  };

  return (
    <div className="store-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb__sep" aria-hidden="true">/</span>
        <Link to={catPath}>{catLabel}</Link>
        <span className="breadcrumb__sep" aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>

      <motion.article
        className="pdp"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="pdp__media">
          {p.image && (
            <img className="pdp__img" src={p.image} alt={name} />
          )}
          <button className="pdp__wish" type="button" aria-pressed="false" aria-label="Add to wishlist">
            <HeartIcon />
          </button>
        </div>

        <div className="pdp__buy">
          <p className="pdp__collection">{catLabel}</p>
          <h1 className="pdp__title">{name}</h1>
          <p className="pdp__price">{price} EGP</p>
          {desc && <p className="pdp__desc">{desc}</p>}

          {sizes.length > 0 && (
            <div>
              <p className="pdp__field-label">Size</p>
              <div className="size-options">
                {sizes.map((sz) => (
                  <label key={sz} className="size-chip">
                    <input
                      type="radio"
                      name="size"
                      value={sz}
                      checked={selectedSize === sz}
                      onChange={() => setSelectedSize(sz)}
                    />
                    {sz}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pdp__actions">
            <button
              className="btn btn--primary btn--lg"
              type="button"
              onClick={handleAddToCart}
              disabled={sizes.length > 0 && !selectedSize}
            >
              Add to cart
            </button>
          </div>

          <p className="pdp__cod">
            <TruckIcon />
            Cash on delivery across Egypt
          </p>

          {reviewsData?.data?.length > 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p className="pdp__field-label" style={{ marginBottom: "0.75rem" }}>
                Reviews ({reviewsData.data.length})
              </p>
              {reviewsData.data.slice(0, 3).map((r) => (
                <div key={r.id} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--line)" }}>
                  <p style={{ color: "var(--gold)", marginBottom: "0.25rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.body && <p style={{ color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>{r.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}
