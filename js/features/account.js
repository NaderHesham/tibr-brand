/* account.js — Account Dashboard */

const lang = () => window.utils?.getCurrentLang() || 'ar';
const t = (ar, en) => lang() === 'en' ? en : ar;
const getSupabase = () => window.supabaseClient;

window.accountPage = {
  async load() {
    const container = document.getElementById('account-container');
    if (!container) return;

    container.innerHTML = `<div class="spinner"></div>`;

    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        window.location.hash = '#login';
        return;
      }

      const [profileRes, ordersRes, addressesRes] = await Promise.allSettled([
        window.apiClient.getProfile(),
        window.apiClient.getOrders(),
        window.apiClient.getAddresses()
      ]);

      const profile   = profileRes.status   === 'fulfilled' ? profileRes.value?.data ?? null : null;
      const orders    = ordersRes.status    === 'fulfilled'  ? ordersRes.value?.data  ?? []   : [];
      const addresses = addressesRes.status === 'fulfilled'  ? addressesRes.value?.data ?? [] : [];

      container.innerHTML = this._buildHTML(session.user, profile, Array.isArray(orders) ? orders : [], Array.isArray(addresses) ? addresses : []);
      this._bindEvents(profile);
    } catch (err) {
      console.error('[account] load failed:', err);
      container.innerHTML = `<p style="color:var(--beige-dim);text-align:center;padding:2rem;">${t('تعذر تحميل البيانات', 'Failed to load data')}</p>`;
    }
  },

  _getInitials(profile, user) {
    const name = profile?.full_name || user.email || '';
    return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '؟';
  },

  _statusBadge(status) {
    const map = {
      pending:   { ar: 'قيد الانتظار', en: 'Pending',   cls: 'status-pending' },
      confirmed: { ar: 'مؤكد',          en: 'Confirmed', cls: 'status-confirmed' },
      shipped:   { ar: 'تم الشحن',      en: 'Shipped',   cls: 'status-shipped' },
      delivered: { ar: 'تم التوصيل',    en: 'Delivered', cls: 'status-delivered' },
      cancelled: { ar: 'ملغي',          en: 'Cancelled', cls: 'status-cancelled' },
    };
    const s = map[status] || { ar: status, en: status, cls: '' };
    return `<span class="order-status-badge ${s.cls}">${t(s.ar, s.en)}</span>`;
  },

  _paymentLabel(method) {
    const map = {
      cash_on_delivery: { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery' },
      vodafone_cash: { ar: 'فودافون كاش', en: 'Vodafone Cash' },
      instapay: { ar: 'إنستاباي', en: 'InstaPay' }
    };
    const value = map[method] || { ar: method || '—', en: method || '—' };
    return t(value.ar, value.en);
  },

  _buildAddressesSection(addresses) {
    const cards = addresses.length === 0
      ? `<p class="account-empty-msg">${t('لا توجد عناوين محفوظة.', 'No saved addresses.')}</p>`
      : addresses.map(a => `
          <div class="address-card${a.is_default ? ' address-card--default' : ''}" data-id="${a.id}">
            <div class="address-card-header">
              <span class="address-card-label">${a.label || t('المنزل', 'Home')}</span>
              ${a.is_default
                ? `<span class="address-default-badge">${t('افتراضي', 'Default')}</span>`
                : `<button class="address-set-default-btn" data-id="${a.id}">${t('تعيين افتراضي', 'Set Default')}</button>`
              }
            </div>
            <div class="address-card-body">
              <p class="address-card-street">${a.street}</p>
              <p class="address-card-city">${a.city}</p>
              ${a.phone ? `<p class="address-card-phone">${a.phone}</p>` : ''}
            </div>
            <button class="address-delete-btn" data-id="${a.id}">${t('حذف', 'Delete')}</button>
          </div>
        `).join('');

    return `
      <div class="account-section glass-panel">
        <h3 class="account-section-title">${t('عناويني', 'My Addresses')}</h3>
        <div class="addresses-list" id="addresses-list">${cards}</div>

        <details class="add-address-details">
          <summary class="add-address-toggle">${t('+ إضافة عنوان جديد', '+ Add New Address')}</summary>
          <form id="add-address-form" class="add-address-form">
            <div class="form-row">
              <div class="form-field">
                <label>${t('التسمية', 'Label')}</label>
                <input type="text" id="addr-label" placeholder="${t('المنزل / العمل', 'Home / Work')}">
              </div>
              <div class="form-field">
                <label>${t('رقم الهاتف', 'Phone')}</label>
                <input type="tel" id="addr-phone" placeholder="01XXXXXXXXX">
              </div>
            </div>
            <div class="form-field">
              <label>${t('المدينة', 'City')} *</label>
              <input type="text" id="addr-city" required placeholder="${t('القاهرة، الإسكندرية...', 'Cairo, Alexandria...')}">
            </div>
            <div class="form-field">
              <label>${t('العنوان التفصيلي', 'Street Address')} *</label>
              <input type="text" id="addr-street" required placeholder="${t('الشارع، رقم المبنى، الشقة', 'Street, building, apartment')}">
            </div>
            <div class="form-field form-field--checkbox">
              <label>
                <input type="checkbox" id="addr-default">
                ${t('تعيين كعنوان افتراضي', 'Set as default address')}
              </label>
            </div>
            <button type="submit" class="btn btn-gold" id="add-address-btn">${t('حفظ العنوان', 'Save Address')}</button>
          </form>
        </details>
      </div>
    `;
  },

  _buildHTML(user, profile, orders, addresses) {
    const initials    = this._getInitials(profile, user);
    const displayName = profile?.full_name || user.email?.split('@')[0] || t('مستخدم', 'User');

    const ordersHTML = orders.length === 0
      ? `<p class="account-empty-msg">${t('لا توجد طلبات بعد.', 'No orders yet.')}</p>`
      : orders.slice(0, 10).map(o => {
          const product  = o.products;
          const prodName = product ? (lang() === 'en' ? product.en_name : product.ar_name) : '—';
          const date     = new Date(o.created_at).toLocaleDateString(lang() === 'ar' ? 'ar-EG' : 'en-EG');
          return `
            <div class="order-row">
              ${product?.image ? `<img src="${product.image}" alt="${prodName}" class="order-thumb">` : '<div class="order-thumb-placeholder"></div>'}
              <div class="order-row-info">
                <p class="order-product-name">${prodName}</p>
                ${o.size ? `<p class="order-size">${t('المقاس', 'Size')}: ${o.size}</p>` : ''}
                <p class="order-size">${t('الكمية', 'Qty')}: ${o.qty || 1}</p>
                <p class="order-size">${t('الدفع', 'Payment')}: ${this._paymentLabel(o.payment_method)}</p>
                <p class="order-date">${date}</p>
              </div>
              ${this._statusBadge(o.status)}
            </div>
          `;
        }).join('');

    return `
      <div class="account-profile-card glass-panel">
        <div class="account-avatar">${initials}</div>
        <div class="account-profile-info">
          <h2 class="account-display-name">${displayName}</h2>
          <p class="account-email">${user.email}</p>
        </div>
        <div class="account-stats">
          <div class="stat-chip">
            <span class="stat-num">${orders.length}</span>
            <span class="stat-lbl">${t('طلب', 'Orders')}</span>
          </div>
          <div class="stat-chip">
            <span class="stat-num">${window.wishlist?.getCount() || 0}</span>
            <span class="stat-lbl">${t('مفضلة', 'Wishlist')}</span>
          </div>
        </div>
      </div>

      <div class="account-nav-grid">
        <a href="#wishlist" class="account-nav-card glass-panel">
          <span class="account-nav-icon">♥</span>
          <span>${t('مفضلتي', 'My Wishlist')}</span>
        </a>
        <button class="account-nav-card glass-panel" id="account-logout-btn">
          <span class="account-nav-icon">↩</span>
          <span>${t('تسجيل الخروج', 'Logout')}</span>
        </button>
      </div>

      <div class="account-section glass-panel">
        <h3 class="account-section-title">${t('بياناتي الشخصية', 'My Profile')}</h3>
        <form id="profile-edit-form">
          <div class="form-field">
            <label>${t('الاسم الكامل', 'Full Name')}</label>
            <input type="text" id="edit-full-name" value="${profile?.full_name || ''}" placeholder="${t('أدخل اسمك', 'Enter your name')}">
          </div>
          <div class="form-field">
            <label>${t('رقم الهاتف', 'Phone Number')}</label>
            <input type="tel" id="edit-phone" value="${profile?.phone_number || ''}" placeholder="01XXXXXXXXX">
          </div>
          <button type="submit" class="btn btn-gold" id="profile-save-btn">${t('حفظ البيانات', 'Save Profile')}</button>
        </form>
      </div>

      ${this._buildAddressesSection(addresses)}

      <div class="account-section glass-panel">
        <h3 class="account-section-title">${t('طلباتي', 'My Orders')}</h3>
        <div class="orders-list">${ordersHTML}</div>
      </div>
    `;
  },

  _bindEvents(profile) {
    document.getElementById('account-logout-btn')?.addEventListener('click', async () => {
      await getSupabase().auth.signOut();
      window.utils?.showToast(t('تم تسجيل الخروج', 'Logged out'), 'success');
      window.location.hash = '#home';
    });

    document.getElementById('profile-edit-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const saveBtn = document.getElementById('profile-save-btn');
      saveBtn.disabled = true;
      saveBtn.textContent = t('جارٍ الحفظ...', 'Saving...');

      try {
        await window.apiClient.updateProfile({
          full_name:    document.getElementById('edit-full-name')?.value?.trim(),
          phone_number: document.getElementById('edit-phone')?.value?.trim()
        });
        window.utils?.showToast(t('تم حفظ البيانات ✓', 'Profile saved ✓'), 'success');
      } catch (err) {
        window.utils?.showToast(err.message || t('فشل الحفظ', 'Save failed'), 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = t('حفظ البيانات', 'Save Profile');
      }
    });

    document.getElementById('add-address-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('add-address-btn');
      btn.disabled = true;
      btn.textContent = t('جارٍ الحفظ...', 'Saving...');

      try {
        await window.apiClient.addAddress({
          label:      document.getElementById('addr-label')?.value?.trim() || t('المنزل', 'Home'),
          city:       document.getElementById('addr-city')?.value?.trim(),
          street:     document.getElementById('addr-street')?.value?.trim(),
          phone:      document.getElementById('addr-phone')?.value?.trim() || null,
          is_default: document.getElementById('addr-default')?.checked || false
        });
        window.utils?.showToast(t('تم حفظ العنوان ✓', 'Address saved ✓'), 'success');
        this.load();
      } catch (err) {
        window.utils?.showToast(err.message || t('فشل حفظ العنوان', 'Failed to save address'), 'error');
        btn.disabled = false;
        btn.textContent = t('حفظ العنوان', 'Save Address');
      }
    });

    document.getElementById('addresses-list')?.addEventListener('click', async e => {
      const deleteBtn  = e.target.closest('.address-delete-btn');
      const defaultBtn = e.target.closest('.address-set-default-btn');

      if (deleteBtn) {
        if (!confirm(t('هل تريد حذف هذا العنوان؟', 'Delete this address?'))) return;
        try {
          await window.apiClient.deleteAddress(deleteBtn.dataset.id);
          window.utils?.showToast(t('تم حذف العنوان', 'Address deleted'), 'success');
          this.load();
        } catch (err) {
          window.utils?.showToast(err.message || t('فشل الحذف', 'Delete failed'), 'error');
        }
      }

      if (defaultBtn) {
        try {
          await window.apiClient.setDefaultAddress(defaultBtn.dataset.id);
          window.utils?.showToast(t('تم تعيين العنوان الافتراضي ✓', 'Default address set ✓'), 'success');
          this.load();
        } catch (err) {
          window.utils?.showToast(err.message || t('فشل التحديث', 'Update failed'), 'error');
        }
      }
    });
  }
};
