import os
import re

html_files = [
    'index.html', 'products.html', 'product-detail.html', 
    'cart.html', 'checkout.html', 'account.html', 
    'login.html', 'register.html', 'about.html', 'contact.html'
]

for filename in html_files:
    if not os.path.exists(filename): continue
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update Desktop Nav
    # From: <a href="products.html?category=Fiction" class="nav-link">Categories</a>
    # To:   <a href="categories.html" class="nav-link">Categories</a>
    content = re.sub(
        r'<a href="products\.html\?category=Fiction"\s+class="nav-link(\s+active)?">Categories</a>',
        r'<a href="categories.html" class="nav-link\1">Categories</a>',
        content
    )

    # 2. All other instances of these query parameters across header, footer, drawer, and homepage cards
    content = content.replace('products.html?category=Fiction', 'fiction.html')
    content = content.replace('products.html?category=Non-Fiction', 'non-fiction.html')
    content = content.replace('products.html?category=Children\'s Books', 'children.html')
    content = content.replace('products.html?category=Stationery', 'stationery.html')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("Navigation updated.")

