/* cart.js — Shopping Cart State Management */

const CART_KEY = 'robabikia_cart';

window.cart = {
  getItems() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  },

  saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
    document.dispatchEvent(new CustomEvent('cart:updated'));
  },

  addItem(product, size, qty = 1) {
    const items = this.getItems();
    const itemId = `${product.id}_${size || 'default'}`;
    const existing = items.find(i => i.id === itemId);
    const priceStr = product.ar?.price || product.en?.price || '0';
    const numericPrice = window.utils.parsePrice(priceStr);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: itemId,
        productId: product.id,
        nameAr: product.ar?.name || '',
        nameEn: product.en?.name || '',
        image: product.image || '',
        size: size || '',
        priceAr: product.ar?.price || '',
        priceEn: product.en?.price || '',
        numericPrice,
        qty
      });
    }

    this.saveItems(items);
    const lang = window.utils.getCurrentLang();
    const msg = lang === 'en' ? 'Product added to cart ✓' : 'تمت إضافة المنتج إلى السلة ✓';
    window.utils.showToast(msg, 'success');
  },

  removeItem(itemId) {
    this.saveItems(this.getItems().filter(i => i.id !== itemId));
  },

  updateQty(itemId, qty) {
    if (qty <= 0) { this.removeItem(itemId); return; }
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    if (item) { item.qty = qty; this.saveItems(items); }
  },

  clearCart() {
    this.saveItems([]);
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + (i.numericPrice * i.qty), 0);
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = this.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  _getItemName(item) {
    const lang = window.utils.getCurrentLang();
    return lang === 'en' ? (item.nameEn || item.nameAr) : item.nameAr;
  },

  _getItemPrice(item) {
    const lang = window.utils.getCurrentLang();
    return lang === 'en' ? (item.priceEn || item.priceAr) : item.priceAr;
  },

  _buildItemHTML(item) {
    const name = this._getItemName(item);
    const price = this._getItemPrice(item);
    const lang = window.utils.getCurrentLang();
    const removeLabel = lang === 'en' ? 'Remove' : 'حذف';
    const imgSrc = item.image || '';
    return `
      <div class="cart-item" data-id="${item.id}">
        ${imgSrc ? `<img src="${imgSrc}" alt="${name}" class="cart-item-img" onerror="this.style.display='none'">` : '<div class="cart-item-img-placeholder"></div>'}
        <div class="cart-item-body">
          <p class="cart-item-name">${name}</p>
          ${item.size ? `<p class="cart-item-size">${item.size}</p>` : ''}
          <p class="cart-item-price">${price}</p>
          <div class="cart-item-controls">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
            <button class="cart-remove-btn" data-action="remove" data-id="${item.id}">${removeLabel}</button>
          </div>
        </div>
      </div>
    `;
  },

  _bindItemEvents(container) {
    container.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const item = this.getItems().find(i => i.id === id);
      if (action === 'dec') this.updateQty(id, (item?.qty || 1) - 1);
      else if (action === 'inc') this.updateQty(id, (item?.qty || 1) + 1);
      else if (action === 'remove') this.removeItem(id);
    });
  },

  renderDrawer() {
    const list = document.getElementById('cart-drawer-list');
    const totalEl = document.getElementById('cart-drawer-total');
    if (!list) return;
    const items = this.getItems();
    const lang = window.utils.getCurrentLang();

    if (items.length === 0) {
      const emptyMsg = lang === 'en' ? 'Your cart is empty' : 'السلة فارغة حالياً';
      list.innerHTML = `<div class="cart-empty-state"><p>${emptyMsg}</p></div>`;
    } else {
      list.innerHTML = items.map(i => this._buildItemHTML(i)).join('');
      this._bindItemEvents(list);
    }

    if (totalEl) totalEl.textContent = window.utils.formatPrice(this.getTotal());

    const lang2 = window.utils.getCurrentLang();
    const drawerTitle = document.getElementById('cart-drawer-title');
    if (drawerTitle) drawerTitle.textContent = lang2 === 'en' ? 'Shopping Cart' : 'سلة التسوق';
    const totalLabel = document.getElementById('cart-drawer-total-label');
    if (totalLabel) totalLabel.textContent = lang2 === 'en' ? 'Total:' : 'الإجمالي:';
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (checkoutBtn) checkoutBtn.textContent = lang2 === 'en' ? 'Proceed to Checkout' : 'متابعة للدفع';
  },

  renderCartPage() {
    const container = document.getElementById('cart-page-list');
    const totalEl = document.getElementById('cart-page-total');
    if (!container) return;
    const items = this.getItems();
    const lang = window.utils.getCurrentLang();

    if (items.length === 0) {
      const emptyMsg = lang === 'en' ? 'Your cart is empty. Browse our collections!' : 'سلة التسوق فارغة. تصفح مجموعاتنا!';
      const browseMsg = lang === 'en' ? 'Browse Products' : 'تصفح المنتجات';
      container.innerHTML = `
        <div class="cart-empty-state">
          <p>${emptyMsg}</p>
          <a href="#perfumes" class="btn btn-gold" style="margin-top:1.5rem;">${browseMsg}</a>
        </div>
      `;
      const summary = document.getElementById('cart-summary');
      if (summary) summary.style.display = 'none';
    } else {
      container.innerHTML = items.map(i => this._buildItemHTML(i)).join('');
      this._bindItemEvents(container);
      if (totalEl) totalEl.textContent = window.utils.formatPrice(this.getTotal());
      const summary = document.getElementById('cart-summary');
      if (summary) summary.style.display = 'block';
    }

    // Update static text for current lang
    const cartTitle = document.getElementById('cart-page-title');
    if (cartTitle) cartTitle.textContent = lang === 'en' ? 'Shopping Cart' : 'سلة التسوق';
    const summaryTitle = document.getElementById('cart-summary-title');
    if (summaryTitle) summaryTitle.textContent = lang === 'en' ? 'Order Summary' : 'ملخص الطلب';
    const totalLabel = document.getElementById('cart-page-total-label');
    if (totalLabel) totalLabel.textContent = lang === 'en' ? 'Total' : 'الإجمالي';
    const checkoutBtn = document.getElementById('cart-page-checkout-btn');
    if (checkoutBtn) checkoutBtn.textContent = lang === 'en' ? 'Proceed to Checkout' : 'متابعة للدفع';
  },

  openDrawer() {
    this.renderDrawer();
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay')?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    document.getElementById('cart-drawer')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('visible');
    document.body.style.overflow = '';
  },

  init() {
    this.updateBadge();

    document.addEventListener('cart:updated', () => {
      this.updateBadge();
      if (document.getElementById('cart-drawer')?.classList.contains('open')) {
        this.renderDrawer();
      }
      if (window.location.hash === '#cart') {
        this.renderCartPage();
      }
    });

    document.addEventListener('languageChanged', () => {
      this.updateBadge();
      if (document.getElementById('cart-drawer')?.classList.contains('open')) {
        this.renderDrawer();
      }
      if (window.location.hash === '#cart') {
        this.renderCartPage();
      }
    });

    document.getElementById('cart-icon-btn')?.addEventListener('click', () => this.openDrawer());
    document.getElementById('cart-overlay')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('cart-drawer-close')?.addEventListener('click', () => this.closeDrawer());

    document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
      this.closeDrawer();
      window.location.hash = '#checkout';
    });

    document.getElementById('cart-page-checkout-btn')?.addEventListener('click', () => {
      window.location.hash = '#checkout';
    });

    // Add to Cart button in product modal
    document.getElementById('modal-add-to-cart-btn')?.addEventListener('click', () => {
      const product = window.activeModalProduct;
      if (!product) return;
      const activeSizeBtn = document.querySelector('.size-btn.active');
      const size = activeSizeBtn ? activeSizeBtn.textContent.trim() : null;
      this.addItem(product, size);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => window.cart.init());
