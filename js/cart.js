/**
 * BookNook Shopping Cart Controller
 * Manages:
 * - Cart item rendering from localStorage
 * - Quantity increase & decrease with live subtotal sync
 * - Item removal with confirmation toast
 * - Clear entire cart functionality
 * - Promo code / coupon system (e.g., READ10 for 10% off, BOOKNOOK for ₹150 off)
 * - Free shipping threshold calculation (Free above ₹499, otherwise ₹60)
 * - Estimated tax / GST calculation
 * - Empty cart graceful UI with "Continue Shopping" CTA
 * - "Proceed to Checkout" flow
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const CartController = {
  appliedCoupon: null,
  coupons: {
    'READ10': { type: 'percent', value: 10, desc: '10% Reader Discount' },
    'BOOKNOOK': { type: 'flat', value: 150, desc: '₹150 BookNook Voucher' },
    'DATAALPHA': { type: 'percent', value: 15, desc: '15% Data Alpha Special' }
  },

  init() {
    this.renderCart();
    this.bindEvents();
  },

  renderCart() {
    const cart = Storage.get(STORAGE_KEYS.CART, []);
    const cartContainer = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const tableHeader = document.querySelector('.cart-table-header');
    const summaryCard = document.getElementById('cart-summary-card');

    if (!cartContainer) return;

    if (!cart || cart.length === 0) {
      if (cartContainer) cartContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (tableHeader) tableHeader.style.display = 'none';
      if (summaryCard) summaryCard.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableHeader) tableHeader.style.display = 'grid';
    if (summaryCard) summaryCard.style.display = 'block';

    let subtotal = 0;

    cartContainer.innerHTML = cart.map(item => {
      const product = BookNookDB.getById(item.productId);
      if (!product) return '';

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return `
        <div class="cart-item-row" data-product-id="${product.id}">
          <div class="cart-item-info">
            <img src="${product.coverImage}" alt="${product.title}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80'">
            <div>
              <h4 class="cart-item-title">
                <a href="product-detail.html?id=${product.id}">${product.title}</a>
              </h4>
              <p class="cart-item-author">by ${product.author}</p>
              <span class="badge badge-new" style="font-size:0.65rem;">${product.category}</span>
            </div>
          </div>

          <div style="font-weight: 600; color: var(--color-charcoal);">
            ₹${product.price}
          </div>

          <div>
            <div class="quantity-control" style="transform: scale(0.9); transform-origin: left center;">
              <button type="button" class="qty-btn" onclick="CartController.adjustQuantity('${product.id}', -1)" aria-label="Decrease quantity">
                <i class="fa-solid fa-minus"></i>
              </button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly aria-label="Quantity">
              <button type="button" class="qty-btn" onclick="CartController.adjustQuantity('${product.id}', 1)" aria-label="Increase quantity">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>

          <div style="font-weight: 700; color: var(--color-primary-dark); font-size: 1.05rem;">
            ₹${itemTotal}
          </div>

          <div>
            <button type="button" class="cart-item-delete" onclick="CartController.removeItem('${product.id}')" title="Remove Item" aria-label="Remove item">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.calculateTotals(subtotal);
  },

  adjustQuantity(productId, delta) {
    const cart = Storage.get(STORAGE_KEYS.CART, []);
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(productId);
    } else if (newQty > 10) {
      BookNookApp.showToast('Maximum 10 copies per item allowed.', 'error');
    } else {
      BookNookApp.updateCartQuantity(productId, newQty);
      this.renderCart();
    }
  },

  removeItem(productId) {
    const product = BookNookDB.getById(productId);
    BookNookApp.removeFromCart(productId);
    this.renderCart();
    BookNookApp.showToast(`Removed "${product ? product.title : 'item'}" from cart.`, 'info');
  },

  clearAll() {
    if (confirm('Are you sure you wish to empty your entire shopping cart?')) {
      BookNookApp.clearCart();
      this.renderCart();
      BookNookApp.showToast('Shopping cart has been emptied.', 'info');
    }
  },

  calculateTotals(subtotal) {
    const shipping = subtotal >= 499 ? 0 : 60;
    let discount = 0;

    if (this.appliedCoupon) {
      const promo = this.coupons[this.appliedCoupon];
      if (promo.type === 'percent') {
        discount = Math.round((subtotal * promo.value) / 100);
      } else {
        discount = Math.min(subtotal, promo.value);
      }
    }

    const grandTotal = Math.max(0, subtotal - discount + shipping);

    // Update UI elements
    const subtotalEl = document.getElementById('summary-subtotal');
    const shippingEl = document.getElementById('summary-shipping');
    const discountRow = document.getElementById('summary-discount-row');
    const discountVal = document.getElementById('summary-discount-val');
    const totalEl = document.getElementById('summary-grand-total');
    const freeShippingNotice = document.getElementById('free-shipping-notice');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    
    if (discountRow && discountVal) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountVal.textContent = `-₹${discount}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (totalEl) totalEl.textContent = `₹${grandTotal}`;

    if (freeShippingNotice) {
      if (subtotal >= 499) {
        freeShippingNotice.innerHTML = `<span style="color:var(--color-primary); font-weight:600;"><i class="fa-solid fa-gift"></i> You've qualified for FREE Pan-India Shipping!</span>`;
      } else {
        const remaining = 499 - subtotal;
        freeShippingNotice.innerHTML = `<span>Add <strong>₹${remaining}</strong> more to enjoy FREE Shipping!</span>`;
      }
    }
  },

  bindEvents() {
    const couponForm = document.getElementById('coupon-form');
    if (couponForm) {
      couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('coupon-input');
        const code = input ? input.value.trim().toUpperCase() : '';

        if (!code) {
          BookNookApp.showToast('Please enter a voucher code.', 'error');
          return;
        }

        if (this.coupons[code]) {
          this.appliedCoupon = code;
          BookNookApp.showToast(`Coupon "${code}" applied: ${this.coupons[code].desc}`, 'success');
          this.renderCart();
        } else {
          BookNookApp.showToast('Invalid or expired coupon code. Try: READ10, BOOKNOOK, or DATAALPHA', 'error');
        }
      });
    }

    const clearBtn = document.getElementById('clear-cart-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAll();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CartController.init();
});

