import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { adminGetProducts, adminGetOrders, adminUpdateOrderStatus, adminDeleteProduct, getProfile } from "@/lib/api";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_META = {
  pending:   { label: "Pending",   dot: "var(--warning)",  bg: "oklch(0.808 0.105 72 / 0.12)", text: "var(--warning)" },
  confirmed: { label: "Confirmed", dot: "var(--info)",     bg: "oklch(0.760 0.060 232 / 0.12)", text: "var(--info)" },
  shipped:   { label: "Shipped",   dot: "var(--gold)",     bg: "var(--gold-ghost)",              text: "var(--gold)" },
  delivered: { label: "Delivered", dot: "var(--success)",  bg: "var(--success-fill)",            text: "var(--success)" },
  cancelled: { label: "Cancelled", dot: "var(--danger)",   bg: "var(--danger-fill)",             text: "var(--danger)" },
};

function StatusBadge({ orderId, current, token }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (status) => adminUpdateOrderStatus(orderId, status, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setOpen(false);
    },
  });

  const openDropdown = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };

  const meta = STATUS_META[current] ?? STATUS_META.pending;

  return (
    <>
      <button
        ref={triggerRef}
        className="status-badge"
        style={{ "--sb-bg": meta.bg, "--sb-text": meta.text, "--sb-dot": meta.dot }}
        onClick={openDropdown}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Status: ${meta.label}. Click to change.`}
      >
        <span className="status-badge__dot" aria-hidden="true" />
        <span className="status-badge__label">{meta.label}</span>
        <svg className="status-badge__chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && rect && createPortal(
        <>
          <div className="status-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="status-dropdown"
            role="listbox"
            aria-label="Change order status"
            style={{
              top: `${rect.bottom + 4}px`,
              left: `${rect.left}px`,
              minWidth: `${Math.max(rect.width, 148)}px`,
            }}
          >
            {STATUSES.map((s) => {
              const m = STATUS_META[s];
              const isActive = s === current;
              return (
                <button
                  key={s}
                  role="option"
                  aria-selected={isActive}
                  className={`status-dropdown__option${isActive ? " is-current" : ""}`}
                  style={{ "--sb-dot": m.dot, "--sb-text": m.text }}
                  onClick={() => !isActive && mutate(s)}
                  disabled={isPending}
                >
                  <span className="status-badge__dot" aria-hidden="true" />
                  <span>{m.label}</span>
                  {isActive && (
                    <svg className="status-dropdown__check" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("orders");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", token],
    queryFn: () => getProfile(token),
    enabled: !!token,
  });
  const isAdmin = profileData?.data?.role === "admin";

  useEffect(() => {
    if (!profileLoading && profileData && !isAdmin) {
      navigate("/account", { replace: true });
    }
  }, [profileLoading, profileData, isAdmin, navigate]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders", token],
    queryFn: () => adminGetOrders(token),
    enabled: !!token && activeTab === "orders",
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products", token],
    queryFn: () => adminGetProducts(token),
    enabled: !!token && activeTab === "products",
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id) => adminDeleteProduct(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  if (authLoading || !user || profileLoading || !isAdmin) return null;

  const orders = ordersData?.data ?? [];
  const products = productsData?.data ?? [];

  const counts = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const visibleOrders = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) => {
      if (!orderSearch) return true;
      const q = orderSearch.toLowerCase();
      return (
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.products?.en_name?.toLowerCase().includes(q)
      );
    });

  const FILTER_OPTIONS = [
    { key: "all",       label: "All",       count: counts.total },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "shipped",   label: "Shipped",   count: counts.shipped },
    { key: "delivered", label: "Delivered", count: counts.delivered },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  return (
    <div className="store-container">
      <header className="page-head page-head--compact">
        <h1 className="page-head__title">Admin</h1>
      </header>

      {activeTab === "orders" && (
        <div className="admin-stats">
          <div className="stat">
            <p className="stat__value">{counts.total}</p>
            <p className="stat__label">Total Orders</p>
          </div>
          <div className="stat">
            <p className="stat__value" style={{ color: "var(--warning)" }}>{counts.pending}</p>
            <p className="stat__label">Pending</p>
          </div>
          <div className="stat">
            <p className="stat__value" style={{ color: "var(--gold)" }}>{counts.shipped}</p>
            <p className="stat__label">Shipped</p>
          </div>
          <div className="stat">
            <p className="stat__value" style={{ color: "var(--success)" }}>{counts.delivered}</p>
            <p className="stat__label">Delivered</p>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`admin-tab${activeTab === "orders" ? " is-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`admin-tab${activeTab === "products" ? " is-active" : ""}`}
          type="button"
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
      </div>

      {/* ── ORDERS PANE ── */}
      {activeTab === "orders" && (
        <div className="admin-pane is-active">
          <div className="order-toolbar">
            <div className="order-search">
              <svg className="order-search__icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                className="order-search__input"
                type="search"
                placeholder="Search name, phone, or order ID…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              {orderSearch && (
                <button
                  className="order-search__clear"
                  type="button"
                  onClick={() => setOrderSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="order-filter-chips" role="group" aria-label="Filter by status">
            {FILTER_OPTIONS.map(({ key, label, count }) => (
              <button
                key={key}
                className="filter-chip"
                type="button"
                aria-pressed={statusFilter === key}
                onClick={() => setStatusFilter(key)}
              >
                {label}
                <span className="filter-chip__count">{count}</span>
              </button>
            ))}
          </div>

          {ordersLoading ? (
            <div className="table-wrap">
              <table className="table" aria-label="Orders loading">
                <thead>
                  <tr>
                    <th>Order</th><th>Customer</th><th>Product</th>
                    <th>Status</th><th>Total</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="skel-row">
                      <td><span className="skel skel--id" /></td>
                      <td>
                        <span className="skel skel--name" />
                        <span className="skel skel--phone" />
                      </td>
                      <td><span className="skel skel--product" /></td>
                      <td><span className="skel skel--badge" /></td>
                      <td><span className="skel skel--price" /></td>
                      <td><span className="skel skel--date" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="admin-empty-state">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect x="6" y="3" width="24" height="30" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M11 12h14M11 18h14M11 24h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <p className="admin-empty-state__title">No orders found</p>
              <p className="admin-empty-state__sub">
                {statusFilter !== "all" || orderSearch
                  ? "Try a different filter or search term"
                  : "Orders will appear here once customers check out"}
              </p>
              {(statusFilter !== "all" || orderSearch) && (
                <button
                  className="btn btn--secondary"
                  style={{ marginBlockStart: "var(--sp-4)" }}
                  onClick={() => { setStatusFilter("all"); setOrderSearch(""); }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table" aria-label="Orders">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span className="order-id">{o.id?.slice(0, 8)}</span>
                      </td>
                      <td>
                        <div className="order-cell">
                          <span className="order-cell__primary">{o.customer_name || "—"}</span>
                          {o.customer_phone && (
                            <span className="order-cell__secondary">{o.customer_phone}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="order-cell">
                          <span className="order-cell__primary">{o.products?.en_name || "—"}</span>
                          {(o.size || o.qty) && (
                            <span className="order-cell__secondary">
                              {[o.size && `Size ${o.size}`, o.qty && `Qty ${o.qty}`].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge orderId={o.id} current={o.status} token={token} />
                      </td>
                      <td className="num order-total-cell">
                        {o.order_total ? `${Number(o.order_total).toLocaleString()} EGP` : "—"}
                      </td>
                      <td className="order-date-cell">
                        {new Date(o.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS PANE ── */}
      {activeTab === "products" && (
        <div className="admin-pane is-active">
          <div className="admin-toolbar">
            <span style={{ color: "var(--muted)", fontSize: "var(--fs-sm)" }}>{products.length} products</span>
            <Link className="btn btn--primary" to="/admin/product">Add product</Link>
          </div>
          {productsLoading ? (
            <p style={{ color: "var(--muted)" }}>Loading products…</p>
          ) : (
            <div className="table-wrap">
              <table className="table admin-product-table" aria-label="Products">
                <thead>
                  <tr>
                    <th className="ap-thumb-cell" />
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="ap-thumb-cell">
                        {p.image ? (
                          <img className="ap-thumb" src={p.image} alt={p.en_name} />
                        ) : (
                          <div className="ap-thumb--empty" />
                        )}
                      </td>
                      <td>
                        <div className="admin-product-meta">
                          <span className="admin-product-meta__name">{p.en_name}</span>
                          <span className="admin-product-meta__sub">{p.ar_name}</span>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td className="num">{p.en_price} EGP</td>
                      <td className="num">{p.quantity}</td>
                      <td>
                        <div className="product-actions">
                          <Link
                            className="btn btn--secondary"
                            to={`/admin/product?id=${p.id}`}
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn--danger"
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete "${p.en_name}"?`)) deleteProduct(p.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
