/* ═══════════════════════════════════════════════
   STEPZ — Footwear E-Commerce App Logic
═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   PRODUCT DATA (now loaded from MySQL via PHP API)
══════════════════════════════════ */
// Change this if your XAMPP setup / folder name is different
const API_URL = 'http://localhost/stepz-api/get_products.php';

let PRODUCTS = [];

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    PRODUCTS = await res.json();
  } catch (err) {
    console.error('Failed to load products from API:', err);
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = '<p style="padding:40px;text-align:center;color:red;">⚠️ Could not load products. Make sure XAMPP (Apache + MySQL) is running.</p>';
    }
  }
}

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

  $$('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.productId);
      if (id) {
        window.location.href = `product-details.html?id=${id}`;
      }
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
   PRODUCT DETAILS PAGE LOGIC
   ══════════════════════════════════ */
let sessionReviews = JSON.parse(localStorage.getItem('stepz-custom-reviews') || '{}');

function getReviewsForProduct(product) {
  const templateReviews = [
    { name: 'Kasun Perera', rating: 5, date: '2026-06-12', title: 'Perfect purchase!', text: 'Got my shoes in perfect shape. Very comfortable for everyday wear. Delivery was faster than expected!' },
    { name: 'Dilshan Silva', rating: 5, date: '2026-06-25', title: 'Fits like a glove', text: 'Amazing cushion and stylish design. Walked in these for hours without any pain.' },
    { name: 'Nimesha Fernando', rating: 4, date: '2026-07-02', title: 'Excellent, but slightly large', text: 'Superb quality and premium materials. Only downside is it fits a tiny bit larger than my usual UK size, so maybe order half a size down.' },
    { name: 'Amara Jayasinghe', rating: 5, date: '2026-07-10', title: 'Top tier quality', text: 'Highly recommend this footwear. Sizing is perfect. Authentic packaging too!' },
    { name: 'Ruwan Kumara', rating: 4, date: '2026-07-15', title: 'Good value for money', text: 'The sole feels extremely durable. Nice aesthetics and matches many outfits.' },
    { name: 'Sajani Alwis', rating: 3, date: '2026-07-18', title: 'Decent, but sole is stiff', text: 'Looks identical to pictures. The sole is a bit stiff at first, but gets better after breaking them in.' }
  ];

  const count = (product.id % 3) + 2;
  const selected = [];
  for (let i = 0; i < count; i++) {
    const idx = (product.id + i * 2) % templateReviews.length;
    const item = { ...templateReviews[idx] };
    if (!selected.some(r => r.text === item.text)) {
      selected.push(item);
    }
  }

  selected.forEach(r => {
    if (product.rating >= 4.8) {
      r.rating = Math.max(4, r.rating);
    } else if (product.rating < 4.5) {
      r.rating = Math.min(3, r.rating);
    }
  });

  const key = `product-${product.id}`;
  if (sessionReviews[key]) {
    selected.unshift(...sessionReviews[key]);
  }

  return selected;
}

function initProductReviews(product) {
  const toggleFormBtn = $('#toggleReviewFormBtn');
  const formContainer = $('#reviewFormContainer');
  const cancelFormBtn = $('#cancelReviewBtn');
  const reviewForm = $('#productReviewForm');
  const formStars = $$('#formStars i');
  const formRatingInput = $('#formRatingInput');

  if (toggleFormBtn && formContainer) {
    toggleFormBtn.addEventListener('click', () => {
      const isHidden = formContainer.style.display === 'none';
      formContainer.style.display = isHidden ? 'block' : 'none';
      toggleFormBtn.textContent = isHidden ? 'Cancel' : 'Write a Review';
    });
  }

  if (cancelFormBtn && formContainer && toggleFormBtn) {
    cancelFormBtn.addEventListener('click', () => {
      formContainer.style.display = 'none';
      toggleFormBtn.textContent = 'Write a Review';
    });
  }

  // Interactive stars hover/click logic
  if (formStars.length > 0) {
    formStars.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        formStars.forEach((s, idx) => {
          s.classList.toggle('hover', idx <= index);
        });
      });
      
      star.addEventListener('mouseleave', () => {
        formStars.forEach(s => s.classList.remove('hover'));
      });
      
      star.addEventListener('click', () => {
        const val = index + 1;
        formRatingInput.value = val;
        formStars.forEach((s, idx) => {
          if (idx < val) {
            s.className = 'fa-solid fa-star active';
          } else {
            s.className = 'fa-regular fa-star';
          }
        });
      });
    });
  }

  function updateReviewsView() {
    const reviewsList = getReviewsForProduct(product);

    // Calculate rating breakdowns
    const breakdownGrid = $('#rating-breakdown');
    if (breakdownGrid) {
      breakdownGrid.innerHTML = '';
      for (let star = 5; star >= 1; star--) {
        const starCount = reviewsList.filter(r => r.rating === star).length;
        const pct = reviewsList.length > 0 ? Math.round((starCount / reviewsList.length) * 100) : 0;
        
        const row = document.createElement('div');
        row.className = 'rating-bar-row';
        row.innerHTML = `
          <div class="rating-bar-label">${star} <span>★</span></div>
          <div class="rating-bar-progress">
            <div class="rating-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="rating-bar-percent">${pct}%</div>
        `;
        breakdownGrid.appendChild(row);
      }
    }

    // Recalculate average rating & counts
    const totalRating = reviewsList.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviewsList.length > 0 ? (totalRating / reviewsList.length).toFixed(1) : '0.0';

    const avgVal = $('#avg-rating-value');
    const avgStars = $('#avg-rating-stars');
    const totCount = $('#total-reviews-count');
    const revCountHeader = $('#reviews-count-header');
    const detailStars = $('#detail-stars');
    const reviewJump = $('#review-jump-link');

    if (avgVal) avgVal.textContent = avgRating;
    if (avgStars) avgStars.textContent = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
    if (totCount) totCount.textContent = `Based on ${reviewsList.length} reviews`;
    if (revCountHeader) revCountHeader.textContent = reviewsList.length;
    if (detailStars) detailStars.textContent = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
    if (reviewJump) reviewJump.textContent = `(${reviewsList.length} reviews)`;

    // Populate reviews list
    const reviewsFeed = $('#reviewsFeed');
    if (reviewsFeed) {
      reviewsFeed.innerHTML = '';
      if (reviewsList.length === 0) {
        reviewsFeed.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">No reviews yet. Be the first to write one!</p>';
      } else {
        reviewsList.forEach(r => {
          const item = document.createElement('div');
          item.className = 'review-item-card';
          
          let dateStr = r.date;
          try {
            dateStr = new Date(r.date).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
          } catch(e) {}

          item.innerHTML = `
            <div class="review-item-header">
              <div class="review-item-user">
                <div class="user-avatar-circle">${r.name.charAt(0)}</div>
                <div class="user-name-title">
                  <span class="username">${r.name}</span>
                  <span class="user-date">${dateStr}</span>
                </div>
              </div>
              <div class="review-item-rating">
                <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
              </div>
            </div>
            <div class="review-item-body">
              <h4>${r.title}</h4>
              <p>${r.text}</p>
            </div>
          `;
          reviewsFeed.appendChild(item);
        });
      }
    }
  }

  // Handle Form Submit
  if (reviewForm) {
    reviewForm.onsubmit = (e) => {
      e.preventDefault();
      const rating = parseInt(formRatingInput.value);
      if (!rating) {
        showToast('Please select a star rating!', '⚠️');
        return;
      }
      const name = $('#reviewName').value;
      const title = $('#reviewTitle').value;
      const comment = $('#reviewComment').value;
      
      const newReview = {
        name: name,
        rating: rating,
        date: new Date().toISOString().split('T')[0],
        title: title,
        text: comment
      };

      const key = `product-${product.id}`;
      if (!sessionReviews[key]) {
        sessionReviews[key] = [];
      }
      sessionReviews[key].unshift(newReview);
      localStorage.setItem('stepz-custom-reviews', JSON.stringify(sessionReviews));

      showToast('Thank you! Review submitted successfully.', '🎉');
      reviewForm.reset();
      formRatingInput.value = '';
      formStars.forEach(s => s.className = 'fa-regular fa-star');
      if (formContainer) formContainer.style.display = 'none';
      if (toggleFormBtn) toggleFormBtn.textContent = 'Write a Review';

      updateReviewsView();
    };
  }

  updateReviewsView();
}

async function initProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = urlParams.get('id');
  if (!idParam) {
    window.location.href = 'products.html';
    return;
  }
  const id = parseInt(idParam);
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) {
    const container = $('.product-details-section .container');
    if (container) {
      container.innerHTML = `<div style="text-align:center;padding:100px 0;">
        <h2>⚠️ Product Not Found</h2>
        <p style="color:var(--text-secondary);margin:16px 0 24px;">The product you are looking for does not exist or has been removed.</p>
        <a href="products.html" class="btn-primary" style="padding:14px 28px;border-radius:var(--radius-md);display:inline-block;">Back to Products</a>
      </div>`;
    }
    return;
  }

  // Populate Breadcrumb
  const breadcrumbCurrent = $('#breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

  // Populate Basic Details
  const detailBrand = $('#detail-brand');
  const detailName = $('#detail-name');
  const detailPriceCurrent = $('#detail-price-current');
  const detailPriceOld = $('#detail-price-old');
  const detailSavingBadge = $('#detail-saving-badge');
  const detailDescription = $('#detail-description');

  if (detailBrand) detailBrand.textContent = product.brand;
  if (detailName) detailName.textContent = product.name;
  if (detailPriceCurrent) detailPriceCurrent.textContent = formatPrice(product.price);
  if (detailPriceOld) {
    if (product.oldPrice) {
      detailPriceOld.textContent = formatPrice(product.oldPrice);
      detailPriceOld.style.display = 'inline';
      if (detailSavingBadge) {
        const savingPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        detailSavingBadge.textContent = `Save ${savingPercent}%`;
        detailSavingBadge.style.display = 'inline-block';
      }
    } else {
      detailPriceOld.style.display = 'none';
      if (detailSavingBadge) detailSavingBadge.style.display = 'none';
    }
  }
  if (detailDescription) detailDescription.textContent = product.description;

  // Populate Specs tab content
  const specBrand = $('#spec-brand');
  const specCategory = $('#spec-category');
  const specSizes = $('#spec-sizes');
  const tabDescContent = $('#tab-desc-content');

  if (specBrand) specBrand.textContent = product.brand;
  if (specCategory) specCategory.textContent = product.category.toUpperCase();
  if (specSizes) specSizes.textContent = product.sizes.join(', ');
  if (tabDescContent) tabDescContent.textContent = product.description;

  // Stock Status Indicator
  const stockBadge = $('#stock-badge');
  if (stockBadge) {
    if (!product.inStock) {
      stockBadge.className = 'stock-badge out-of-stock';
      stockBadge.innerHTML = `<span class="dot"></span>Out of Stock`;
    } else if (product.id % 2 === 0) {
      stockBadge.className = 'stock-badge low-stock';
      stockBadge.innerHTML = `<span class="dot"></span>Only 3 Left!`;
    } else {
      stockBadge.className = 'stock-badge in-stock';
      stockBadge.innerHTML = `<span class="dot"></span>In Stock`;
    }
  }

  // Populate Gallery
  const mainImg = $('#main-product-img');
  const thumbnailGrid = $('#thumbnailGrid');
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  if (thumbnailGrid) {
    thumbnailGrid.innerHTML = '';
    const angles = [
      { name: 'Side View', style: 'transform: none;' },
      { name: 'Angle View', style: 'transform: scaleX(-1) rotate(-5deg);' },
      { name: 'Top View', style: 'transform: rotate(20deg);' },
      { name: 'Detail View', style: 'transform: scale(1.3) translateY(10px);' }
    ];

    angles.forEach((angle, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumbnail' + (i === 0 ? ' active' : '');
      thumb.title = angle.name;
      thumb.innerHTML = `<img src="${product.image}" alt="${angle.name}" style="${angle.style}">`;
      thumb.addEventListener('click', () => {
        $$('.thumbnail').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        if (mainImg) {
          mainImg.src = product.image;
          mainImg.style.cssText = angle.style;
        }
      });
      thumbnailGrid.appendChild(thumb);
    });
  }

  // Magnifier zoom effect on main image hover
  const mainImgContainer = $('#mainImgContainer');
  if (mainImgContainer && mainImg) {
    mainImgContainer.addEventListener('mousemove', (e) => {
      const rect = mainImgContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      const activeThumb = $('.thumbnail.active');
      const isZoomThumb = activeThumb && activeThumb.title === 'Detail View';
      mainImg.style.transform = isZoomThumb ? 'scale(2.2)' : 'scale(1.7)';
    });

    mainImgContainer.addEventListener('mouseleave', () => {
      mainImg.style.transformOrigin = 'center center';
      const activeThumb = $('.thumbnail.active');
      const isZoomThumb = activeThumb && activeThumb.title === 'Detail View';
      mainImg.style.transform = isZoomThumb ? 'scale(1.3) translateY(10px)' : 'none';
    });
  }

  // Populate sizes grid
  const sizeGrid = $('#detail-size-grid');
  if (sizeGrid) {
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
  }

  // Size Guide trigger
  const sizeGuideBtn = $('#sizeGuideBtn');
  const sizeGuideClose = $('#sizeGuideClose');
  const sizeGuideModal = $('#sizeGuideModalOverlay');
  if (sizeGuideBtn && sizeGuideModal) {
    sizeGuideBtn.addEventListener('click', () => sizeGuideModal.classList.add('open'));
  }
  if (sizeGuideClose && sizeGuideModal) {
    sizeGuideClose.addEventListener('click', () => sizeGuideModal.classList.remove('open'));
  }
  if (sizeGuideModal) {
    sizeGuideModal.addEventListener('click', (e) => {
      if (e.target === sizeGuideModal) sizeGuideModal.classList.remove('open');
    });
  }

  // Bind Add to Cart & Buy Now buttons
  const addToCartBtn = $('#detail-add-to-cart-btn');
  const buyNowBtn = $('#detail-buy-now-btn');
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      const selectedSizeBtn = $('.size-btn.selected');
      const size = selectedSizeBtn ? Number(selectedSizeBtn.textContent) : product.sizes[0];
      addToCart(product.id, size);
      setTimeout(() => openCart(), 500);
    };
  }
  if (buyNowBtn) {
    buyNowBtn.onclick = () => {
      const selectedSizeBtn = $('.size-btn.selected');
      const size = selectedSizeBtn ? Number(selectedSizeBtn.textContent) : product.sizes[0];
      addToCart(product.id, size);
      setTimeout(() => {
        openCart();
        handleCheckout();
      }, 500);
    };
  }

  // Wishlist bindings
  const wishlistBtn = $('#detail-wishlist-btn');
  if (wishlistBtn) {
    const checkWishlistState = () => {
      const isWishlisted = wishlist.includes(product.id);
      wishlistBtn.classList.toggle('wishlisted', isWishlisted);
      wishlistBtn.innerHTML = `<i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>`;
    };
    checkWishlistState();
    wishlistBtn.onclick = () => {
      toggleWishlist(product.id, wishlistBtn);
      checkWishlistState();
      updateWishlistIcon();
    };
  }

  // Info Tabs functionality
  const tabBtns = $$('.tab-btn');
  const tabPanes = $$('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const paneId = btn.dataset.tab;
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Related Products Loading
  const relatedGrid = $('#relatedGrid');
  if (relatedGrid) {
    relatedGrid.innerHTML = '';
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    if (related.length < 4) {
      const extra = PRODUCTS.filter(p => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length);
      related.push(...extra);
    }

    related.forEach((p, i) => {
      const isWishlisted = wishlist.includes(p.id);
      const card = document.createElement('div');
      card.className = 'product-card reveal visible';
      card.style.transitionDelay = `${i * 0.08}s`;
      card.dataset.productId = p.id;
      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="product-badge badge-${p.badge}">${p.badge ? p.badge.toUpperCase() : ''}</div>
          <div class="product-actions">
            <button class="action-btn wishlist-toggle ${isWishlisted ? 'wishlisted' : ''}" data-id="${p.id}">
              <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <button class="action-btn quick-view-btn" data-id="${p.id}">
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
            </div>
            <button class="add-cart-btn" data-id="${p.id}">+</button>
          </div>
        </div>
      `;
      relatedGrid.appendChild(card);
    });

    bindProductEvents();
  }

  // Sharing links setup
  const currentURL = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`Check out the awesome ${product.brand} ${product.name} on STEPZ: `);
  
  const shWhatsApp = $('#share-whatsapp');
  const shFacebook = $('#share-facebook');
  const shTwitter = $('#share-twitter');
  const shCopy = $('#share-copy');

  if (shWhatsApp) shWhatsApp.href = `https://api.whatsapp.com/send?text=${shareText}${currentURL}`;
  if (shFacebook) shFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${currentURL}`;
  if (shTwitter) shTwitter.href = `https://twitter.com/intent/tweet?text=${shareText}&url=${currentURL}`;
  
  if (shCopy) {
    shCopy.onclick = (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToast('Product link copied to clipboard! 📋', '✅'))
        .catch(err => console.error('Failed to copy text: ', err));
    };
  }

  // Reviews System
  initProductReviews(product);
}

/* ══════════════════════════════════
   HERO PARALLAX
══════════════════════════════════ */
function initParallax() {
  const heroBg = $('.hero-bg');
  if (!heroBg) return;
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
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
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

  await loadProducts();   // fetch from MySQL (via PHP API) before rendering

  if (window.location.pathname.includes('product-details.html')) {
    await initProductDetails();
  } else {
    renderProducts(filterParam);
  }
  updateCartUI();
  startCountdown();
  initReveal();
  initParallax();

  // Init slider after short delay so DOM is ready
  setTimeout(initSlider, 100);

  // Re-run observer for dynamically added elements
  setTimeout(initReveal, 200);
});
