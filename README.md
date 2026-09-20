# BookNook — Books & Stationery E-Commerce Platform

A complete, responsive, frontend-only bookstore and fine stationery e-commerce platform built using HTML5, modern CSS3, and vanilla ES6+ JavaScript. Designed with a cozy, scholarly, intellectual aesthetic and featuring comprehensive real-world e-commerce behavior with zero backend dependencies.

---

## 👨‍💻 Project & Internship Information

- **Company**: Data Alpha Systems
- **Internship Track**: Web Development Internship
- **Intern**: Dharla SaiBabu (also referred to as *SaiBabu Dharla*)
- **Project Name**: BookNook — Books & Stationery

---

## 🌟 Key Features

1. **Rich Product Catalog Architecture (`js/data.js`)**
   - 36+ realistic products across Fiction, Non-Fiction, Children's Books, and Handcrafted Stationery.
   - Multi-lingual selection including English, Telugu, Hindi, and Tamil classics.
   - Rich metadata: ISBN, Publisher, Author/Brand, Formats, Star Ratings, Verified Review Counts, and Curated Imagery.

2. **Advanced Multi-Criteria Filtering & Live Search (`products.html`)**
   - Instant full-text search across Title, Author, Category, Publisher, and ISBN.
   - Dynamic category and subcategory filtering.
   - Dynamic Author checklists with live product count badges.
   - Interactive price range slider (₹200 to ₹2500).
   - Customer rating filters (4.5+, 4.0+, 3.5+, and All).
   - Multi-language filtering (English, Telugu, Hindi, Tamil).
   - Real-time sorting: Featured, Bestseller, New Arrivals, Price (Low-High, High-Low), Rating, and Alphabetical.

3. **Synchronized Wishlist with Persistent Red Heart (`♥`)**
   - Instant visual feedback: unfilled heart toggles to a vibrant red heart (`#E63946`) when added.
   - Wishlist state synchronized across Home, Catalog, Product Detail, Related Items, and Account pages.
   - Persisted across browser sessions in `localStorage`.
   - Dedicated Wishlist view in `account.html` with direct "Move to Cart" actions.

4. **Dynamic Product Detail Page (`product-detail.html`)**
   - Dynamic URL parameter rendering (`product-detail.html?id=...`).
   - Dynamic image display, breadcrumbs, pricing with savings badges, technical specification grids.
   - Quantity adjustment selector (+/-) with upper limits.
   - "Add to Cart" and immediate "Buy Now" flow.
   - Dynamically generated related reading suggestions.

5. **Complete Shopping Cart (`cart.html`)**
   - Live quantity increment, decrement, and item removal.
   - Subtotal, promotional voucher discounts, tiered shipping calculation (Free above ₹499, otherwise ₹60).
   - Working coupon codes: `READ10` (10% off), `BOOKNOOK` (₹150 off), and `DATAALPHA` (15% off).
   - Cart counter badge synced across every page's header.
   - Graceful empty cart states with "Continue Shopping" CTAs.

6. **Two-Step Checkout & Simulated Payment (`checkout.html`)**
   - Recipient and shipping address entry with form validation.
   - Signature gift wrapping option (+₹50 for kraft wrap, satin ribbon, wax seal & bookmark).
   - Simulated payment gateways: Credit/Debit Card, UPI / QR, and Cash on Delivery.
   - Generates unique Order ID format: `BNK-2026-XXXXX`.
   - Clears cart automatically and presents order receipt with instant "Track Order" link.

7. **Order Tracking & Account Dashboard (`account.html`)**
   - 6-Stage Visual Dispatch Progress Stepper: *Order Placed → Confirmed → Packed in Cedar Box → Shipped & Transit → Out for Delivery → Delivered*.
   - Order history with product thumbnails, quantities, prices, and status badges.
   - Saved Addresses manager (Add new address, delete address, and set default).
   - Profile settings editor.
   - Simulated session sign-out.

8. **Simulated Authentication (`login.html` & `register.html`)**
   - Form validation for passwords, email syntax, and terms confirmation.
   - Quick "Auto Fill Demo Credentials" button for instant testing:
     - **Email**: `saibabu@dataalpha.com`
     - **Password**: `BookNook2026!`
   - Header profile indicator changes when logged in.

9. **Unique Editorial About & Contact Pages**
   - **`about.html`**: Bookstore heritage story, human curation principles, 100% plastic-free packaging pledge, and milestone timeline.
   - **`contact.html`**: Store location hours, concierge contacts, validated dispatch message form, and interactive accordion FAQs.

10. **Toast Notification System**
    - Non-intrusive, custom-designed notifications for cart changes, wishlist actions, coupon applications, and validation alerts.

---

## 📁 Project Directory Structure

```
BookNook/
│
├── index.html                 # Homepage with Hero, Featured, Bestsellers, Categories, Stationery Showcase
├── products.html              # Catalog with Live Search, Multi-Filter & Dynamic Sorting
├── product-detail.html        # Dynamic Product Details by ?id=..., Image, Specs, Quantity, Related
├── cart.html                  # Shopping cart, quantity controls, coupon codes, shipping math
├── checkout.html              # Multi-section Checkout, Address, Gift wrap (+₹50), Payment selection
├── account.html               # Reader Dashboard: Profile, Orders list, 6-Stage Tracker, Addresses, Wishlist
├── login.html                 # Simulated login, validation, session persistence, demo credentials helper
├── register.html              # User registration with validation, creates user records in localStorage
├── about.html                 # Bookstore story, heritage, philosophy, reading culture, timeline, intern credits
├── contact.html               # Contact form with validation, store locations, opening hours, interactive FAQ
│
├── css/
│   ├── style.css              # Global Design System, CSS Variables, Typography, Header, Footer, Toast, Cards
│   ├── pages.css              # Page-specific styling (Catalog sidebar, Detail grid, Cart layout, Stepper)
│   └── responsive.css         # Breakpoints (320px, 375px, 425px, 768px, 1024px, 1440px)
│
├── js/
│   ├── data.js                # Full database catalog of 36+ realistic books and stationery
│   ├── app.js                 # Global state controller, cart/wishlist sync, red heart toggle, toast, mobile drawer
│   ├── products.js            # Live search engine, author/category checklists, price slider, sorting
│   ├── product-detail.js      # URL param parsing, dynamic detail rendering, gallery, quantity, related items
│   ├── cart.js                # Cart management, item counts, promo codes, shipping calculations
│   ├── checkout.js            # Checkout validation, gift wrapping, order ID generation, order receipt
│   ├── auth.js                # Login & register forms validation, auth state management
│   └── account.js             # Tab navigation, 6-stage order tracking modal, address CRUD
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md                  # Complete project documentation & deployment guide
```

---

## 🛠️ Technologies Used

- **HTML5**: Semantic document structure, accessibility labels, and clean meta tags.
- **CSS3**: Custom properties (CSS variables), Grid, Flexbox, transitions, and keyframe animations.
- **JavaScript (ES6+)**: Modular code, DOM manipulation, URLSearchParams, and event delegation.
- **Browser LocalStorage**: Persistent client-side data store for cart items, wishlist, user session, order records, and saved addresses.
- **Google Fonts**: *Playfair Display* (Editorial headings), *Cormorant Garamond* (Literary accents), and *Plus Jakarta Sans* (Clean UI/body).
- **Font Awesome 6 (Free CDN)**: Iconography across search, cart, user, heart, stars, and order status.

---

## 🚀 How to Run Locally

Because BookNook is a pure frontend application with relative paths and zero server dependencies, running it is effortless:

### Method 1: Direct File Opening
1. Download or clone this repository to your machine.
2. Double-click on `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local Static Server (Recommended)
Using VS Code Live Server or Python:
```bash
# Python 3
python -m http.server 5500

# Or using Node http-server / npx serve
npx serve .
```
Then navigate to `http://localhost:5500` or `http://localhost:3000`.

---

## 🌐 How to Deploy on GitHub Pages

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: BookNook complete e-commerce website"
   ```
2. **Push to your GitHub repository**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/BookNook.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, choose `main` and `/ (root)`, then click **Save**.
4. Within 1–2 minutes, your website will be live at:
   `https://YOUR_USERNAME.github.io/BookNook/`

*(Also 100% compatible with one-click deployment on Netlify or Vercel by importing the repository).*

---

## 🧪 LocalStorage Schema Reference

| Storage Key | Type | Description |
|---|---|---|
| `booknook_cart` | Array | Current items in bag: `[{ productId, quantity, dateAdded }]` |
| `booknook_wishlist` | Array | Product IDs saved by user: `["BNK-F-101", "BNK-ST-404"]` |
| `booknook_orders` | Array | Completed orders with status, timestamps, address, and items |
| `booknook_addresses` | Array | Saved shipping destinations with default indicator |
| `booknook_session` | Object | Active logged-in user profile |
| `booknook_user` | Array | Registered user directory |
| `booknook_newsletter`| Array | List of subscribed email addresses |

---

## 💡 Learning Outcomes & Challenges Solved

- **State Synchronization Without Frameworks**: Designed a unified storage listener and DOM updater in `js/app.js` that synchronizes cart quantities and red heart wishlist states without page reloads.
- **Complex Multi-Condition Catalog Filtering**: Implemented combined filter logic in `js/products.js` that simultaneously evaluates query string search terms, multiple selected authors, price ceiling, category selection, language checkboxes, and rating thresholds.
- **Realistic Checkout & Order Lifecyle**: Built an end-to-end checkout system that computes dynamic shipping thresholds, gift wrapping fees, simulates payment gateways, and generates a structured 6-stage delivery tracking visual stepper.

---

## 👤 Author & Acknowledgements

- **Author & Developer**: **Dharla SaiBabu** (*SaiBabu Dharla*)
- **Company**: **Data Alpha Systems**
- **Internship**: Web Development Internship
- **Role**: Lead Frontend Engineering & UI/UX Design

*Crafted with dedication to authentic literature and thoughtful web design.*

