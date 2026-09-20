/**
 * BookNook Products Catalog Filter & Sort Engine
 * Manages:
 * - Real-time full-text search (Title, Author, Category, Subcat, ISBN, Publisher)
 * - Category & Subcategory filtering
 * - Dynamic Author checkboxes with counts
 * - Price slider and range presets (₹0-500, ₹500-1000, etc.)
 * - Rating filters (4.5+, 4+, 3+, All)
 * - Language filters (English, Telugu, Hindi, Tamil)
 * - Sorting (Featured, Price Low-High, Price High-Low, Rating High-Low, Newest, Bestseller, A-Z)
 * - Mobile filter drawer toggle
 * - URL parameter integration (?search=..., ?category=..., ?sort=...)
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const CatalogController = {
  products: [],
  filteredProducts: [],
  filters: {
    search: '',
    category: 'all',
    subcategories: [],
    authors: [],
    maxPrice: 2500,
    minRating: 0,
    languages: [],
    sort: 'featured'
  },

  init() {
    this.products = BookNookDB.getAll();
    this.applyPageContext();
    this.parseURLParams();
    this.renderFilterOptions();
    this.bindEvents();
    this.applyFilters();
  },

  applyPageContext() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('fiction.html') && !path.includes('non-fiction')) {
      this.products = this.products.filter(p => p.category === 'Fiction');
      this.filters.category = 'Fiction';
      this.hideCategoryFilter();
    } else if (path.includes('non-fiction.html')) {
      this.products = this.products.filter(p => p.category === 'Non-Fiction');
      this.filters.category = 'Non-Fiction';
      this.hideCategoryFilter();
    } else if (path.includes('children.html')) {
      this.products = this.products.filter(p => p.category === "Children's Books");
      this.filters.category = "Children's Books";
      this.hideCategoryFilter();
    } else if (path.includes('stationery.html')) {
      this.products = this.products.filter(p => p.category === 'Stationery');
      this.filters.category = 'Stationery';
      this.hideCategoryFilter();
    } else if (path.includes('products.html')) {
      // Products page is strictly Books now
      this.products = this.products.filter(p => p.category !== 'Stationery');
    }
  },

  hideCategoryFilter() {
    const catGroup = document.getElementById('category-filter-list');
    if (catGroup && catGroup.parentElement) {
      catGroup.parentElement.style.display = 'none';
    }
  },

  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
      this.filters.search = params.get('search');
      const input = document.getElementById('catalog-search-input');
      if (input) input.value = this.filters.search;
    }
    if (params.has('category')) {
      this.filters.category = params.get('category');
    }
    if (params.has('sort')) {
      this.filters.sort = params.get('sort');
      const sortSelect = document.getElementById('sort-by-select');
      if (sortSelect) sortSelect.value = this.filters.sort;
    }
  },

  renderFilterOptions() {
    // 1. Categories
    const categoriesContainer = document.getElementById('category-filter-list');
    if (categoriesContainer) {
      const uniqueCats = [...new Set(this.products.map(p => p.category))];
      if (uniqueCats.length > 1) {
        const categories = ['All', ...uniqueCats];
        categoriesContainer.innerHTML = categories.map(cat => {
          const isChecked = (cat.toLowerCase() === this.filters.category.toLowerCase()) || 
                            (cat === 'All' && this.filters.category === 'all');
          const count = cat === 'All' ? this.products.length : this.products.filter(p => p.category === cat).length;
          return `
            <label class="filter-checkbox-label">
              <span>
                <input type="radio" name="categoryFilter" value="${cat}" ${isChecked ? 'checked' : ''}>
                ${cat}
              </span>
              <span class="option-count">(${count})</span>
            </label>
          `;
        }).join('');
      }
    }

    // 2. Authors
    const authorsContainer = document.getElementById('author-filter-list');
    if (authorsContainer) {
      const uniqueAuthors = [...new Set(this.products.map(p => p.author))].sort();
      authorsContainer.innerHTML = uniqueAuthors.map(author => {
        const count = this.products.filter(p => p.author === author).length;
        return `
          <label class="filter-checkbox-label">
            <span>
              <input type="checkbox" name="authorFilter" value="${author}">
              ${author}
            </span>
            <span class="option-count">(${count})</span>
          </label>
        `;
      }).join('');
      
      // Hide entire author group if empty (e.g. stationery might not have authors)
      if (uniqueAuthors.length === 0 && authorsContainer.parentElement) {
          authorsContainer.parentElement.style.display = 'none';
      }
    }

    // 3. Languages
    const languagesContainer = document.getElementById('language-filter-list');
    if (languagesContainer) {
      const uniqueLangs = [...new Set(this.products.filter(p => p.language).map(p => p.language))].sort();
      languagesContainer.innerHTML = uniqueLangs.map(lang => {
        const count = this.products.filter(p => p.language === lang).length;
        return `
          <label class="filter-checkbox-label">
            <span>
              <input type="checkbox" name="langFilter" value="${lang}">
              ${lang}
            </span>
            <span class="option-count">(${count})</span>
          </label>
        `;
      }).join('');
      
      if (uniqueLangs.length === 0 && languagesContainer.parentElement) {
          languagesContainer.parentElement.style.display = 'none';
      }
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.trim();
        this.applyFilters();
      });
    }

    // Category Radio
    const catContainer = document.getElementById('category-filter-list');
    if (catContainer) {
      catContainer.addEventListener('change', (e) => {
        if (e.target.name === 'categoryFilter') {
          this.filters.category = e.target.value === 'All' ? 'all' : e.target.value;
          this.applyFilters();
        }
      });
    }

    // Author Checkboxes
    const authorContainer = document.getElementById('author-filter-list');
    if (authorContainer) {
      authorContainer.addEventListener('change', () => {
        const checked = Array.from(authorContainer.querySelectorAll('input[name="authorFilter"]:checked')).map(el => el.value);
        this.filters.authors = checked;
        this.applyFilters();
      });
    }

    // Language Checkboxes
    const langContainer = document.getElementById('language-filter-list');
    if (langContainer) {
      langContainer.addEventListener('change', () => {
        const checked = Array.from(langContainer.querySelectorAll('input[name="langFilter"]:checked')).map(el => el.value);
        this.filters.languages = checked;
        this.applyFilters();
      });
    }

    // Rating Filter
    const ratingContainer = document.getElementById('rating-filter-list');
    if (ratingContainer) {
      ratingContainer.addEventListener('change', (e) => {
        if (e.target.name === 'ratingFilter') {
          this.filters.minRating = parseFloat(e.target.value) || 0;
          this.applyFilters();
        }
      });
    }

    // Price Slider
    const priceSlider = document.getElementById('price-slider');
    const priceValDisplay = document.getElementById('price-max-display');
    if (priceSlider && priceValDisplay) {
      priceSlider.addEventListener('input', (e) => {
        this.filters.maxPrice = parseInt(e.target.value, 10);
        priceValDisplay.textContent = `₹${this.filters.maxPrice}`;
        this.applyFilters();
      });
    }

    // Sorting Dropdown
    const sortSelect = document.getElementById('sort-by-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.applyFilters();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Mobile Filter Drawer Toggle
    const mobileFilterBtn = document.getElementById('mobile-filter-toggle-btn');
    const sidebar = document.getElementById('catalog-sidebar');
    if (mobileFilterBtn && sidebar) {
      mobileFilterBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        mobileFilterBtn.innerHTML = sidebar.classList.contains('mobile-open') ? 
          '<i class="fa-solid fa-xmark"></i> Hide Filters' : 
          '<i class="fa-solid fa-sliders"></i> Show Filters';
      });
    }
  },

  resetFilters() {
    const path = window.location.pathname.toLowerCase();
    let defaultCat = 'all';
    
    if (path.includes('fiction.html') && !path.includes('non-fiction')) defaultCat = 'Fiction';
    else if (path.includes('non-fiction.html')) defaultCat = 'Non-Fiction';
    else if (path.includes('children.html')) defaultCat = "Children's Books";
    else if (path.includes('stationery.html')) defaultCat = 'Stationery';

    this.filters = {
      search: '',
      category: defaultCat,
      subcategories: [],
      authors: [],
      maxPrice: 2500,
      minRating: 0,
      languages: [],
      sort: 'featured'
    };

    // Reset Inputs
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = '';

    const priceSlider = document.getElementById('price-slider');
    const priceValDisplay = document.getElementById('price-max-display');
    if (priceSlider && priceValDisplay) {
      priceSlider.value = 2500;
      priceValDisplay.textContent = '₹2500';
    }

    const sortSelect = document.getElementById('sort-by-select');
    if (sortSelect) sortSelect.value = 'featured';

    this.renderFilterOptions();
    this.applyFilters();
    BookNookApp.showToast('All filters have been reset.', 'info');
  },

  applyFilters() {
    let result = [...this.products];

    // 1. Search filter
    if (this.filters.search) {
      const q = this.filters.search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        (item.isbn && item.isbn.toLowerCase().includes(q))
      );
    }

    // 2. Category
    if (this.filters.category !== 'all') {
      result = result.filter(item => item.category.toLowerCase() === this.filters.category.toLowerCase());
    }

    // 3. Authors
    if (this.filters.authors.length > 0) {
      result = result.filter(item => this.filters.authors.includes(item.author));
    }

    // 4. Languages
    if (this.filters.languages.length > 0) {
      result = result.filter(item => this.filters.languages.includes(item.language));
    }

    // 5. Rating
    if (this.filters.minRating > 0) {
      result = result.filter(item => item.rating >= this.filters.minRating);
    }

    // 6. Max Price
    result = result.filter(item => item.price <= this.filters.maxPrice);

    // 7. Sorting
    switch (this.filters.sort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNewArrival === a.isNewArrival ? 0 : b.isNewArrival ? 1 : -1));
        break;
      case 'bestseller':
        result.sort((a, b) => (b.isBestseller === a.isBestseller ? 0 : b.isBestseller ? 1 : -1));
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured === a.isFeatured ? 0 : b.isFeatured ? 1 : -1));
        break;
    }

    this.filteredProducts = result;
    this.renderGrid();
  },

  renderGrid() {
    const grid = document.getElementById('catalog-products-grid');
    const countDisplay = document.getElementById('results-count-number');
    if (!grid) return;

    if (countDisplay) {
      countDisplay.textContent = this.filteredProducts.length;
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3>No Literary Treasures Found</h3>
          <p>We couldn't find any books or stationery matching your filter combinations. Try adjusting the price range, clear author filters, or search for a different title.</p>
          <button type="button" class="btn btn-primary" onclick="CatalogController.resetFilters()">
            <i class="fa-solid fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredProducts.map(p => BookNookApp.createProductCardHTML(p)).join('');
    BookNookApp.syncWishlistButtons();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CatalogController.init();
});

