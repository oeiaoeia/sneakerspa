// ============================================================================
// Sneaker Spa REST API Client
// Handles authentication headers, JWT persistence, and backend calls.
// ============================================================================

const API = {
  TOKEN_KEY: "sneakerspa_jwt_token",
  USER_KEY: "sneakerspa_user_data",

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  },

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async request(path, options = {}) {
    const headers = options.headers || {};
    const token = this.getToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(path, config);

      if (response.status === 401) {
        // Token expired or unauthorized
        this.setToken(null);
        this.setUser(null);
        window.dispatchEvent(new CustomEvent("auth-changed", { detail: { authenticated: false } }));
      }

      if (!response.ok) {
        let errMessage = `Request failed: ${response.status}`;
        try {
          const errData = await response.json();
          errMessage = errData.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error("API error:", err);
      throw err;
    }
  },

  // Auth Endpoints
  async login(email, password) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    this.setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { authenticated: true, user: this.getUser() } }));
    return res;
  },

  async register(name, email, password) {
    const res = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.token);
    this.setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { authenticated: true, user: this.getUser() } }));
    return res;
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { authenticated: false } }));
  },

  async getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    try {
      const res = await this.request("/api/auth/me");
      this.setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      return res;
    } catch {
      return null;
    }
  },

  // Services & Addons
  async getServices() {
    return await this.request("/api/services");
  },

  async getService(id) {
    return await this.request(`/api/services/${id}`);
  },

  async compareServices(id1, id2) {
    return await this.request(`/api/services/compare?first=${encodeURIComponent(id1)}&second=${encodeURIComponent(id2)}`);
  },

  async getAddOns() {
    return await this.request("/api/addons");
  },

  // Orders
  async calculatePrice(payload) {
    return await this.request("/api/orders/calculate-price", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createOrder(orderData) {
    return await this.request("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async getActiveOrders() {
    return await this.request("/api/orders/active");
  },

  async getPastOrders() {
    return await this.request("/api/orders/past");
  },

  async getOrder(trackingNumber) {
    return await this.request(`/api/orders/${trackingNumber}`);
  },

  async rateOrder(trackingNumber, rating) {
    return await this.request(`/api/orders/${trackingNumber}/rate`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    });
  },

  async uploadPhoto(file, slotNumber, slotLabel) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slotNumber", slotNumber);
    formData.append("slotLabel", slotLabel);

    return await this.request("/api/orders/upload-photo", {
      method: "POST",
      body: formData,
    });
  },

  async uploadOrderPhoto(orderId, angle, file) {
    const formData = new FormData();
    formData.append("file", file);
    return await this.request(`/api/orders/${encodeURIComponent(orderId)}/photos/${encodeURIComponent(angle)}`, {
      method: "POST",
      body: formData,
    });
  },

  // Profile & Addresses
  async getProfile() {
    return await this.request("/api/user/profile");
  },

  async updateProfile(profileData) {
    return await this.request("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  async getAddresses() {
    return await this.request("/api/user/addresses");
  },

  async addAddress(addr) {
    return await this.request("/api/user/addresses", {
      method: "POST",
      body: JSON.stringify(addr),
    });
  },

  async updateAddress(id, addr) {
    return await this.request(`/api/user/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(addr),
    });
  },

  async deleteAddress(id) {
    return await this.request(`/api/user/addresses/${id}`, {
      method: "DELETE",
    });
  },

  async setDefaultAddress(id) {
    return await this.request(`/api/user/addresses/${id}/default`, {
      method: "POST",
    });
  },

  async toggleSubscription() {
    return await this.request("/api/user/subscription/toggle", {
      method: "POST",
    });
  },

  // Reviews
  async getReviews() {
    return await this.request("/api/reviews");
  },

  async toggleHelpful(reviewId) {
    return await this.request(`/api/reviews/${reviewId}/helpful`, {
      method: "POST",
    });
  },

  // Admin
  async getAdminOrders() {
    return await this.request("/api/admin/orders");
  },

  async updateAdminOrderStatus(trackingNumber, newStatus, notes) {
    return await this.request(`/api/admin/orders/${trackingNumber}/status`, {
      method: "POST",
      body: JSON.stringify({ newStatus, notes }),
    });
  },
};
