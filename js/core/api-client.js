window.apiClient = {
  async request(path, options = {}) {
    const config = {
      method: options.method || "GET",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    };

    if (options.auth) {
      const {
        data: { session }
      } = await window.supabaseClient.auth.getSession();

      if (!session?.access_token) {
        throw new Error("يرجى تسجيل الدخول أولاً.");
      }

      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(path, config);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "حدث خطأ أثناء تنفيذ الطلب.");
    }

    return payload;
  },

  async getProducts() {
    // Public catalog read straight from Supabase, so the storefront works
    // whether or not the Node/Express backend (/api) is running.
    const { data, error } = await window.supabaseClient
      .from("products")
      .select("*");
    if (error) throw new Error(error.message);
    return { data: data || [] };
  },

  getProfile() {
    return this.request("/api/profile", { auth: true });
  },

  updateProfile(profile) {
    return this.request("/api/profile", {
      method: "PUT",
      auth: true,
      body: profile
    });
  },

  getOrders() {
    return this.request("/api/orders", { auth: true });
  },

  getAdminOrders() {
    return this.request("/api/admin/orders", { auth: true });
  },

  updateAdminOrder(orderId, payload) {
    return this.request(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      auth: true,
      body: payload
    });
  },

  getAddresses() {
    return this.request("/api/profile/addresses", { auth: true });
  },

  addAddress(address) {
    return this.request("/api/profile/addresses", {
      method: "POST",
      auth: true,
      body: address
    });
  },

  deleteAddress(addressId) {
    return this.request(`/api/profile/addresses/${addressId}`, {
      method: "DELETE",
      auth: true
    });
  },

  setDefaultAddress(addressId) {
    return this.request(`/api/profile/addresses/${addressId}/default`, {
      method: "PUT",
      auth: true
    });
  },

  createOrder(order) {
    return this.request("/api/orders", {
      method: "POST",
      auth: true,
      body: order
    });
  },

  submitCheckout(checkout) {
    return this.request("/api/checkout", {
      method: "POST",
      auth: true,
      body: checkout
    });
  },

  getReviews(productId) {
    return this.request(`/api/products/${productId}/reviews`);
  },

  submitReview(productId, review) {
    return this.request(`/api/products/${productId}/reviews`, {
      method: "POST",
      auth: true,
      body: review
    });
  },

  createProduct(product) {
    return this.request("/api/products", {
      method: "POST",
      auth: true,
      body: product
    });
  }
};
