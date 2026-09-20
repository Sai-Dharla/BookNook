/**
 * BookNook Account Dashboard Controller
 * Manages:
 * - Profile display and in-place editing (Name, Email, Phone)
 * - Tab switching: Orders, Wishlist, Addresses, Profile, Settings
 * - Real simulated Orders list with line items, total, and status
 * - Order Tracking modal & interactive progress bar stepper:
 *   (Order Placed -> Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered)
 * - Saved Addresses CRUD (Add new address, edit address, delete, set default)
 * - Wishlist viewing, real-time item removal, and "Move to Cart" action
 * - Safe simulated user logout
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const AccountController = {
  currentTab: 'orders',

  init() {
    this.checkAuthOrFallback();
    this.renderUserInfo();
    this.parseHashOrURL();
    this.bindTabs();
    this.bindAddressForm();
    this.bindProfileForm();
    this.bindLogout();
  },

  checkAuthOrFallback() {
    let session = Storage.get(STORAGE_KEYS.SESSION);
    if (!session || !session.isLoggedIn) {
      // Default to Dharla SaiBabu demo account if browsing account
      session = {
        name: 'Dharla SaiBabu',
        email: 'saibabu@dataalpha.com',
        phone: '+91 98765 43210',
        isLoggedIn: true
      };
      Storage.set(STORAGE_KEYS.SESSION, session);
    }
  },

  renderUserInfo() {
    const session = Storage.get(STORAGE_KEYS.SESSION, { name: 'Dharla SaiBabu', email: 'saibabu@dataalpha.com' });
    const nameEl = document.getElementById('account-user-name');
    const emailEl = document.getElementById('account-user-email');
    const avatarEl = document.getElementById('account-user-avatar');

    if (nameEl) nameEl.textContent = session.name;
    if (emailEl) emailEl.textContent = session.email;
    if (avatarEl) avatarEl.textContent = session.name.charAt(0).toUpperCase();

    // Populate profile form fields
    const profName = document.getElementById('profile-name');
    const profEmail = document.getElementById('profile-email');
    const profPhone = document.getElementById('profile-phone');
    if (profName) profName.value = session.name || '';
    if (profEmail) profEmail.value = session.email || '';
    if (profPhone) profPhone.value = session.phone || '';
  },

  parseHashOrURL() {
    const hash = window.location.hash.replace('#', '');
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('track')) {
      this.switchTab('orders');
      setTimeout(() => {
        this.openOrderTracking(urlParams.get('track'));
      }, 200);
      return;
    }

    if (['orders', 'wishlist', 'addresses', 'profile', 'settings'].includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('orders');
    }
  },

  bindTabs() {
    document.querySelectorAll('.account-tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update active tab button
    document.querySelectorAll('.account-tab-btn[data-tab]').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update tab view panels
    document.querySelectorAll('.account-tab-panel').forEach(panel => {
      panel.style.display = 'none';
    });

    const activePanel = document.getElementById(`tab-panel-${tabName}`);
    if (activePanel) {
      activePanel.style.display = 'block';
    }

    // Refresh content for selected tab
    if (tabName === 'orders') this.renderOrders();
    if (tabName === 'wishlist') this.renderWishlist();
    if (tabName === 'addresses') this.renderAddresses();
  },

  // -------------------------------------------------------------
  // ORDERS & PROGRESS TRACKER
  // -------------------------------------------------------------
  renderOrders() {
    const ordersContainer = document.getElementById('orders-list-container');
    if (!ordersContainer) return;

    const orders = Storage.get(STORAGE_KEYS.ORDERS, []);

    if (!orders || orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-state" style="padding: 3rem 1rem;">
          <div class="empty-state-icon"><i class="fa-solid fa-box-archive"></i></div>
          <h3>No Orders Recorded Yet</h3>
          <p>You have not placed any orders yet. Discover timeless books and fine writing goods.</p>
          <a href="products.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-compass"></i> Start Browsing</a>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <strong style="color:var(--color-primary-dark); font-size:1.05rem;">Order #${order.id}</strong>
            <span style="font-size:0.85rem; color:var(--color-muted); margin-left:0.75rem;">Placed on ${order.date}</span>
          </div>
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <span class="order-badge">${order.status}</span>
            <strong style="font-size:1.1rem; color:var(--color-charcoal);">₹${order.total}</strong>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; margin:1.25rem 0;">
          ${order.items.map(item => `
            <div style="display:flex; align-items:center; gap:0.75rem; background:var(--color-cream); padding:0.6rem 0.85rem; border-radius:var(--radius-sm);">
              <img src="${item.coverImage}" alt="${item.title}" style="width:36px; height:48px; object-fit:contain; border-radius:2px;">
              <div>
                <span style="font-weight:600; font-size:0.85rem; display:block; max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</span>
                <span style="font-size:0.78rem; color:var(--color-muted);">Qty: ${item.quantity} × ₹${item.price}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; padding-top:0.85rem; border-top:1px solid var(--color-border-light);">
          <div style="font-size:0.85rem; color:var(--color-muted);">
            <i class="fa-solid fa-location-dot"></i> Ship to: <strong>${order.shippingAddress ? order.shippingAddress.name : 'Recipient'}</strong> (${order.shippingAddress ? order.shippingAddress.city : 'India'})
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="AccountController.openOrderTracking('${order.id}')">
            <i class="fa-solid fa-truck-fast"></i> Track Live Status
          </button>
        </div>
      </div>
    `).join('');
  },

  openOrderTracking(orderId) {
    const orders = Storage.get(STORAGE_KEYS.ORDERS, []);
    const order = orders.find(o => o.id === orderId) || orders[0];
    if (!order) return;

    const modal = document.getElementById('tracking-modal');
    const modalContent = document.getElementById('tracking-modal-content');
    if (!modal || !modalContent) return;

    const stages = [
      { key: "Order Placed", label: "Order Placed", icon: "fa-cart-shopping" },
      { key: "Confirmed", label: "Confirmed", icon: "fa-file-invoice" },
      { key: "Packed", label: "Packed in Cedar Box", icon: "fa-box-open" },
      { key: "Shipped", label: "Shipped & Transit", icon: "fa-truck-fast" },
      { key: "Out for Delivery", label: "Out for Delivery", icon: "fa-motorcycle" },
      { key: "Delivered", label: "Delivered", icon: "fa-house-chimney-check" }
    ];

    // Determine current stage index
    let currentIdx = stages.findIndex(s => s.key.toLowerCase() === (order.status || '').toLowerCase());
    if (currentIdx === -1) currentIdx = 3; // Default to 'Shipped' if dynamic

    modalContent.innerHTML = `
      <div style="padding: 1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <span class="section-tag" style="margin-bottom:0.4rem;">Live Dispatch Telemetry</span>
            <h3 style="font-size:1.5rem;">Order #${order.id}</h3>
            <p style="font-size:0.85rem; color:var(--color-muted);">Destination: ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="AccountController.closeTrackingModal()">
            <i class="fa-solid fa-xmark"></i> Close
          </button>
        </div>

        <!-- Visual Stepper Progress -->
        <div class="tracking-stepper">
          ${stages.map((stage, idx) => {
            let statusClass = '';
            if (idx < currentIdx) statusClass = 'completed';
            else if (idx === currentIdx) statusClass = 'current';

            return `
              <div class="step-node ${statusClass}">
                <div class="step-node-icon">
                  <i class="fa-solid ${stage.icon}"></i>
                </div>
                <div class="step-node-label">${stage.label}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="background:var(--color-cream); border-radius:var(--radius-md); padding:1rem 1.25rem; font-size:0.85rem; margin-top:2rem;">
          <p><i class="fa-solid fa-circle-info text-forest"></i> Simulated tracking telemetry: BookNook Express Courier partner is handling parcel handover with moisture-shield archival bubble wrap.</p>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  },

  closeTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) modal.style.display = 'none';
  },

  // -------------------------------------------------------------
  // WISHLIST TAB
  // -------------------------------------------------------------
  renderWishlist() {
    const wishlistContainer = document.getElementById('wishlist-grid-container');
    if (!wishlistContainer) return;

    const wishlist = Storage.get(STORAGE_KEYS.WISHLIST, []);

    if (!wishlist || wishlist.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-state" style="padding: 3rem 1rem; grid-column: 1 / -1;">
          <div class="empty-state-icon" style="color:var(--color-wishlist-red);"><i class="fa-regular fa-heart"></i></div>
          <h3>Your Wishlist is Waiting for Stories</h3>
          <p>Click the heart icon on any book or stationery piece to save it here for later reading.</p>
          <a href="products.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-book"></i> Discover Books</a>
        </div>
      `;
      return;
    }

    wishlistContainer.innerHTML = wishlist.map(id => {
      const p = BookNookDB.getById(id);
      if (!p) return '';
      return `
        <article class="product-card">
          <div class="card-media-wrap">
            <button type="button" class="card-wishlist-btn active" data-wishlist-id="${p.id}" onclick="BookNookApp.toggleWishlist('${p.id}', this)" title="Remove from Wishlist">
              <i class="fa-solid fa-heart" style="color: #E63946;"></i>
            </button>
            <a href="product-detail.html?id=${p.id}">
              <img src="${p.coverImage}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'">
            </a>
          </div>

          <div class="card-body">
            <span class="card-category">${p.category}</span>
            <h4 class="card-title"><a href="product-detail.html?id=${p.id}">${p.title}</a></h4>
            <p class="card-author">by ${p.author}</p>
            <div class="card-price-row">
              <span class="current-price">₹${p.price}</span>
            </div>
            <button type="button" class="btn btn-primary btn-block btn-sm" onclick="BookNookApp.addToCart('${p.id}', 1)">
              <i class="fa-solid fa-bag-shopping"></i> Move to Cart
            </button>
          </div>
        </article>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // SAVED ADDRESSES TAB
  // -------------------------------------------------------------
  renderAddresses() {
    const container = document.getElementById('addresses-list-container');
    if (!container) return;

    const addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);

    container.innerHTML = addresses.map(addr => `
      <div style="border:1.5px solid ${addr.isDefault ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius:var(--radius-md); padding:1.25rem 1.5rem; background:var(--color-white); position:relative; box-shadow:var(--shadow-sm);">
        ${addr.isDefault ? '<span class="badge badge-new" style="margin-bottom:0.6rem; display:inline-block;">Default Shipping Address</span>' : ''}
        <h4 style="margin-bottom:0.25rem;">${addr.name}</h4>
        <p style="font-size:0.9rem; color:var(--color-body);">${addr.street}</p>
        <p style="font-size:0.9rem; color:var(--color-body);">${addr.city}, ${addr.state} - ${addr.zip}</p>
        <p style="font-size:0.85rem; color:var(--color-muted); margin-top:0.4rem;"><i class="fa-solid fa-phone"></i> ${addr.phone}</p>

        <div style="display:flex; gap:0.75rem; margin-top:1rem; border-top:1px solid var(--color-border-light); padding-top:0.75rem;">
          ${!addr.isDefault ? `<button type="button" class="btn btn-secondary btn-sm" onclick="AccountController.setDefaultAddress('${addr.id}')">Set as Default</button>` : ''}
          <button type="button" class="btn btn-outline btn-sm" style="color:var(--color-error); border-color:var(--color-error);" onclick="AccountController.deleteAddress('${addr.id}')">
            <i class="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  },

  setDefaultAddress(id) {
    let addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);
    addresses.forEach(a => a.isDefault = (a.id === id));
    Storage.set(STORAGE_KEYS.ADDRESSES, addresses);
    this.renderAddresses();
    BookNookApp.showToast('Default address updated.', 'success');
  },

  deleteAddress(id) {
    let addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);
    if (addresses.length <= 1) {
      BookNookApp.showToast('You must maintain at least one shipping address.', 'error');
      return;
    }
    addresses = addresses.filter(a => a.id !== id);
    Storage.set(STORAGE_KEYS.ADDRESSES, addresses);
    this.renderAddresses();
    BookNookApp.showToast('Address removed.', 'info');
  },

  bindAddressForm() {
    const form = document.getElementById('add-address-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('addr-name').value.trim();
      const phone = document.getElementById('addr-phone').value.trim();
      const street = document.getElementById('addr-street').value.trim();
      const city = document.getElementById('addr-city').value.trim();
      const state = document.getElementById('addr-state').value.trim();
      const zip = document.getElementById('addr-zip').value.trim();

      if (!name || !phone || !street || !city || !state || !zip) {
        BookNookApp.showToast('Please fill out all address fields.', 'error');
        return;
      }

      let addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);
      addresses.push({
        id: `ADDR-${Date.now()}`,
        name, phone, street, city, state, zip,
        isDefault: addresses.length === 0
      });

      Storage.set(STORAGE_KEYS.ADDRESSES, addresses);
      this.renderAddresses();
      form.reset();
      BookNookApp.showToast('New shipping address saved!', 'success');
    });
  },

  // -------------------------------------------------------------
  // PROFILE UPDATE & LOGOUT
  // -------------------------------------------------------------
  bindProfileForm() {
    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profile-name').value.trim();
      const email = document.getElementById('profile-email').value.trim();
      const phone = document.getElementById('profile-phone').value.trim();

      if (!name || !email) {
        BookNookApp.showToast('Name and email are required.', 'error');
        return;
      }

      const session = Storage.get(STORAGE_KEYS.SESSION, {});
      session.name = name;
      session.email = email;
      session.phone = phone;

      Storage.set(STORAGE_KEYS.SESSION, session);
      this.renderUserInfo();
      BookNookApp.showToast('Profile information successfully saved!', 'success');
    });
  },

  bindLogout() {
    const logoutBtn = document.getElementById('account-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you wish to sign out of BookNook?')) {
          Storage.remove(STORAGE_KEYS.SESSION);
          BookNookApp.showToast('Signed out. See you again!', 'info');
          setTimeout(() => window.location.href = 'login.html', 800);
        }
      });
    }
  }
};

// Expose global helper for wishlist render callback
function renderAccountWishlist() {
  if (AccountController.currentTab === 'wishlist') {
    AccountController.renderWishlist();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  AccountController.init();
});

