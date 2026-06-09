/* wishlist.js — Wishlist State (localStorage) */

const WISHLIST_KEY = 'robabikia_wishlist';

window.wishlist = {
  getItems() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
    catch { return []; }
  },

  saveItems(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    this.updateHearts();
    document.dispatchEvent(new CustomEvent('wishlist:updated'));
  },

  has(productId) {
    return this.getItems().some(i => i.id === productId);
  },

  toggle(product) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      this.saveItems(items);
      return false;
    }
    items.push({
      id: product.id,
      nameAr: product.ar?.name || '',
      nameEn: product.en?.name || '',
      image: product.image || '',
      priceAr: product.ar?.price || '',
      priceEn: product.en?.price || '',
      category: product.category || ''
    });
    this.saveItems(items);
    return true;
  },

  remove(productId) {
    this.saveItems(this.getItems().filter(i => i.id !== productId));
  },

  getCount() {
    return this.getItems().length;
  },

  updateHearts() {
    const items = this.getItems();
    document.querySelectorAll('.wishlist-btn[data-id]').forEach(btn => {
      const isIn = items.some(i => i.id === btn.dataset.id);
      btn.classList.toggle('active', isIn);
      btn.setAttribute('aria-pressed', String(isIn));
    });
  },

  renderPage() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;
    const items = this.getItems();
    const lang = window.utils?.getCurrentLang() || 'ar';

    const title = document.getElementById('wishlist-page-title');
    if (title) title.textContent = lang === 'en' ? 'My Wishlist' : 'المفضلة';

    if (items.length === 0) {
      const msg = lang === 'en'
        ? 'No items in your wishlist yet. Browse our collections!'
        : 'لا توجد منتجات في المفضلة. تصفح مجموعاتنا!';
      const browseText = lang === 'en' ? 'Browse Products' : 'تصفح المنتجات';
      container.innerHTML = `
        <div class="cart-empty-state">
          <p>${msg}</p>
          <a href="#perfumes" class="btn btn-gold" style="margin-top:1.5rem;">${browseText}</a>
        </div>
      `;
      return;
    }

    const removeLabel = lang === 'en' ? 'Remove' : 'إزالة';
    const viewLabel = lang === 'en' ? 'View Product' : 'عرض المنتج';

    container.innerHTML = items.map(item => {
      const name = lang === 'en' ? (item.nameEn || item.nameAr) : item.nameAr;
      const price = lang === 'en' ? (item.priceEn || item.priceAr) : item.priceAr;
      const imgSrc = item.image || '';
      return `
        <div class="wishlist-card glass-panel">
          ${imgSrc ? `<img src="${imgSrc}" alt="${name}" class="wishlist-card-img" onerror="this.style.display='none'">` : '<div class="wishlist-card-img-placeholder"></div>'}
          <div class="wishlist-card-info">
            <h3 class="wishlist-card-name">${name}</h3>
            <p class="wishlist-card-price">${price}</p>
          </div>
          <div class="wishlist-card-actions">
            <button class="btn btn-outline wishlist-view-btn" data-id="${item.id}">${viewLabel}</button>
            <button class="btn wishlist-remove-btn" data-id="${item.id}">${removeLabel}</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind events
    container.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.remove(btn.dataset.id);
        this.renderPage();
        const msg = lang === 'en' ? 'Removed from wishlist' : 'تمت الإزالة من المفضلة';
        window.utils?.showToast(msg, 'success');
      });
    });

    container.querySelectorAll('.wishlist-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = window.catalogProducts?.find(p => p.id === btn.dataset.id);
        if (product) {
          // Open product modal by simulating a product card button click
          document.querySelector(`.product-card-btn[data-id="${btn.dataset.id}"]`)?.click()
            || document.getElementById('product-modal')?.dispatchEvent(new CustomEvent('openProduct', { detail: { id: btn.dataset.id } }));
        } else {
          window.location.hash = '#perfumes';
        }
      });
    });
  },

  init() {
    // Wishlist heart button clicks via delegation
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('.wishlist-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      if (!id) return;

      const product = window.catalogProducts?.find(p => p.id === id);
      if (!product) return;

      const added = this.toggle(product);
      const lang = window.utils?.getCurrentLang() || 'ar';
      const msg = added
        ? (lang === 'en' ? 'Added to wishlist ♥' : 'تمت الإضافة للمفضلة ♥')
        : (lang === 'en' ? 'Removed from wishlist' : 'تمت الإزالة من المفضلة');
      window.utils?.showToast(msg, 'success');
    });

    this.updateHearts();
  }
};

document.addEventListener('DOMContentLoaded', () => window.wishlist.init());
