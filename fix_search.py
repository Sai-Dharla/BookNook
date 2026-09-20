import os
import re

for f in ['fiction.html', 'non-fiction.html', 'children.html', 'stationery.html']:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    content = content.replace('action="products.html"', f'action="{f}"')
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print('Search forms fixed.')

