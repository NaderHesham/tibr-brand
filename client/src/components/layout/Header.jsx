import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "@/stores/cart";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 8V6a4 4 0 0 1 8 0v2" /><rect width="16" height="14" x="4" y="8" rx="2" />
  </svg>
);
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
  </svg>
);

export default function Header({ onMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((n, i) => n + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`store-header${scrolled ? " is-scrolled" : ""}`} id="store-header">
      <div className="store-container store-header__inner">
        <Link className="store-wordmark" to="/" aria-label="TIBR">
          TIBR<span className="dot">.</span>
        </Link>

        <nav className="store-nav" aria-label="Categories">
          <ul className="store-nav__list">
            {[
              { to: "/", label: "Home" },
              { to: "/shop/perfumes", label: "Shop" },
              { to: "/about", label: "About" },
              { to: "/account", label: "Profile" },
            ].map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  className={({ isActive }) => `store-nav__link${isActive ? "" : ""}`}
                  to={to}
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                >
                  {({ isActive }) => (
                    <span aria-current={isActive ? "page" : undefined}>{label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="store-utils">
          <Link className="store-iconbtn" to="/cart" aria-label="Cart">
            <BagIcon />
            <span className={`store-cart-count${count > 0 ? " is-active" : ""}`} aria-hidden="true">
              {count}
            </span>
          </Link>
          <button
            className="store-burger"
            id="burger"
            type="button"
            aria-expanded="false"
            aria-controls="drawer"
            aria-label="Menu"
            onClick={onMenuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
