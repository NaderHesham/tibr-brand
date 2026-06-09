/* utils.js — Shared helper functions */

window.utils = {
  parsePrice(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    const str = String(priceStr)
      .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[^0-9.]/g, '');
    return parseFloat(str) || 0;
  },

  formatPrice(amount) {
    const lang = this.getCurrentLang();
    const num = Number(amount) || 0;
    if (lang === 'en') return `${num.toLocaleString('en-EG')} EGP`;
    return `${num.toLocaleString('ar-EG')} ج.م`;
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('toast-show'));
    });
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  },

  truncateText(text, maxLen = 80) {
    if (!text || text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  },

  getCurrentLang() {
    return localStorage.getItem('robabikia-lang') || 'ar';
  }
};
