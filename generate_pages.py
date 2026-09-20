import os

def create_page(source_file, target_file, new_title, new_h1, new_p, active_link_selector):
    if not os.path.exists(source_file): return
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update title
    content = content.replace('<title>BookNook | Explore Books & Stationery Catalog</title>', f'<title>BookNook | {new_title}</title>')
    
    # Update active nav state
    content = content.replace('<a href="products.html" class="nav-link active">', '<a href="products.html" class="nav-link">')
    if active_link_selector == 'books':
        content = content.replace('<a href="products.html" class="nav-link">Books</a>', '<a href="products.html" class="nav-link active">Books</a>')
    elif active_link_selector == 'categories':
        content = content.replace('<a href="categories.html" class="nav-link">Categories</a>', '<a href="categories.html" class="nav-link active">Categories</a>')
    elif active_link_selector == 'stationery':
        content = content.replace('<a href="stationery.html" class="nav-link">Stationery</a>', '<a href="stationery.html" class="nav-link active">Stationery</a>')
        
    # Same for drawer nav
    content = content.replace('<a href="products.html" class="active">', '<a href="products.html">')
    if active_link_selector == 'books':
        content = content.replace('<a href="products.html"><i class="fa-solid fa-book"></i> All Books</a>', '<a href="products.html" class="active"><i class="fa-solid fa-book"></i> All Books</a>')
    elif active_link_selector == 'fiction':
        content = content.replace('<a href="fiction.html"><i class="fa-solid fa-shapes"></i> Fiction</a>', '<a href="fiction.html" class="active"><i class="fa-solid fa-shapes"></i> Fiction</a>')
    elif active_link_selector == 'non-fiction':
        content = content.replace('<a href="non-fiction.html"><i class="fa-solid fa-compass"></i> Non-Fiction</a>', '<a href="non-fiction.html" class="active"><i class="fa-solid fa-compass"></i> Non-Fiction</a>')
    elif active_link_selector == 'children':
        content = content.replace('<a href="children.html"><i class="fa-solid fa-child"></i> Children\'s Books</a>', '<a href="children.html" class="active"><i class="fa-solid fa-child"></i> Children\'s Books</a>')
    elif active_link_selector == 'stationery':
        content = content.replace('<a href="stationery.html"><i class="fa-solid fa-pen-nib"></i> Stationery</a>', '<a href="stationery.html" class="active"><i class="fa-solid fa-pen-nib"></i> Stationery</a>')
        
    # Update H1 and P
    import re
    content = re.sub(r'<h1>Explore Literary Catalog &amp; Stationery</h1>', f'<h1>{new_h1}</h1>', content)
    content = re.sub(r'<p style="color: var\(--color-muted\);">Immerse in classic masterworks, award-winning debuts, regional literature, and handcrafted writer tools.</p>', f'<p style="color: var(--color-muted);">{new_p}</p>', content)
    
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)

# Update products.html itself to be just "Books"
create_page(
    'products.html', 'products.html', 
    'All Books', 'Explore All Books', 
    'Browse our entire collection of literary masterpieces and non-fiction works.',
    'books'
)

# Fiction
create_page(
    'products.html', 'fiction.html',
    'Fiction Literature', 'Fiction Literature',
    'Discover gripping plots, magical realms, and profound literary fiction.',
    'categories' # We\'ll keep categories active in top nav, and fiction active in drawer
)

# Non-Fiction
create_page(
    'products.html', 'non-fiction.html',
    'Non-Fiction & Biographies', 'Non-Fiction & Biographies',
    'Explore empirical truth, biographies, self-growth, and historical accounts.',
    'categories'
)

# Children\'s Books
create_page(
    'products.html', 'children.html',
    'Children\'s Books', 'Children\'s Books',
    'Delightful stories, educational books, and activities for the young mind.',
    'categories'
)

# Stationery
create_page(
    'products.html', 'stationery.html',
    'Stationery & Desk Craft', 'Handcrafted Stationery',
    'Elevate your creative space with artisanal notebooks, premium pens, and accessories.',
    'stationery'
)

print("Generated catalog pages.")

