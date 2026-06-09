const adminLang = () => window.utils?.getCurrentLang() || 'ar';
const adminT = (ar, en) => adminLang() === 'en' ? en : ar;

window.adminPage = {
  async load() {
    const container = document.getElementById('admin-dashboard-container');
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
      const [{ data: profile }, { data: orders }] = await Promise.all([
        window.apiClient.getProfile(),
        window.apiClient.getAdminOrders()
      ]);

      if (profile?.role !== 'admin') {
        window.location.hash = '#account';
        return;
      }

      container.innerHTML = this._buildHTML(Array.isArray(orders) ? orders : []);
      this._bindEvents();
    } catch (err) {
      console.error('[admin] load failed:', err);
      container.innerHTML = `<p class="account-empty-msg">${adminT('تعذر تحميل لوحة التحكم.', 'Failed to load admin dashboard.')}</p>`;
    }
  },

  _statusOptions(currentStatus) {
    const statuses = [
      { value: 'pending', ar: 'قيد الانتظار', en: 'Pending' },
      { value: 'confirmed', ar: 'مؤكد', en: 'Confirmed' },
      { value: 'shipped', ar: 'تم الشحن', en: 'Shipped' },
      { value: 'delivered', ar: 'تم التوصيل', en: 'Delivered' },
      { value: 'cancelled', ar: 'ملغي', en: 'Cancelled' }
    ];

    return `
      <select class="admin-order-status-select" data-role="status-select">
        ${statuses.map((status) => `
          <option value="${status.value}" ${status.value === currentStatus ? 'selected' : ''}>
            ${adminT(status.ar, status.en)}
          </option>
        `).join('')}
      </select>
    `;
  },

  _orderCard(order) {
    const productName = order.products
      ? (adminLang() === 'en' ? order.products.en_name : order.products.ar_name)
      : order.product_id;
    const orderDate = new Date(order.created_at).toLocaleString(adminLang() === 'ar' ? 'ar-EG' : 'en-EG');
    const total = order.order_total
      ? window.utils?.formatPrice(order.order_total)
      : (order.products ? (adminLang() === 'en' ? order.products.en_price : order.products.ar_price) : '—');

    return `
      <div class="glass-panel admin-order-card" data-order-id="${order.id}">
        <div class="admin-order-head">
          <div>
            <h3 class="admin-order-title">${productName}</h3>
            <p class="admin-order-subtitle">${adminT('الطلب', 'Order')} #${order.id.slice(0, 8)}</p>
          </div>
          <span class="order-status-badge status-${order.status}">${order.status}</span>
        </div>

        <div class="admin-order-grid">
          <div class="admin-order-meta">
            <p><strong>${adminT('العميل', 'Customer')}:</strong> ${order.customer_name || '—'}</p>
            <p><strong>${adminT('الهاتف', 'Phone')}:</strong> ${order.customer_phone || '—'}</p>
            <p><strong>${adminT('العنوان', 'Address')}:</strong> ${order.customer_address || '—'}</p>
            <p><strong>${adminT('المقاس', 'Size')}:</strong> ${order.size || '—'}</p>
          </div>
          <div class="admin-order-meta">
            <p><strong>${adminT('الكمية', 'Qty')}:</strong> ${order.qty || 1}</p>
            <p><strong>${adminT('الدفع', 'Payment')}:</strong> ${order.payment_method || 'cash_on_delivery'}</p>
            <p><strong>${adminT('الإجمالي', 'Total')}:</strong> ${total || '—'}</p>
            <p><strong>${adminT('التاريخ', 'Date')}:</strong> ${orderDate}</p>
          </div>
        </div>

        <div class="admin-order-actions">
          ${this._statusOptions(order.status)}
          <button class="btn btn-gold admin-order-save-btn" data-role="save-status">
            ${adminT('حفظ الحالة', 'Save Status')}
          </button>
        </div>
      </div>
    `;
  },

  _buildHTML(orders) {
    return `
      <div class="account-profile-card glass-panel">
        <div class="account-profile-info">
          <h2 class="account-display-name">${adminT('لوحة تحكم الطلبات', 'Orders Dashboard')}</h2>
          <p class="account-email">${adminT('عرض جميع طلبات العملاء وإدارتها', 'View and manage all customer orders')}</p>
        </div>
        <div class="account-stats">
          <div class="stat-chip">
            <span class="stat-num">${orders.length}</span>
            <span class="stat-lbl">${adminT('إجمالي الطلبات', 'Total Orders')}</span>
          </div>
        </div>
      </div>

      <div class="account-nav-grid">
        <button class="account-nav-card glass-panel" id="admin-open-product-modal">
          <span class="account-nav-icon">＋</span>
          <span>${adminT('إضافة منتج', 'Add Product')}</span>
        </button>
        <a href="#account" class="account-nav-card glass-panel">
          <span class="account-nav-icon">👤</span>
          <span>${adminT('حسابي', 'My Account')}</span>
        </a>
      </div>

      <div class="account-section glass-panel">
        <h3 class="account-section-title">${adminT('الطلبات الواردة', 'Incoming Orders')}</h3>
        <div class="admin-orders-list">
          ${orders.length
            ? orders.map((order) => this._orderCard(order)).join('')
            : `<p class="account-empty-msg">${adminT('لا توجد طلبات حتى الآن.', 'No orders yet.')}</p>`}
        </div>
      </div>
    `;
  },

  _bindEvents() {
    document.getElementById('admin-open-product-modal')?.addEventListener('click', () => {
      const adminModal = document.getElementById('admin-modal');
      if (!adminModal) return;
      adminModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    document.getElementById('admin-dashboard-container')?.addEventListener('click', async (event) => {
      const saveBtn = event.target.closest('[data-role="save-status"]');
      if (!saveBtn) return;

      const card = saveBtn.closest('[data-order-id]');
      const orderId = card?.getAttribute('data-order-id');
      const statusSelect = card?.querySelector('[data-role="status-select"]');
      if (!orderId || !statusSelect) return;

      saveBtn.disabled = true;
      saveBtn.textContent = adminT('جارٍ الحفظ...', 'Saving...');

      try {
        await window.apiClient.updateAdminOrder(orderId, { status: statusSelect.value });
        window.utils?.showToast(adminT('تم تحديث حالة الطلب ✓', 'Order status updated ✓'), 'success');
        await this.load();
      } catch (err) {
        window.utils?.showToast(err.message || adminT('فشل تحديث الحالة', 'Failed to update status'), 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = adminT('حفظ الحالة', 'Save Status');
      }
    });
  }
};
