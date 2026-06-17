import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { adminGetProducts, adminCreateProduct, adminUpdateProduct } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = ["perfumes", "clothing", "sneakers"];

const EMPTY_FORM = {
  id: "",
  category: "perfumes",
  ar_name: "",
  en_name: "",
  ar_price: "",
  en_price: "",
  quantity: "",
  ar_desc: "",
  en_desc: "",
  sizes: "",
  image: "",
};

export default function AdminProduct() {
  const [params] = useSearchParams();
  const editId = params.get("id");
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  const { data: allProducts } = useQuery({
    queryKey: ["admin-products", token],
    queryFn: () => adminGetProducts(token),
    enabled: !!token && !!editId,
  });

  useEffect(() => {
    if (editId && allProducts?.data) {
      const p = allProducts.data.find((x) => x.id === editId);
      if (p) {
        setForm({
          id: p.id,
          category: p.category,
          ar_name: p.ar_name || "",
          en_name: p.en_name || "",
          ar_price: p.ar_price || "",
          en_price: p.en_price || "",
          quantity: p.quantity ?? "",
          ar_desc: p.ar_desc || "",
          en_desc: p.en_desc || "",
          sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || ""),
          image: p.image || "",
        });
        if (p.image) setImgPreview(p.image);
      }
    }
  }, [editId, allProducts]);

  const { mutate: createProduct, isPending: creating } = useMutation({
    mutationFn: (body) => adminCreateProduct(body, token),
    onSuccess: () => { toast("Product created!"); navigate("/admin"); },
    onError: (err) => toast(err.message || "Failed to create product"),
  });

  const { mutate: updateProduct, isPending: updating } = useMutation({
    mutationFn: ({ id, body }) => adminUpdateProduct(id, body, token),
    onSuccess: () => { toast("Product updated!"); navigate("/admin"); },
    onError: (err) => toast(err.message || "Failed to update product"),
  });

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const json = await res.json();
    if (json.url) {
      setField("image", json.url);
      setImgPreview(json.url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = {
      ...form,
      ar_price: Number(form.ar_price),
      en_price: Number(form.en_price),
      quantity: Number(form.quantity) || 0,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (editId) {
      updateProduct({ id: editId, body });
    } else {
      createProduct(body);
    }
  };

  if (authLoading || !user) return null;

  const isPending = creating || updating;

  return (
    <div className="store-container">
      <header className="page-head page-head--compact">
        <h1 className="page-head__title">{editId ? "Edit product" : "Add product"}</h1>
      </header>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <p className="admin-panel__title">{editId ? "Edit product" : "New product"}</p>
            <p className="admin-panel__sub">Fill in all required fields and upload a product image.</p>
          </div>
          <Link className="btn btn--ghost" to="/admin">← Back to admin</Link>
        </div>

        <form className="admin-product-shell" onSubmit={handleSubmit} noValidate>
          <div className="admin-product-form">
            <div className="co-card">
              <p className="co-card__title"><span className="co-card__num">1</span> Basic info</p>
              <div className="admin-form-grid">
                {!editId && (
                  <div className="field field--full">
                    <label className="field__label" htmlFor="p-id">Product ID <span className="field__req">*</span></label>
                    <input id="p-id" className="input" value={form.id} onChange={(e) => setField("id", e.target.value)} required placeholder="e.g. oud-royal-50ml" />
                  </div>
                )}
                <div className="field field--full">
                  <label className="field__label" htmlFor="p-cat">Category <span className="field__req">*</span></label>
                  <div className="select-field">
                    <select id="p-cat" className="select" value={form.category} onChange={(e) => setField("category", e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-ar-name">Arabic name <span className="field__req">*</span></label>
                  <input id="p-ar-name" className="input" dir="rtl" value={form.ar_name} onChange={(e) => setField("ar_name", e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-en-name">English name <span className="field__req">*</span></label>
                  <input id="p-en-name" className="input" value={form.en_name} onChange={(e) => setField("en_name", e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-ar-price">Arabic price (EGP) <span className="field__req">*</span></label>
                  <input id="p-ar-price" className="input" type="number" min="0" value={form.ar_price} onChange={(e) => setField("ar_price", e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-en-price">English price (EGP) <span className="field__req">*</span></label>
                  <input id="p-en-price" className="input" type="number" min="0" value={form.en_price} onChange={(e) => setField("en_price", e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-qty">Quantity</label>
                  <input id="p-qty" className="input" type="number" min="0" value={form.quantity} onChange={(e) => setField("quantity", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="p-sizes">Sizes (comma-separated)</label>
                  <input id="p-sizes" className="input" value={form.sizes} onChange={(e) => setField("sizes", e.target.value)} placeholder="S, M, L, XL" />
                </div>
                <div className="field field--full">
                  <label className="field__label" htmlFor="p-ar-desc">Arabic description</label>
                  <textarea id="p-ar-desc" className="textarea" dir="rtl" value={form.ar_desc} onChange={(e) => setField("ar_desc", e.target.value)} />
                </div>
                <div className="field field--full">
                  <label className="field__label" htmlFor="p-en-desc">English description</label>
                  <textarea id="p-en-desc" className="textarea" value={form.en_desc} onChange={(e) => setField("en_desc", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="admin-form-actions">
              <button
                className={`btn btn--primary${isPending ? " is-loading" : ""}`}
                type="submit"
                disabled={isPending}
              >
                {isPending ? "" : editId ? "Save changes" : "Create product"}
              </button>
              <Link className="btn btn--ghost" to="/admin">Cancel</Link>
            </div>
          </div>

          <div>
            <div className="co-card">
              <p className="co-card__title"><span className="co-card__num">2</span> Image</p>
              {imgPreview && (
                <img
                  src={imgPreview}
                  alt="Product preview"
                  style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--r-md)", marginBottom: "1rem", border: "1px solid var(--line)" }}
                />
              )}
              <div className="field">
                <label className="field__label" htmlFor="p-img-upload">Upload image</label>
                <input id="p-img-upload" className="input" type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="field" style={{ marginTop: "0.75rem" }}>
                <label className="field__label" htmlFor="p-img-url">Or paste image URL</label>
                <input
                  id="p-img-url"
                  className="input"
                  type="url"
                  value={form.image}
                  onChange={(e) => { setField("image", e.target.value); setImgPreview(e.target.value); }}
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
