/* search.js — Search Page with Debounce + Filter Sidebar */

window.searchPage = {
  debounceTimer: null,
  query: '',
  activeCategories: new Set(),
  activeGenders: new Set(),

  init() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', e => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.query = e.target.value.trim().toLowerCase();
        this.render();
      }, 300);
    });

    document.querySelectorAll('.filter-category').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.checked ? this.activeCategories.add(cb.value) : this.activeCategories.delete(cb.value);
        this.render();
      });
    });

    document.querySelectorAll('.filter-gender').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.checked ? this.activeGenders.add(cb.value) : this.activeGenders.delete(cb.value);
        this.render();
      });
    });

    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
      this.activeCategories.clear();
      this.activeGenders.clear();
      document.querySelectorAll('.filter-category, .filter-gender').forEach(cb => cb.checked = false);
      this.render();
    });

    // Re-render when language changes
    document.addEventListener('languageChanged', () => this.render());
    // Re-render when products load from Supabase
    document.addEventListener('productsLoaded', () => this.render());

    this.render();
  },

  focus() {
    document.getElementById('search-input')?.focus();
  },

  _getFiltered() {
    const products = window.catalogProducts || [];
    const q = this.query;
    return products.filter(p => {
      const matchesQuery = !q ||
        p.ar.name?.toLowerCase().includes(q) ||
        p.en.name?.toLowerCase().includes(q) ||
        p.ar.shortDesc?.toLowerCase().includes(q) ||
        p.en.shortDesc?.toLowerCase().includes(q);

      const matchesCategory = this.activeCategories.size === 0 || this.activeCategories.has(p.category);
      const matchesGender   = this.activeGenders.size   === 0 || this.activeGenders.has(p.gender);

      return matchesQuery && matchesCategory && matchesGender;
    });
  },

  render() {
    const container = document.getElementById('search-results');
    if (!container) return;

    const lang = window.utils?.getCurrentLang() || 'ar';
    const hasQuery  = !!this.query;
    const hasFilter = this.activeCategories.size > 0 || this.activeGenders.size > 0;

    if (!hasQuery && !hasFilter) {
      document.getElementById('search-result-count').textContent = '';
      container.innerHTML = `<div class="search-empty">
        <p>${lang === 'ar' ? 'ابدأ الكتابة للبحث في منتجاتنا' : 'Start typing to search our products'}</p>
      </div>`;
      return;
    }

    const results = this._getFiltered();
    const countEl = document.getElementById('search-result-count');
    if (countEl) {
      countEl.textContent = lang === 'ar' ? `${results.length} نتيجة` : `${results.length} results`;
    }

    if (results.length === 0) {
      container.innerHTML = `<div class="search-empty">
        <p>${lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
      </div>`;
      return;
    }

    const discoverText = lang === 'ar' ? 'اكتشف' : 'Discover';
    container.innerHTML = results.map(p => {
      const data = p[lang] || p.ar;
      const isWishlisted = window.wishlist?.has(p.id) ? 'active' : '';
      return `
        <div class="product-card" id="card-${p.id}" style="--accent-glow:${p.accentGlow || 'transparent'};">
          <div class="product-img-wrapper">
            <img src="${p.image}" alt="${data.name}" class="product-img">
            <button class="wishlist-btn ${isWishlisted}" data-id="${p.id}" aria-label="مفضلة" aria-pressed="${!!isWishlisted}">♥</button>
          </div>
          <div class="product-info">
            <span class="product-collection">${data.collection || ''}</span>
            <h3 class="product-title">${data.name}</h3>
            <p class="product-short-desc">${data.shortDesc || ''}</p>
            <div class="product-price">${data.price || ''}</div>
            <button class="product-card-btn" data-id="${p.id}">${discoverText}</button>
          </div>
        </div>
      `;
    }).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => window.searchPage.init());
