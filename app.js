/* ═══════════════════════════════════════════════
   STEPZ — Footwear E-Commerce App Logic
═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   PRODUCT DATA
══════════════════════════════════ */
const PRODUCTS = [
  {
    id: 1,
    brand: 'Nike',
    name: 'Air Max 270 React',
    category: 'men',
    price: 18500,
    oldPrice: 24000,
    badge: 'sale',
    rating: 4.8,
    reviews: 214,
    image: 'assets/images/product_mens.png',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    description: 'The Nike Air Max 270 React combines two of Nike\'s most innovative cushioning technologies. Featuring a massive heel Air unit and React foam midsole, this shoe delivers all-day comfort and a sleek, modern profile.',
    inStock: true
  },
  {
    id: 2,
    brand: 'Adidas',
    name: 'Ultraboost 23',
    category: 'sport',
    price: 21000,
    oldPrice: null,
    badge: 'new',
    rating: 4.9,
    reviews: 187,
    image: 'assets/images/product_sport.png',
    sizes: [6, 7, 8, 9, 10, 11],
    description: 'Engineered for elite performance. Adidas Ultraboost 23 features BOOST midsole technology, Primeknit+ upper, and a Continental rubber outsole for superior grip in all conditions.',
    inStock: true
  },
  {
    id: 3,
    brand: 'Steve Madden',
    name: 'Elara Stiletto Heels',
    category: 'women',
    price: 9800,
    oldPrice: 14500,
    badge: 'sale',
    rating: 4.7,
    reviews: 92,
    image: 'assets/images/product_womens.png',
    sizes: [4, 5, 6, 7, 8, 9],
    description: 'The Elara stiletto by Steve Madden is the epitome of elegant femininity. Crafted from premium materials with a sleek pointed toe and 4-inch heel that commands attention at every event.',
    inStock: true
  },
  {
    id: 4,
    brand: 'Timberland',
    name: 'Premium Loafer',
    category: 'casual',
    price: 13500,
    oldPrice: null,
    badge: 'hot',
    rating: 4.6,
    reviews: 143,
    image: 'assets/images/product_casual.png',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    description: 'The Timberland Premium Loafer is crafted from full-grain leather with a padded collar and premium foam footbed. Versatile enough for the office or weekend outings.',
    inStock: true
  },
  {
    id: 5,
    brand: 'Jordan',
    name: 'Air Jordan 1 Retro High',
    category: 'men',
    price: 32000,
    oldPrice: 38000,
    badge: 'sale',
    rating: 4.9,
    reviews: 512,
    image: 'assets/images/product_mens.png',
    sizes: [7, 8, 9, 10, 11, 12],
    description: 'The iconic Air Jordan 1 Retro High OG is a classic reimagined. Premium leather upper with Nike Air cushioning delivers unparalleled comfort and style that has transcended generations.',
    inStock: true
  },
  {
    id: 6,
    brand: 'Puma',
    name: 'Nitro Runner Elite',
    category: 'sport',
    price: 15800,
    oldPrice: null,
    badge: 'new',
    rating: 4.5,
    reviews: 76,
    image: 'assets/images/product_sport.png',
    sizes: [6, 7, 8, 9, 10, 11],
    description: 'Built for speed and endurance, the Puma Nitro Runner Elite uses NITRO foam technology for a super-responsive ride with every stride. Lightweight, breathable, and race-ready.',
    inStock: true
  },
  {
    id: 7,
    brand: 'Aldo',
    name: 'Strappy Sandal Heels',
    category: 'women',
    price: 7200,
    oldPrice: 10800,
    badge: 'sale',
    rating: 4.4,
    reviews: 61,
    image: 'assets/images/product_womens.png',
    sizes: [4, 5, 6, 7, 8],
    description: 'ALDO Strappy Sandal Heels feature delicate ankle straps and a block heel for balance and style. Perfect for summer events, brunches, and evening outings.',
    inStock: true
  },
  {
    id: 8,
    brand: 'Skechers',
    name: 'Arch Fit Loafer',
    category: 'casual',
    price: 8900,
    oldPrice: 11000,
    badge: 'sale',
    rating: 4.6,
    reviews: 208,
    image: 'assets/images/product_casual.png',
    sizes: [6, 7, 8, 9, 10, 11, 12],
    description: 'Skechers Arch Fit Loafer features an orthopedic insole developed with podiatrists. Superior arch support combined with a stylish slip-on design for all-day comfort.',
    inStock: true
  }
];

/* ══════════════════════════════════
   STATE
══════════════════════════════════ */
let cart = JSON.parse(localStorage.getItem('stepz-cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('stepz-wishlist') || '[]');
let currentFilter = 'all';
let currentModal = null;
let currentSlide = 0;
let totalSlides = 0;
let isCartOpen = false;
let isSearchOpen = false;
let isMobileNavOpen = false;

/* ══════════════════════════════════
   UTILITY
══════════════════════════════════ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatPrice(n) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

function showToast(msg, icon = '✅') {
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  const toastIcon = $('.toast-icon');
  toastMsg.textContent = msg;
  toastIcon.textContent = icon;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ══════════════════════════════════
   PRODUCTS RENDER
══════════════════════════════════ */
function renderProducts(filter = 'all') {
  const grid = $('#productsGrid');
  if (!grid) return;

  const filtered = filter === 'all' 
    ? PRODUCTS 
    : filter === 'sale' 
      ? PRODUCTS.filter(p => p.badge === 'sale') 
      : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = '';

  filtered.forEach((p, i) => {
    const isWishlisted = wishlist.includes(p.id);
    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
    const badgeClass = `badge-${p.badge}`;
    const badgeText = { new: 'NEW', sale: 'SALE', hot: '🔥 HOT' }[p.badge] || '';

    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${i * 0.08}s`;
    card.dataset.productId = p.id;

    card.innerHTML = `
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-badge ${badgeClass}">${badgeText}</div>
        <div class="product-actions">
          <button class="action-btn wishlist-toggle ${isWishlisted ? 'wishlisted' : ''}" 
                  data-id="${p.id}" 
                  aria-label="Wishlist"
                  title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="action-btn quick-view-btn" data-id="${p.id}" aria-label="Quick View" title="Quick View">
            <i class="fa-regular fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="add-cart-btn" data-id="${p.id}" aria-label="Add to Cart" title="Add to Cart">+</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Bind events after rendering
  bindProductEvents();

  // Trigger reveal after small delay
  setTimeout(() => {
    $$('.product-card.reveal').forEach(el => el.classList.add('visible'));
  }, 100);
}

function bindProductEvents() {
  $$('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id, null);
    });
  });

  $$('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      openModal(id);
    });
  });

  $$('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleWishlist(id, btn);
    });
  });
}

/* ══════════════════════════════════
   FILTER TABS
══════════════════════════════════ */
$$('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderProducts(currentFilter);
  });
});

function filterProducts(cat) {
  currentFilter = cat;
  
  // If not on products.html, redirect with filter query param
  if (!window.location.pathname.includes('products.html')) {
    window.location.href = `products.html?filter=${cat}`;
    return;
  }

  $$('.filter-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.filter === cat);
  });
  renderProducts(cat);
  
  const productsSection = document.getElementById('products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}
window.filterProducts = filterProducts;

/* ══════════════════════════════════
   CART
══════════════════════════════════ */
function addToCart(productId, size = null) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
  if (existingIndex !== -1) {
    cart[existingIndex].qty++;
  } else {
    cart.push({ ...product, qty: 1, size: size || product.sizes[0] });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`, '🛒');

  // Animate cart badge
  const badge = $('#cartBadge');
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => badge.style.transform = 'scale(1)', 300);
}

function removeFromCart(index) {
  const item = cart[index];
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  renderCart();
  showToast(`${item.name} removed from cart`, '🗑️');
}

function updateQty(index, delta) {
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart();
  updateCartUI();
  renderCart();
}

function saveCart() {
  localStorage.setItem('stepz-cart', JSON.stringify(cart));
}

function updateCartUI() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartBadge').textContent = total;
  $('#cartCount').textContent = total;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  $('#cartSubtotal').textContent = formatPrice(subtotal);
  $('#cartTotal').textContent = formatPrice(subtotal);

  $('#cartFooter').style.display = cart.length > 0 ? 'block' : 'none';
}

function renderCart() {
  const container = $('#cartItems');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:12px;color:var(--text-muted)">Add your favourite shoes to get started!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  cart.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-brand">${item.brand}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-size">Size UK ${item.size}</div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
          </div>
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${i})" aria-label="Remove item">✕</button>
    `;
    container.appendChild(div);
  });
}

function openCart() {
  isCartOpen = true;
  $('#cartSidebar').classList.add('open');
  $('#cartOverlay').classList.add('open');
  renderCart();
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  isCartOpen = false;
  $('#cartSidebar').classList.remove('open');
  $('#cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);

function handleCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', '⚠️');
    return;
  }
  showToast('Redirecting to checkout…', '🚀');
  setTimeout(() => closeCart(), 1500);
}
window.handleCheckout = handleCheckout;

/* ══════════════════════════════════
   WISHLIST
══════════════════════════════════ */
function toggleWishlist(productId, btn) {
  const idx = wishlist.indexOf(productId);
  const product = PRODUCTS.find(p => p.id === productId);

  if (idx !== -1) {
    wishlist.splice(idx, 1);
    btn.classList.remove('wishlisted');
    btn.querySelector('i').className = 'fa-regular fa-heart';
    showToast(`Removed from Wishlist`, '💔');
  } else {
    wishlist.push(productId);
    btn.classList.add('wishlisted');
    btn.querySelector('i').className = 'fa-solid fa-heart';
    showToast(`${product.name} added to Wishlist!`, '❤️');
  }
  localStorage.setItem('stepz-wishlist', JSON.stringify(wishlist));
}

/* ══════════════════════════════════
   QUICK VIEW MODAL
══════════════════════════════════ */
function openModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentModal = product;

  $('#modalImg').src = product.image;
  $('#modalImg').alt = product.name;
  $('#modalBrand').textContent = product.brand;
  $('#modalName').textContent = product.name;
  $('#modalPrice').textContent = formatPrice(product.price);
  $('#modalDesc').textContent = product.description;

  // Sizes
  const sizeGrid = $('#sizeGrid');
  sizeGrid.innerHTML = '';
  product.sizes.forEach((size, i) => {
    const btn = document.createElement('button');
    btn.className = 'size-btn' + (i === 0 ? ' selected' : '');
    btn.textContent = size;
    btn.addEventListener('click', () => {
      $$('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    sizeGrid.appendChild(btn);
  });

  // Add to cart from modal
  $('#modalAddBtn').onclick = () => {
    const selectedSize = $('.size-btn.selected')?.textContent || product.sizes[0];
    addToCart(product.id, Number(selectedSize));
    closeModal();
    setTimeout(() => openCart(), 400);
  };

  // Wishlist from modal
  const isWishlisted = wishlist.includes(product.id);
  const wishBtn = $('#modalWishBtn');
  wishBtn.innerHTML = `<i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart" style="color:${isWishlisted ? '#ff6b6b' : 'inherit'}"></i>`;
  wishBtn.onclick = () => {
    const idx = wishlist.indexOf(product.id);
    if (idx !== -1) {
      wishlist.splice(idx, 1);
      wishBtn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
      showToast('Removed from Wishlist', '💔');
    } else {
      wishlist.push(product.id);
      wishBtn.innerHTML = `<i class="fa-solid fa-heart" style="color:#ff6b6b"></i>`;
      showToast(`${product.name} added to Wishlist!`, '❤️');
    }
    localStorage.setItem('stepz-wishlist', JSON.stringify(wishlist));
  };

  $('#modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  currentModal = null;
}

$('#modalClose').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', (e) => {
  if (e.target === $('#modalOverlay')) closeModal();
});

/* ══════════════════════════════════
   NAVBAR
══════════════════════════════════ */
window.addEventListener('scroll', () => {
  const navbar = $('#navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link based on scroll (only if section exists on page)
  const sections = ['home','categories','products','offers','testimonials'];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 80 && rect.bottom >= 80) {
        $$('.nav-links a').forEach(a => {
          const href = a.getAttribute('href');
          a.classList.toggle('active', href === `#${id}` || href === `index.html#${id}`);
        });
      }
    }
  });
});

// Hamburger
$('#hamburger').addEventListener('click', () => {
  isMobileNavOpen = !isMobileNavOpen;
  $('#hamburger').classList.toggle('active', isMobileNavOpen);
  $('#mobileNav').classList.toggle('open', isMobileNavOpen);
  $('#navOverlay').classList.toggle('open', isMobileNavOpen);
  document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';
});

$('#navOverlay').addEventListener('click', () => {
  isMobileNavOpen = false;
  $('#hamburger').classList.remove('active');
  $('#mobileNav').classList.remove('open');
  $('#navOverlay').classList.remove('open');
  document.body.style.overflow = '';
});

// Mobile nav links close on click
$$('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    isMobileNavOpen = false;
    $('#hamburger').classList.remove('active');
    $('#mobileNav').classList.remove('open');
    $('#navOverlay').classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ══════════════════════════════════
   SEARCH
══════════════════════════════════ */
$('#searchBtn').addEventListener('click', () => {
  isSearchOpen = !isSearchOpen;
  $('#searchBar').classList.toggle('open', isSearchOpen);
  if (isSearchOpen) {
    $('#searchInput').focus();
  }
});

$('#searchClose').addEventListener('click', () => {
  isSearchOpen = false;
  $('#searchBar').classList.remove('open');
});

$('#searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    isSearchOpen = false;
    $('#searchBar').classList.remove('open');
  }
});

/* ══════════════════════════════════
   COUNTDOWN TIMER
══════════════════════════════════ */
function startCountdown() {
  const hoursEl = $('#cd-hours');
  if (!hoursEl) return;

  // Set target to 8 hours from now
  const stored = localStorage.getItem('stepz-countdown-end');
  let endTime;

  if (stored && parseInt(stored) > Date.now()) {
    endTime = parseInt(stored);
  } else {
    endTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('stepz-countdown-end', endTime);
  }

  function tick() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
      endTime = Date.now() + 8 * 60 * 60 * 1000;
      localStorage.setItem('stepz-countdown-end', endTime);
      return;
    }
    const hours   = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    $('#cd-hours').textContent = String(hours).padStart(2, '0');
    $('#cd-mins').textContent  = String(minutes).padStart(2, '0');
    $('#cd-secs').textContent  = String(seconds).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════
   TESTIMONIALS SLIDER
══════════════════════════════════ */
function initSlider() {
  const slider = $('#testimonialSlider');
  if (!slider) return;
  const dotsContainer = $('#sliderDots');
  const cards = slider.children;
  let autoSlideInterval;

  // Determine slides per view
  function getSlidesPerView() {
    return window.innerWidth > 900 ? 3 : 1;
  }

  function getTotalSlides() {
    return Math.ceil(cards.length / getSlidesPerView());
  }

  totalSlides = getTotalSlides();

  // Create dots
  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    $$('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    const perView = getSlidesPerView();
    const cardWidth = cards[0].offsetWidth + 24; // gap
    slider.style.transform = `translateX(-${currentSlide * cardWidth * perView}px)`;
    updateDots();
  }

  function next() {
    goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
  }

  function prev() {
    goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
  }

  $('#nextSlide').addEventListener('click', next);
  $('#prevSlide').addEventListener('click', prev);

  // Auto slide
  function startAutoSlide() {
    autoSlideInterval = setInterval(next, 4500);
  }
  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  slider.addEventListener('mouseenter', stopAutoSlide);
  slider.addEventListener('mouseleave', startAutoSlide);

  // Touch swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  });

  window.addEventListener('resize', () => {
    totalSlides = getTotalSlides();
    currentSlide = 0;
    createDots();
    goToSlide(0);
  });

  createDots();
  startAutoSlide();
}

/* ══════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  $$('.reveal').forEach(el => observer.observe(el));
}

/* ══════════════════════════════════
   NEWSLETTER
══════════════════════════════════ */
function handleNewsletter(e) {
  e.preventDefault();
  const email = $('#newsletterEmail').value;
  if (!email) return;
  showToast(`🎉 Subscribed! Check ${email} for your 10% discount code.`, '🎉');
  $('#newsletterEmail').value = '';
}
window.handleNewsletter = handleNewsletter;

/* ══════════════════════════════════
   HERO PARALLAX
══════════════════════════════════ */
function initParallax() {
  const heroBg = $('.hero-bg');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

/* ══════════════════════════════════
   SMOOTH SCROLL FOR NAV LINKS
══════════════════════════════════ */
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════
   KEYBOARD ACCESSIBILITY
══════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (isCartOpen) closeCart();
    if (currentModal) closeModal();
    if (isSearchOpen) {
      isSearchOpen = false;
      $('#searchBar').classList.remove('open');
    }
  }
});

/* ══════════════════════════════════
   WISHLIST ICON BADGE
══════════════════════════════════ */
function updateWishlistIcon() {
  const btn = $('#wishlistBtn');
  const icon = btn.querySelector('i');
  if (wishlist.length > 0) {
    icon.className = 'fa-solid fa-heart';
    btn.style.color = '#ff6b6b';
  } else {
    icon.className = 'fa-regular fa-heart';
    btn.style.color = '';
  }
}

$('#wishlistBtn').addEventListener('click', () => {
  if (wishlist.length === 0) {
    showToast('Your wishlist is empty! ❤️', '❤️');
  } else {
    showToast(`You have ${wishlist.length} item(s) in your wishlist! ❤️`, '❤️');
  }
});

/* ══════════════════════════════════
   HERO BG ANIMATION
══════════════════════════════════ */
window.addEventListener('load', () => {
  const heroBg = $('.hero-bg');
  if (heroBg) {
    setTimeout(() => {
      heroBg.style.transform = 'scale(1)';
    }, 100);
  }
});

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const isOffersPage = window.location.pathname.includes('offers.html');
  const defaultFilter = isOffersPage ? 'sale' : 'all';
  const filterParam = urlParams.get('filter') || defaultFilter;

  // Set active class on filter tab if they exist
  const tabs = $$('.filter-tab');
  if (tabs.length > 0) {
    tabs.forEach(t => {
      t.classList.toggle('active', t.dataset.filter === filterParam);
    });
  }

  renderProducts(filterParam);
  updateCartUI();
  startCountdown();
  initReveal();
  initParallax();

  // Init slider after short delay so DOM is ready
  setTimeout(initSlider, 100);

  // Re-run observer for dynamically added elements
  setTimeout(initReveal, 200);
});
