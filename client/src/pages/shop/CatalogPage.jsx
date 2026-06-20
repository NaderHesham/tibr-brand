import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/catalog/ProductCard";

const SearchIcon = () => (
  <svg className="ic-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="11" cy="11" r="6.4" /><path d="M16.5 16.5 21 21" strokeLinecap="round" />
  </svg>
);

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__media" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-line skeleton-line--sm" />
        <div className="skeleton skeleton-line skeleton-line--lg" />
        <div className="skeleton skeleton-line skeleton-line--price" />
      </div>
    </div>
  );
}

export default function CatalogPage({ category, title, breadcrumb, intro }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  });

  const products = useMemo(() => {
    let list = (data?.data ?? []).filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => (p.en_name || "").toLowerCase().includes(q));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "price-desc") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return list;
  }, [data, category, search, sort]);

  const isEmpty = !isLoading && products.length === 0;

  return (
    <div className="store-container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb__sep" aria-hidden="true">/</span>
        <span aria-current="page">{breadcrumb}</span>
      </nav>

      <header className="catalog-head">
        <h1 className="catalog-head__title">{title}</h1>
        <hr className="catalog-head__rule" />
        {intro && <p className="catalog-head__intro">{intro}</p>}
      </header>

      <div className="catalog-filter">
        <div className="catalog-filter__bar">
          <SearchIcon />
          <input
            className="catalog-filter__input"
            type="search"
            placeholder={`Search ${title.toLowerCase()}…`}
            aria-label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="catalog-filter__div" aria-hidden="true" />
          <select
            className="sort__select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
        <p className="catalog-filter__count" aria-live="polite">
          <span>{products.length}</span> {title.toLowerCase()}
        </p>
      </div>

      {isLoading ? (
        <div className="catalog-grid skeleton-grid" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isEmpty ? (
        <motion.div
          className="catalog-empty"
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="catalog-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" /><path d="M8.5 11h5" strokeLinecap="round" />
          </svg>
          <h2 className="catalog-empty__title">No {title.toLowerCase()} match your search</h2>
          <p className="catalog-empty__text">Try a different search term.</p>
          <button className="btn btn--secondary" type="button" onClick={() => setSearch("")}>
            View all {title.toLowerCase()}
          </button>
        </motion.div>
      ) : (
        <section
          className="catalog-grid"
          id="product-grid"
          data-category={category}
          aria-label={`${title} list`}
        >
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </section>
      )}
    </div>
  );
}
