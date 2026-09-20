/**
 * BookNook Product Detail Page Controller
 * Manages:
 * - Dynamic URL parameter parsing (?id=...)
 * - Rich product specification display (ISBN, Publisher, Format, Language)
 * - Quantity adjustment (+/-)
 * - Direct Add to Cart with selected quantity
 * - Buy Now flow (adds to cart and redirects immediately to checkout.html)
 * - Wishlist toggle with red-heart state
 * - Related products generation and click navigation
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const ProductDetailController = {
  currentProduct: null,
  quantity: 1,

  init() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
      this.renderNotFound();
      return;
    }

    this.currentProduct = BookNookDB.getById(productId);

    if (!this.currentProduct) {
      this.renderNotFound();
      return;
    }

    this.renderDetail();
    this.renderRelated();
    this.bindEvents();
    BookNookApp.syncWishlistButtons();
  },

  renderDetail() {
    const p = this.currentProduct;
    document.title = `${p.title} | BookNook`;

    // Breadcrumbs
    const breadcrumbCat = document.getElementById('detail-breadcrumb-cat');
    const breadcrumbTitle = document.getElementById('detail-breadcrumb-title');
    if (breadcrumbCat) {
      breadcrumbCat.textContent = p.category;
      breadcrumbCat.href = `products.html?category=${encodeURIComponent(p.category)}`;
    }
    if (breadcrumbTitle) breadcrumbTitle.textContent = p.title;

    // Cover Image
    const coverImg = document.getElementById('detail-cover-img');
    if (coverImg) {
      coverImg.src = p.coverImage;
      coverImg.alt = p.title;
    }

    // Title & Author
    const titleEl = document.getElementById('detail-title');
    const authorEl = document.getElementById('detail-author');
    if (titleEl) titleEl.textContent = p.title;
    if (authorEl) authorEl.textContent = `by ${p.author}`;

    // Rating
    const starsEl = document.getElementById('detail-stars');
    const ratingValEl = document.getElementById('detail-rating-val');
    const reviewsEl = document.getElementById('detail-reviews-count');
    if (starsEl) {
      starsEl.textContent = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    }
    if (ratingValEl) ratingValEl.textContent = p.rating.toFixed(1);
    if (reviewsEl) reviewsEl.textContent = `(${p.reviewsCount} verified reader reviews)`;

    // Price
    const priceNow = document.getElementById('detail-price-now');
    const priceWas = document.getElementById('detail-price-was');
    const discountBadge = document.getElementById('detail-discount-badge');
    if (priceNow) priceNow.textContent = `₹${p.price}`;
    if (priceWas) {
      if (p.originalPrice) {
        priceWas.textContent = `₹${p.originalPrice}`;
        priceWas.style.display = 'inline';
      } else {
        priceWas.style.display = 'none';
      }
    }
    if (discountBadge) {
      if (p.originalPrice) {
        const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        discountBadge.textContent = `Save ${discount}%`;
        discountBadge.style.display = 'inline-block';
      } else {
        discountBadge.style.display = 'none';
      }
    }

    // Description
    const descEl = document.getElementById('detail-description');
    if (descEl) descEl.textContent = p.description;

    // Metadata specs
    const metaCategory = document.getElementById('meta-category');
    const metaSubcategory = document.getElementById('meta-subcategory');
    const metaPublisher = document.getElementById('meta-publisher');
    const metaLanguage = document.getElementById('meta-language');
    const metaIsbn = document.getElementById('meta-isbn');
    const metaFormat = document.getElementById('meta-format');

    if (metaCategory) metaCategory.textContent = p.category;
    if (metaSubcategory) metaSubcategory.textContent = p.subcategory || 'General';
    if (metaPublisher) metaPublisher.textContent = p.publisher || 'Independent Press';
    if (metaLanguage) metaLanguage.textContent = p.language || 'English';
    if (metaIsbn) metaIsbn.textContent = p.isbn || 'N/A';
    if (metaFormat) metaFormat.textContent = p.details || 'Standard Edition';

    // Wishlist Button
    const wishlistBtn = document.getElementById('detail-wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.setAttribute('data-wishlist-id', p.id);
    }
  },

  renderRelated() {
    const relatedContainer = document.getElementById('related-products-grid');
    if (!relatedContainer || !this.currentProduct) return;

    const related = BookNookDB.getRelated(this.currentProduct, 4);
    if (related.length === 0) {
      relatedContainer.parentElement.style.display = 'none';
      return;
    }

    relatedContainer.innerHTML = related.map(item => BookNookApp.createProductCardHTML(item)).join('');
  },

  bindEvents() {
    // Quantity controls
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const qtyInput = document.getElementById('qty-input');

    if (qtyMinus && qtyPlus && qtyInput) {
      qtyMinus.addEventListener('click', () => {
        if (this.quantity > 1) {
          this.quantity--;
          qtyInput.value = this.quantity;
        }
      });

      qtyPlus.addEventListener('click', () => {
        if (this.quantity < 10) {
          this.quantity++;
          qtyInput.value = this.quantity;
        } else {
          BookNookApp.showToast('Maximum 10 copies per order allowed.', 'error');
        }
      });

      qtyInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 10) val = 10;
        this.quantity = val;
        qtyInput.value = val;
      });
    }

    // Add to Cart
    const addCartBtn = document.getElementById('detail-add-cart-btn');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        BookNookApp.addToCart(this.currentProduct.id, this.quantity);
      });
    }

    // Buy Now
    const buyNowBtn = document.getElementById('detail-buy-now-btn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        BookNookApp.addToCart(this.currentProduct.id, this.quantity, false);
        window.location.href = 'checkout.html';
      });
    }

    // Wishlist Toggle
    const wishlistBtn = document.getElementById('detail-wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        BookNookApp.toggleWishlist(this.currentProduct.id, wishlistBtn);
      });
    }
  },

  renderNotFound() {
    const mainSection = document.getElementById('product-detail-section');
    if (mainSection) {
      mainSection.innerHTML = `
        <div class="container" style="padding: 5rem 0; text-align: center;">
          <div class="empty-state">
            <div class="empty-state-icon"><i class="fa-solid fa-book"></i></div>
            <h2>Volume Not Found</h2>
            <p>The literary work or stationery article you requested is no longer on our shelves or the link is invalid.</p>
            <a href="products.html" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-compass"></i> Return to Catalog
            </a>
          </div>
        </div>
      `;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProductDetailController.init();
});

