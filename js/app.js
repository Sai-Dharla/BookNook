/**
 * BookNook Core Application JavaScript
 * Manages:
 * - State synchronization (Cart, Wishlist, User session)
 * - Toast notification system
 * - Header badges & mobile navigation drawer
 * - Red-heart wishlist toggling with instant visual sync & persistence
 * - Global search redirection
 * - Newsletter subscription
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const STORAGE_KEYS = {
  CART: 'booknook_cart',
  WISHLIST: 'booknook_wishlist',
  USER: 'booknook_user',
  SESSION: 'booknook_session',
  ORDERS: 'booknook_orders',
  ADDRESSES: 'booknook_addresses',
  NEWSLETTER: 'booknook_newsletter'
};

// Safe LocalStorage Helpers
const Storage = {
  get: (key, fallback = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
    }
  }
};

// Global App Object
const BookNookApp = {
  // Initialize on every page load
  init() {
    this.seedDefaultDataIfNeeded();
    this.setupToastContainer();
    this.updateHeaderBadges();
    this.setupMobileNav();
    this.setupHeaderSearch();
    this.setupNewsletter();
    this.checkUserSession();
  },

  // Seed default addresses and demo orders if brand new user
  seedDefaultDataIfNeeded() {
    if (!Storage.get(STORAGE_KEYS.ADDRESSES)) {
      Storage.set(STORAGE_KEYS.ADDRESSES, [
        {
          id: "ADDR-1",
          name: "Dharla SaiBabu",
          phone: "+91 98765 43210",
          street: "42 Knowledge Avenue, Cyber Valley",
          city: "Hyderabad",
          state: "Telangana",
          zip: "500081",
          isDefault: true
        }
      ]);
    }

    if (!Storage.get(STORAGE_KEYS.ORDERS)) {
      Storage.set(STORAGE_KEYS.ORDERS, [
        {
          id: "BNK-2026-00125",
          date: "2026-09-18",
          items: [
            {
              id: "BNK-F-101",
              title: "The Midnight Library",
              price: 499,
              quantity: 1,
              coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80"
            },
            {
              id: "BNK-ST-404",
              title: "Vintage Brass Fountain Pen",
              price: 1250,
              quantity: 1,
              coverImage: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80"
            }
          ],
          subtotal: 1749,
          shipping: 0,
          discount: 0,
          giftWrap: 50,
          total: 1799,
          status: "Shipped",
          shippingAddress: {
            name: "Dharla SaiBabu",
            phone: "+91 98765 43210",
            street: "42 Knowledge Avenue, Cyber Valley",
            city: "Hyderabad",
            state: "Telangana",
            zip: "500081"
          },
          paymentMethod: "UPI"
        }
      ]);
    }
  },

  // Check user session
  checkUserSession() {
    const session = Storage.get(STORAGE_KEYS.SESSION);
    const userBtn = document.getElementById('header-user-btn');
    if (userBtn) {
      if (session && session.isLoggedIn) {
        userBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> <span class="d-none-sm">${session.name.split(' ')[0]}</span>`;
        userBtn.href = "account.html";
      } else {
        userBtn.innerHTML = `<i class="fa-regular fa-user"></i> <span class="d-none-sm">Login</span>`;
        userBtn.href = "login.html";
      }
    }
  },

  // Toast Notification System
  setupToastContainer() {
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-check';
    if (type === 'wishlist') iconClass = 'fa-solid fa-heart';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    container.appendChild(toast);

    // Animation trigger
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  },

  // Header badges update (Cart & Wishlist)
  updateHeaderBadges() {
    const cart = Storage.get(STORAGE_KEYS.CART, []);
    const wishlist = Storage.get(STORAGE_KEYS.WISHLIST, []);

    const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const wishlistCount = wishlist.length;

    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = cartCount;
      el.style.display = cartCount > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('.wishlist-badge-count').forEach(el => {
      el.textContent = wishlistCount;
      el.style.display = wishlistCount > 0 ? 'flex' : 'none';
    });
  },

  // -------------------------------------------------------------
  // WISHLIST FUNCTIONALITY - FULL IMPLEMENTATION & RED HEART SYNC
  // -------------------------------------------------------------
  isInWishlist(productId) {
    const wishlist = Storage.get(STORAGE_KEYS.WISHLIST, []);
    return wishlist.includes(productId);
  },

  toggleWishlist(productId, btnElement) {
    let wishlist = Storage.get(STORAGE_KEYS.WISHLIST, []);
    const exists = wishlist.includes(productId);
    const product = typeof BookNookDB !== 'undefined' ? BookNookDB.getById(productId) : null;
    const title = product ? product.title : 'Product';

    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
      Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
      this.showToast(`Removed "${title}" from Wishlist`, 'info');
    } else {
      wishlist.push(productId);
      Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
      this.showToast(`Added "${title}" to Wishlist ♥`, 'wishlist');
    }

    // Sync all button states on the active page
    this.syncWishlistButtons();
    this.updateHeaderBadges();

    // If on Account page / Wishlist tab, re-render
    if (typeof renderAccountWishlist === 'function') {
      renderAccountWishlist();
    }
  },

  syncWishlistButtons() {
    const wishlist = Storage.get(STORAGE_KEYS.WISHLIST, []);
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.getAttribute('data-wishlist-id');
      const icon = btn.querySelector('i');
      if (wishlist.includes(id)) {
        btn.classList.add('active');
        if (icon) {
          icon.className = 'fa-solid fa-heart';
          icon.style.color = '#E63946';
        }
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.className = 'fa-regular fa-heart';
          icon.style.color = '';
        }
      }
    });
  },

  // -------------------------------------------------------------
  // CART FUNCTIONALITY
  // -------------------------------------------------------------
  addToCart(productId, quantity = 1, showNotification = true) {
    let cart = Storage.get(STORAGE_KEYS.CART, []);
    const existingIndex = cart.findIndex(item => item.productId === productId);
    const product = typeof BookNookDB !== 'undefined' ? BookNookDB.getById(productId) : null;

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        productId: productId,
        quantity: quantity,
        dateAdded: new Date().toISOString()
      });
    }

    Storage.set(STORAGE_KEYS.CART, cart);
    this.updateHeaderBadges();

    if (showNotification) {
      const title = product ? product.title : 'Item';
      this.showToast(`"${title}" added to your cart!`, 'success');
    }
  },

  removeFromCart(productId) {
    let cart = Storage.get(STORAGE_KEYS.CART, []);
    cart = cart.filter(item => item.productId !== productId);
    Storage.set(STORAGE_KEYS.CART, cart);
    this.updateHeaderBadges();
  },

  updateCartQuantity(productId, quantity) {
    let cart = Storage.get(STORAGE_KEYS.CART, []);
    const item = cart.find(i => i.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        Storage.set(STORAGE_KEYS.CART, cart);
        this.updateHeaderBadges();
      }
    }
  },

  clearCart() {
    Storage.set(STORAGE_KEYS.CART, []);
    this.updateHeaderBadges();
  },

  // -------------------------------------------------------------
  // UI & NAVIGATION HELPERS
  // -------------------------------------------------------------
  setupMobileNav() {
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const overlay = document.querySelector('.drawer-overlay');
    const closeBtn = document.querySelector('.drawer-close-btn');

    if (!toggleBtn || !drawer || !overlay) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
  },

  setupHeaderSearch() {
    const forms = document.querySelectorAll('.search-form, .drawer-search-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[name="search"], .search-input');
        if (input && input.value.trim()) {
          const query = encodeURIComponent(input.value.trim());
          window.location.href = `products.html?search=${query}`;
        }
      });
    });
  },

  setupNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const email = input ? input.value.trim() : '';

      if (!email || !email.includes('@') || !email.includes('.')) {
        this.showToast('Please enter a valid email address.', 'error');
        return;
      }

      let subscribers = Storage.get(STORAGE_KEYS.NEWSLETTER, []);
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        Storage.set(STORAGE_KEYS.NEWSLETTER, subscribers);
      }

      this.showToast('Welcome to the BookNook Literary Circle! Check your inbox soon.', 'success');
      form.reset();
    });
  },

  // Helper to render product card HTML cleanly
  createProductCardHTML(product) {
    const isWishlisted = this.isInWishlist(product.id);
    const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="card-media-wrap">
          <div class="card-badges">
            ${product.isBestseller ? '<span class="badge badge-bestseller">Bestseller</span>' : ''}
            ${product.isNewArrival ? '<span class="badge badge-new">New</span>' : ''}
            ${discountPercent > 0 ? `<span class="badge badge-discount">-${discountPercent}%</span>` : ''}
          </div>
          
          <button type="button" 
                  class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  data-wishlist-id="${product.id}" 
                  title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                  onclick="BookNookApp.toggleWishlist('${product.id}', this)">
            <i class="${isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" ${isWishlisted ? 'style="color: #E63946;"' : ''}></i>
          </button>

          <a href="product-detail.html?id=${product.id}" aria-label="View details for ${product.title}">
            <img src="${product.coverImage}" alt="${product.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'">
          </a>
        </div>

        <div class="card-body">
          <span class="card-category">${product.subcategory || product.category}</span>
          <h3 class="card-title">
            <a href="product-detail.html?id=${product.id}">${product.title}</a>
          </h3>
          <p class="card-author">by ${product.author}</p>
          
          <div class="card-rating">
            <span class="stars">
              ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
            </span>
            <span class="rating-value">${product.rating.toFixed(1)}</span>
            <span class="review-count">(${product.reviewsCount})</span>
          </div>

          <div class="card-price-row">
            <span class="current-price">₹${product.price}</span>
            ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
          </div>

          <div class="card-actions">
            <button type="button" class="btn btn-primary btn-sm" onclick="BookNookApp.addToCart('${product.id}', 1)">
              <i class="fa-solid fa-bag-shopping"></i> Add to Cart
            </button>
            <a href="product-detail.html?id=${product.id}" class="btn btn-secondary btn-sm" title="View Details">
              <i class="fa-solid fa-eye"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }
};

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  BookNookApp.init();
});

