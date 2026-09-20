import re

with open('js/products.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert applyPageContext method
init_method = """  init() {
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
  },"""

content = re.sub(r'  init\(\) \{\s+this\.products = BookNookDB\.getAll\(\);\s+this\.parseURLParams\(\);\s+this\.renderFilterOptions\(\);\s+this\.bindEvents\(\);\s+this\.applyFilters\(\);\s+\},', init_method, content)

# Rewrite renderFilterOptions
render_options = """  renderFilterOptions() {
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
  },"""

# We need to replace the entire renderFilterOptions method
content = re.sub(r'  renderFilterOptions\(\) \{.*?(?=  bindEvents\(\) \{)', render_options + '\n\n', content, flags=re.DOTALL)


# Update resetFilters to maintain context
reset_method = """  resetFilters() {
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
    };"""

content = re.sub(r'  resetFilters\(\) \{\s+this\.filters = \{\s+search: \'\',\s+category: \'all\',\s+subcategories: \[\],\s+authors: \[\],\s+maxPrice: 2500,\s+minRating: 0,\s+languages: \[\],\s+sort: \'featured\'\s+\};', reset_method, content)

with open('js/products.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("js/products.js updated.")

