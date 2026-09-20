import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace title
content = content.replace('<title>BookNook | Books & Stationery</title>', '<title>BookNook | Explore Categories</title>')

# Update active nav state
content = content.replace('<a href="index.html" class="nav-link active">Home</a>', '<a href="index.html" class="nav-link">Home</a>')
content = content.replace('<a href="categories.html" class="nav-link">Categories</a>', '<a href="categories.html" class="nav-link active">Categories</a>')

# We need to replace everything inside <main>...</main> with our new categories content
categories_content = """
  <main>
    <section class="section" style="background-color: var(--color-cream-light);">
      <div class="container">
        <header class="section-header">
          <span class="section-tag">Library Aisles</span>
          <h2>Explore Our Collections</h2>
          <p>Navigate through our carefully curated sections of literature, knowledge, and craft.</p>
        </header>

        <div class="category-showcase-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
          
          <a href="fiction.html" class="category-card">
            <div class="category-card-icon"><i class="fa-solid fa-masks-theater"></i></div>
            <h3>Fiction</h3>
            <p>Literary Fiction, Mystery & Thriller, Science Fiction, Fantasy, Romance</p>
            <span class="category-link-text">Browse Fiction <i class="fa-solid fa-arrow-right"></i></span>
          </a>

          <a href="non-fiction.html" class="category-card">
            <div class="category-card-icon"><i class="fa-solid fa-brain"></i></div>
            <h3>Non-Fiction</h3>
            <p>Biography, Self-Help, History, Science, Business & Finance</p>
            <span class="category-link-text">Browse Non-Fiction <i class="fa-solid fa-arrow-right"></i></span>
          </a>

          <a href="children.html" class="category-card">
            <div class="category-card-icon"><i class="fa-solid fa-shapes"></i></div>
            <h3>Children's Books</h3>
            <p>Picture Books, Story Books, Educational, Activity Books, Board Books</p>
            <span class="category-link-text">Browse Children's <i class="fa-solid fa-arrow-right"></i></span>
          </a>

          <a href="stationery.html" class="category-card">
            <div class="category-card-icon"><i class="fa-solid fa-pen-nib"></i></div>
            <h3>Stationery</h3>
            <p>Notebooks & Journals, Pens & Pencils, Art Supplies, Desk Accessories</p>
            <span class="category-link-text">Browse Stationery <i class="fa-solid fa-arrow-right"></i></span>
          </a>
          
        </div>
      </div>
    </section>
  </main>
"""

# Strip out scripts at the bottom that belong to index.html (like dynamic card hydration)
content = re.sub(r'<script>\s*// Homepage Dynamic Card Hydration.*?</script>', '', content, flags=re.DOTALL)

content = re.sub(r'<main>.*?</main>', categories_content, content, flags=re.DOTALL)

with open('categories.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("categories.html generated.")

