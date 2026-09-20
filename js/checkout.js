/**
 * BookNook Checkout Controller
 * Manages:
 * - Cart content retrieval and live calculation
 * - Customer contact & shipping address validation
 * - Gift wrapping toggle (+₹50 for satin ribbon, artisanal paper, wax seal & bookmark)
 * - Payment selection simulation (Credit/Debit Card, UPI / QR, Cash on Delivery)
 * - Form validation with realistic error feedback
 * - Unique Order ID generation (e.g., BNK-2026-XXXXX)
 * - Order persistence to localStorage (booknook_orders)
 * - Automatic cart clearance upon successful order
 * - Order confirmation receipt view with instant "Track Order" or "Continue Shopping" actions
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const CheckoutController = {
  cartItems: [],
  subtotal: 0,
  shipping: 0,
  giftWrapFee: 0,
  discount: 0,
  grandTotal: 0,
  selectedPayment: 'card',

  init() {
    this.cartItems = Storage.get(STORAGE_KEYS.CART, []);
    if (!this.cartItems || this.cartItems.length === 0) {
      this.handleEmptyCart();
      return;
    }

    this.prefillSavedAddress();
    this.calculateTotals();
    this.bindEvents();
  },

  handleEmptyCart() {
    const mainSection = document.getElementById('checkout-main-section');
    if (mainSection) {
      mainSection.innerHTML = `
        <div class="container" style="padding: 4.5rem 0; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-basket-shopping"></i></div>
            <h2>Your Cart is Empty</h2>
            <p>You need to have at least one book or stationery item in your cart to proceed with checkout.</p>
            <a href="products.html" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-compass"></i> Explore Catalog
            </a>
          </div>
        </div>
      `;
    }
  },

  prefillSavedAddress() {
    const addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];

    const session = Storage.get(STORAGE_KEYS.SESSION);

    if (session) {
      const nameInput = document.getElementById('checkout-name');
      const emailInput = document.getElementById('checkout-email');
      if (nameInput) nameInput.value = session.name || '';
      if (emailInput) emailInput.value = session.email || '';
    }

    if (defaultAddr) {
      const nameInput = document.getElementById('checkout-name');
      const phoneInput = document.getElementById('checkout-phone');
      const streetInput = document.getElementById('checkout-street');
      const cityInput = document.getElementById('checkout-city');
      const stateInput = document.getElementById('checkout-state');
      const zipInput = document.getElementById('checkout-zip');

      if (nameInput && !nameInput.value) nameInput.value = defaultAddr.name || '';
      if (phoneInput) phoneInput.value = defaultAddr.phone || '';
      if (streetInput) streetInput.value = defaultAddr.street || '';
      if (cityInput) cityInput.value = defaultAddr.city || '';
      if (stateInput) stateInput.value = defaultAddr.state || '';
      if (zipInput) zipInput.value = defaultAddr.zip || '';
    }
  },

  calculateTotals() {
    this.subtotal = 0;
    this.cartItems.forEach(item => {
      const p = BookNookDB.getById(item.productId);
      if (p) this.subtotal += p.price * item.quantity;
    });

    this.shipping = this.subtotal >= 499 ? 0 : 60;
    this.grandTotal = this.subtotal + this.shipping + this.giftWrapFee - this.discount;

    // Render items in summary
    const itemsContainer = document.getElementById('checkout-items-list');
    if (itemsContainer) {
      itemsContainer.innerHTML = this.cartItems.map(item => {
        const p = BookNookDB.getById(item.productId);
        if (!p) return '';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; font-size:0.9rem;">
            <div style="display:flex; align-items:center; gap:0.65rem;">
              <img src="${p.coverImage}" alt="${p.title}" style="width:36px; height:48px; object-fit:contain; border-radius:3px;">
              <div>
                <span style="font-weight:600; display:block; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</span>
                <span style="font-size:0.78rem; color:var(--color-muted);">Qty: ${item.quantity}</span>
              </div>
            </div>
            <span style="font-weight:600;">₹${p.price * item.quantity}</span>
          </div>
        `;
      }).join('');
    }

    // Update summary values
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const giftWrapRow = document.getElementById('checkout-giftwrap-row');
    const giftWrapEl = document.getElementById('checkout-giftwrap-val');
    const grandTotalEl = document.getElementById('checkout-grand-total');

    if (subtotalEl) subtotalEl.textContent = `₹${this.subtotal}`;
    if (shippingEl) shippingEl.textContent = this.shipping === 0 ? 'FREE' : `₹${this.shipping}`;
    
    if (giftWrapRow && giftWrapEl) {
      if (this.giftWrapFee > 0) {
        giftWrapRow.style.display = 'flex';
        giftWrapEl.textContent = `+₹${this.giftWrapFee}`;
      } else {
        giftWrapRow.style.display = 'none';
      }
    }

    if (grandTotalEl) grandTotalEl.textContent = `₹${this.grandTotal}`;
  },

  bindEvents() {
    // Gift wrap checkbox
    const giftWrapCheck = document.getElementById('gift-wrap-checkbox');
    if (giftWrapCheck) {
      giftWrapCheck.addEventListener('change', (e) => {
        this.giftWrapFee = e.target.checked ? 50 : 0;
        this.calculateTotals();
        BookNookApp.showToast(e.target.checked ? 'Artisan Gift Wrapping Added (+₹50)' : 'Gift Wrapping Removed', 'info');
      });
    }

    // Payment radio tabs
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedPayment = e.target.value;
        document.querySelectorAll('.payment-fields-box').forEach(box => box.style.display = 'none');
        const activeBox = document.getElementById(`payment-box-${this.selectedPayment}`);
        if (activeBox) activeBox.style.display = 'block';
      });
    });

    // Form Submission
    const form = document.getElementById('checkout-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processOrder();
      });
    }
  },

  validateForm() {
    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const street = document.getElementById('checkout-street').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const state = document.getElementById('checkout-state').value.trim();
    const zip = document.getElementById('checkout-zip').value.trim();

    if (!name || !email || !phone || !street || !city || !state || !zip) {
      BookNookApp.showToast('Please fill out all required shipping details.', 'error');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      BookNookApp.showToast('Please enter a valid email address.', 'error');
      return false;
    }

    if (phone.length < 10) {
      BookNookApp.showToast('Please enter a valid 10-digit mobile number.', 'error');
      return false;
    }

    // Payment simulation validation
    if (this.selectedPayment === 'card') {
      const cardNum = document.getElementById('card-number').value.replace(/\s+/g, '');
      if (cardNum.length < 12) {
        BookNookApp.showToast('Please enter a valid simulated card number (min 12 digits).', 'error');
        return false;
      }
    } else if (this.selectedPayment === 'upi') {
      const upiId = document.getElementById('upi-id').value.trim();
      if (!upiId || !upiId.includes('@')) {
        BookNookApp.showToast('Please enter a valid UPI VPA (e.g., yourname@upi).', 'error');
        return false;
      }
    }

    return {
      name, email, phone, street, city, state, zip
    };
  },

  processOrder() {
    const shippingDetails = this.validateForm();
    if (!shippingDetails) return;

    // Generate real Order ID format: BNK-2026-XXXXX
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `BNK-2026-${randomNum}`;

    const orderData = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: this.cartItems.map(item => {
        const p = BookNookDB.getById(item.productId);
        return {
          id: item.productId,
          title: p ? p.title : 'Book/Stationery',
          price: p ? p.price : 0,
          quantity: item.quantity,
          coverImage: p ? p.coverImage : ''
        };
      }),
      subtotal: this.subtotal,
      shipping: this.shipping,
      giftWrap: this.giftWrapFee,
      discount: this.discount,
      total: this.grandTotal,
      status: "Order Placed",
      shippingAddress: shippingDetails,
      paymentMethod: this.selectedPayment.toUpperCase()
    };

    // Save Order to LocalStorage
    let orders = Storage.get(STORAGE_KEYS.ORDERS, []);
    orders.unshift(orderData);
    Storage.set(STORAGE_KEYS.ORDERS, orders);

    // Save Address if not already present
    let addresses = Storage.get(STORAGE_KEYS.ADDRESSES, []);
    if (!addresses.some(a => a.street === shippingDetails.street)) {
      addresses.push({
        id: `ADDR-${Date.now()}`,
        name: shippingDetails.name,
        phone: shippingDetails.phone,
        street: shippingDetails.street,
        city: shippingDetails.city,
        state: shippingDetails.state,
        zip: shippingDetails.zip,
        isDefault: addresses.length === 0
      });
      Storage.set(STORAGE_KEYS.ADDRESSES, addresses);
    }

    // Clear user's cart
    BookNookApp.clearCart();

    // Display Confirmation UI
    this.renderConfirmation(orderData);
  },

  renderConfirmation(order) {
    const mainSection = document.getElementById('checkout-main-section');
    if (!mainSection) return;

    mainSection.innerHTML = `
      <div class="container" style="padding: 4rem 0;">
        <div style="max-width: 680px; margin: 0 auto; background: var(--color-white); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 3rem 2.5rem; box-shadow: var(--shadow-md); text-align: center;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--color-primary-subtle); color: var(--color-primary); font-size: 2.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <i class="fa-solid fa-circle-check"></i>
          </div>

          <span class="section-tag" style="background: var(--color-primary-subtle); color: var(--color-primary-dark);">Order Confirmed</span>
          <h2 style="margin: 0.5rem 0 0.5rem; font-size: 2.2rem;">Thank You, ${order.shippingAddress.name.split(' ')[0]}!</h2>
          <p style="color: var(--color-muted); margin-bottom: 1.5rem;">Your literary collection has been booked. A confirmation dispatch note has been simulated to <strong>${order.shippingAddress.email}</strong>.</p>

          <div style="background: var(--color-cream); border: 1px dashed var(--color-border); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; margin-bottom: 2rem; text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><strong>Order Reference:</strong> <span style="color:var(--color-primary); font-family:monospace; font-weight:700;">${order.id}</span></div>
            <div><strong>Date Booked:</strong> <span>${order.date}</span></div>
            <div><strong>Payment Mode:</strong> <span>${order.paymentMethod}</span></div>
            <div><strong>Total Paid:</strong> <strong style="color:var(--color-primary-dark);">₹${order.total}</strong></div>
            <div style="grid-column: 1 / -1;"><strong>Destination:</strong> <span>${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}</span></div>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="account.html?track=${order.id}" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-truck-ramp-box"></i> Track Order Status
            </a>
            <a href="products.html" class="btn btn-secondary btn-lg">
              <i class="fa-solid fa-book"></i> Continue Browsing
            </a>
          </div>
        </div>
      </div>
    `;

    BookNookApp.showToast(`Order ${order.id} placed successfully!`, 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CheckoutController.init();
});

