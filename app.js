/* ═══════════════════════════════════════════════
   STEPZ — Footwear E-Commerce App Logic
═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   PRODUCT DATA (now loaded from MySQL via PHP API)
══════════════════════════════════ */
// Automatically uses whatever host/port this page was loaded from
// (fixes issues when Apache runs on a non-default port like 8080).
const API_BASE = window.location.origin + '/stepz-api/';
const API_URL = API_BASE + 'get_products.php';
const CREATE_ORDER_API = API_BASE + 'create_order.php';
const GET_ORDERS_API = API_BASE + 'get_orders.php';

let PRODUCTS = [];
let PRODUCTS_LOAD_FAILED = false;

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Network response was not ok');
    PRODUCTS = await res.json();
    PRODUCTS_LOAD_FAILED = false;
  } catch (err) {
    console.error('Failed to load products from API:', err);
    PRODUCTS_LOAD_FAILED = true;
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = '<p style="padding:40px;text-align:center;color:red;">⚠️ Could not load products. Make sure XAMPP (Apache + MySQL) is running, and check the browser console for the exact error.</p>';
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

// Safely attach a listener only if the element exists on the current page.
// Prevents one missing element (on a page that doesn't need it) from
// throwing an error and silently breaking ALL the script code after it.
function on(selector, event, handler) {
  const el = typeof selector === 'string' ? $(selector) : selector;
  if (el) el.addEventListener(event, handler);
}

/* ══════════════════════════════════
   DARK / LIGHT MODE
══════════════════════════════════ */
function getTheme() {
  return localStorage.getItem('stepz-theme') === 'light' ? 'light' : 'dark';
}

function applyThemeIcons(theme) {
  const isLight = theme === 'light';
  ['themeToggleIcon', 'mobileThemeToggleIcon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
  const label = document.getElementById('mobileThemeToggleLabel');
  if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  applyThemeIcons(theme);
}

function initTheme() {
  applyTheme(getTheme());
}

function toggleTheme() {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  localStorage.setItem('stepz-theme', next);
  applyTheme(next);
}
window.toggleTheme = toggleTheme;

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
    const badgeText = { new: 'NEW', sale: 'SALE', hot: 'HOT' }[p.badge] || '';

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
function addToCart(productId, size = null, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId && item.size === size);
  if (existingIndex !== -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ ...product, qty: qty, size: size || product.sizes[0] });
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
  if ($('#cartBadge')) $('#cartBadge').textContent = total;
  if ($('#cartCount')) $('#cartCount').textContent = total;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if ($('#cartSubtotal')) $('#cartSubtotal').textContent = formatPrice(subtotal);
  if ($('#cartTotal')) $('#cartTotal').textContent = formatPrice(subtotal);

  if ($('#cartFooter')) $('#cartFooter').style.display = cart.length > 0 ? 'block' : 'none';
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

on('#cartBtn', 'click', openCart);
on('#cartClose', 'click', closeCart);
on('#cartOverlay', 'click', closeCart);

function handleCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', '⚠️');
    return;
  }
  // Redirect to full checkout page
  window.location.href = 'checkout.html';
}
window.handleCheckout = handleCheckout;

/* ══════════════════════════════════
   CHECKOUT PAGE LOGIC
══════════════════════════════════ */
let selectedPaymentMethod = 'cod';
let checkoutDiscount = 0;

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  const payCOD = document.getElementById('payCOD');
  const payCard = document.getElementById('payCard');
  const cardSection = document.getElementById('cardDetailsSection');
  if (payCOD && payCard) {
    payCOD.classList.toggle('active', method === 'cod');
    payCard.classList.toggle('active', method === 'card');
  }
  if (cardSection) {
    cardSection.style.display = method === 'card' ? 'block' : 'none';
  }
}
window.selectPaymentMethod = selectPaymentMethod;

/* Format card number as "1234 5678 9012 3456" */
function formatCardNumberInput(e) {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 16);
  e.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
}

/* Format expiry as "MM/YY" */
function formatCardExpiryInput(e) {
  let digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    e.target.value = digits.slice(0, 2) + '/' + digits.slice(2);
  } else {
    e.target.value = digits;
  }
}

/* CVV: digits only */
function formatCardCvvInput(e) {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
}

/* Validates card fields when Card payment is selected. Returns { valid, cardLast4 } */
function validateCardDetails() {
  const numberEl = document.getElementById('cardNumber');
  const nameEl = document.getElementById('cardName');
  const expiryEl = document.getElementById('cardExpiry');
  const cvvEl = document.getElementById('cardCvv');

  const number = (numberEl?.value || '').replace(/\s/g, '');
  const name = (nameEl?.value || '').trim();
  const expiry = (expiryEl?.value || '').trim();
  const cvv = (cvvEl?.value || '').trim();

  const highlight = (el, bad) => {
    if (!el) return;
    el.style.borderColor = bad ? 'var(--accent2)' : '';
  };

  let valid = true;

  const numberOk = /^\d{13,16}$/.test(number);
  highlight(numberEl, !numberOk);
  if (!numberOk) valid = false;

  const nameOk = name.length >= 2;
  highlight(nameEl, !nameOk);
  if (!nameOk) valid = false;

  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
  let expiryOk = false;
  if (expiryMatch) {
    const mm = parseInt(expiryMatch[1], 10);
    const yy = parseInt(expiryMatch[2], 10);
    const now = new Date();
    const curYY = now.getFullYear() % 100;
    const curMM = now.getMonth() + 1;
    expiryOk = mm >= 1 && mm <= 12 && (yy > curYY || (yy === curYY && mm >= curMM));
  }
  highlight(expiryEl, !expiryOk);
  if (!expiryOk) valid = false;

  const cvvOk = /^\d{3,4}$/.test(cvv);
  highlight(cvvEl, !cvvOk);
  if (!cvvOk) valid = false;

  if (!valid) {
    showToast('Please check your card details', '!');
  }

  return { valid, cardLast4: number.slice(-4) };
}

function applyCheckoutPromo() {
  const code = document.getElementById('chkPromo')?.value.trim().toUpperCase();
  if (code === 'STEPZ15' || code === 'SAVE15') {
    checkoutDiscount = 0.15;
    showToast('Promo code applied! 15% OFF', '✓');
    renderCheckoutSummary();
  } else if (code) {
    showToast('Invalid promo code', '!');
  }
}
window.applyCheckoutPromo = applyCheckoutPromo;

function renderCheckoutSummary() {
  const summaryContainer = document.getElementById('checkoutSummaryItems');
  if (!summaryContainer) return;

  const cartItems = JSON.parse(localStorage.getItem('stepz-cart') || '[]');
  if (cartItems.length === 0) {
    summaryContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:12px">Your cart is empty. <a href="products.html" style="color:var(--accent)">Browse products</a></p>';
    return;
  }

  summaryContainer.innerHTML = cartItems.map(item => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-glass)">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;background:var(--bg-glass)">
        <div>
          <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary)">${item.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">Size: UK ${item.size} • Qty: ${item.qty}</div>
        </div>
      </div>
      <div style="font-weight:700;color:var(--accent);font-size:0.9rem">Rs. ${(item.price * item.qty).toLocaleString()}</div>
    </div>
  `).join('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmt = Math.round(subtotal * checkoutDiscount);
  const shipping = subtotal > 5000 ? 0 : 350;
  const grandTotal = subtotal - discountAmt + shipping;

  const subEl = document.getElementById('summarySubtotal');
  const discEl = document.getElementById('summaryDiscount');
  const shipEl = document.getElementById('summaryShipping');
  const grandEl = document.getElementById('summaryGrandTotal');

  if (subEl) subEl.textContent = 'Rs. ' + subtotal.toLocaleString();
  if (discEl) discEl.textContent = '- Rs. ' + discountAmt.toLocaleString();
  if (shipEl) shipEl.textContent = shipping === 0 ? 'FREE' : 'Rs. ' + shipping;
  if (grandEl) grandEl.textContent = 'Rs. ' + grandTotal.toLocaleString();
}

function initCheckoutPage() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  renderCheckoutSummary();

  const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
  if (currentUser) {
    const nameInput = document.getElementById('chkFullName');
    const emailInput = document.getElementById('chkEmail');
    const cardNameInput = document.getElementById('cardName');
    if (nameInput && !nameInput.value) nameInput.value = currentUser.name || '';
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    if (cardNameInput && !cardNameInput.value) cardNameInput.value = currentUser.name || '';
  }

  // Card input formatting
  const cardNumberEl = document.getElementById('cardNumber');
  const cardExpiryEl = document.getElementById('cardExpiry');
  const cardCvvEl = document.getElementById('cardCvv');
  if (cardNumberEl) cardNumberEl.addEventListener('input', formatCardNumberInput);
  if (cardExpiryEl) cardExpiryEl.addEventListener('input', formatCardExpiryInput);
  if (cardCvvEl) cardCvvEl.addEventListener('input', formatCardCvvInput);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cartItems = JSON.parse(localStorage.getItem('stepz-cart') || '[]');
    if (cartItems.length === 0) {
      showToast('Your cart is empty!', '!');
      return;
    }

    const name = document.getElementById('chkFullName').value.trim();
    const email = document.getElementById('chkEmail').value.trim();
    const phone = document.getElementById('chkPhone').value.trim();
    const city = document.getElementById('chkCity').value.trim();
    const address = document.getElementById('chkAddress').value.trim();

    if (!name || !email || !phone || !city || !address) {
      showToast('Please fill in all shipping details', '!');
      return;
    }

    let cardLast4 = null;
    if (selectedPaymentMethod === 'card') {
      const cardCheck = validateCardDetails();
      if (!cardCheck.valid) return;
      cardLast4 = cardCheck.cardLast4;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discountAmt = Math.round(subtotal * checkoutDiscount);
    const shipping = subtotal > 5000 ? 0 : 350;
    const grandTotal = subtotal - discountAmt + shipping;

    const submitBtn = document.getElementById('placeOrderBtn');
    const submitBtnText = document.getElementById('placeOrderBtnText');

    // Saves the order straight into the MySQL database via the PHP API.
    // This is the single source of truth now — no more localStorage mock data.
    const finalizeOrder = async () => {
      const orderPayload = {
        name, email, phone, city, address,
        items: cartItems,
        subtotal: subtotal,
        discount: discountAmt,
        shipping: shipping,
        total: grandTotal,
        paymentMethod: selectedPaymentMethod,
        cardLast4: cardLast4
      };

      try {
        const res = await fetch(CREATE_ORDER_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Order could not be saved');
        }

        // Keep a small, transient copy of just-placed order so the
        // confirmation page can show it immediately without another fetch.
        const lastOrder = {
          orderNum: result.orderCode,
          name, email, phone, city, address,
          items: cartItems,
          subtotal, discount: discountAmt, shipping, total: grandTotal,
          paymentMethod: selectedPaymentMethod,
          cardLast4,
          date: new Date().toISOString()
        };
        localStorage.setItem('lastOrder', JSON.stringify(lastOrder));

        // Clear cart state
        cart = [];
        saveCart();
        updateCartUI();

        showToast(selectedPaymentMethod === 'card' ? 'Payment successful! Redirecting...' : 'Order placed successfully! Redirecting...', '✓');
        setTimeout(() => {
          window.location.href = 'order-confirmation.html';
        }, 800);
      } catch (err) {
        console.error('Failed to save order:', err);
        showToast('Could not save your order. Make sure the server (XAMPP) is running and try again.', '!');
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtnText) submitBtnText.textContent = selectedPaymentMethod === 'card' ? 'Pay & Place Order' : 'Place Order';
      }
    };

    if (selectedPaymentMethod === 'card') {
      // Simulate real card payment processing before confirming the order
      if (submitBtn) submitBtn.disabled = true;
      if (submitBtnText) submitBtnText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Payment...';
      showToast('Processing your card payment...', '⏳');
      setTimeout(finalizeOrder, 1600);
    } else {
      finalizeOrder();
    }
  });
}

/* ══════════════════════════════════
   USER NAV & CUSTOMER ORDERS MODAL
══════════════════════════════════ */
function initUserNav() {
  const userBtn = $('#userBtn');
  const mobileUserBtn = $('#mobileUserBtn');
  const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');

  if (currentUser) {
    const isAd = currentUser.role === 'admin';

    if (userBtn) {
      userBtn.setAttribute('title', isAd ? 'Admin Dashboard' : `Logged in as ${currentUser.name}`);
      userBtn.href = isAd ? 'admin/index.html' : 'account.html';
      userBtn.onclick = null;
      userBtn.style.background = isAd ? 'rgba(245,166,35,0.15)' : 'rgba(0,221,136,0.15)';
      userBtn.style.borderColor = isAd ? 'var(--accent)' : 'var(--green)';
      userBtn.style.color = isAd ? 'var(--accent)' : 'var(--green)';

      userBtn.innerHTML = isAd
        ? `<i class="fa-solid fa-user-shield"></i>`
        : currentUser.avatar
          ? `<img src="${currentUser.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
          : `<span style="font-weight:700;font-size:1rem;">${currentUser.name.trim().charAt(0).toUpperCase()}</span>`;
    }

    if (mobileUserBtn) {
      mobileUserBtn.textContent = isAd ? 'Admin Dashboard' : `My Account (${currentUser.name})`;
      mobileUserBtn.href = isAd ? 'admin/index.html' : 'account.html';
      mobileUserBtn.onclick = null;
    }
  } else {
    if (userBtn) {
      userBtn.setAttribute('title', 'Login / Account');
      userBtn.href = 'login.html';
      userBtn.style.background = '';
      userBtn.style.borderColor = '';
      userBtn.style.color = '';
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
    }
    if (mobileUserBtn) {
      mobileUserBtn.textContent = 'Login / Account';
      mobileUserBtn.href = 'login.html';
    }
  }

  // Setup Close listener for Customer Orders Modal
  const modalClose = $('#customerOrdersModalClose');
  const modalOverlay = $('#customerOrdersModalOverlay');
  if (modalClose) modalClose.onclick = closeCustomerOrdersModal;
  if (modalOverlay) {
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeCustomerOrdersModal();
    };
  }
}

// Fetches a customer's own orders straight from the database.
async function fetchCustomerOrders(email) {
  try {
    const res = await fetch(GET_ORDERS_API + '?email=' + encodeURIComponent(email));
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (err) {
    console.error('Failed to load orders from API:', err);
    return null; // null = load failed (distinct from an empty array)
  }
}

function renderOrderHistoryList(userOrders) {
  if (userOrders === null) {
    return `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:10px"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <p style="font-size:1rem;color:var(--text-secondary)">Could not load your orders.</p>
        <p style="font-size:0.85rem">Make sure the server (XAMPP) is running, then refresh.</p>
      </div>`;
  }

  if (userOrders.length === 0) {
    return `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:10px"><i class="fa-solid fa-box-open" style="color:var(--text-muted)"></i></div>
        <p style="font-size:1rem;color:var(--text-secondary)">No orders placed yet.</p>
        <p style="font-size:0.85rem">Start shopping and place your first order!</p>
      </div>`;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${userOrders.map(o => `
        <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:12px;padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px dashed var(--border-glass);padding-bottom:8px">
            <div>
              <span style="font-weight:700;color:var(--accent);font-size:1rem">${o.id}</span>
              <span style="font-size:0.8rem;color:var(--text-muted);margin-left:10px">${o.date}</span>
            </div>
            <span style="padding:4px 10px;border-radius:12px;font-size:0.75rem;font-weight:700;text-transform:uppercase;
              background:${o.status === 'delivered' ? 'rgba(0,221,136,0.15)' : o.status === 'shipped' ? 'rgba(77,166,255,0.15)' : 'rgba(245,166,35,0.15)'};
              color:${o.status === 'delivered' ? 'var(--green)' : o.status === 'shipped' ? 'var(--blue)' : 'var(--accent)'};">
              ${o.status}
            </span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px">
            ${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.9rem;font-weight:600;color:var(--text-primary)">
            <span>Total Paid:</span>
            <span style="color:var(--accent)">Rs. ${Number(o.total).toLocaleString('en-LK')}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function openCustomerOrdersModal() {
  const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const overlay = $('#customerOrdersModalOverlay');
  const body = $('#customerOrdersModalBody');
  if (!overlay || !body) return;
  overlay.classList.add('open');

  body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;margin-bottom:20px;border:1px solid var(--border-glass)">
      <div>
        <h3 style="color:var(--text-primary);font-size:1.1rem">${currentUser.name}</h3>
        <p style="font-size:0.85rem;color:var(--text-muted)"><i class="fa-solid fa-envelope"></i> ${currentUser.email} • Role: <strong style="color:var(--accent);text-transform:capitalize">${currentUser.role}</strong></p>
      </div>
      <button onclick="logoutCustomer()" style="background:rgba(255,107,107,0.15);color:var(--accent2);border:1px solid rgba(255,107,107,0.3);padding:8px 14px;border-radius:8px;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </button>
    </div>

    <h4 style="font-size:1rem;color:var(--text-primary);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <i class="fa-solid fa-clock-rotate-left" style="color:var(--accent)"></i> My Order History
    </h4>

    <div id="customerOrdersListArea" style="text-align:center;padding:30px;color:var(--text-muted)">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading your orders...
    </div>
  `;

  const userOrders = await fetchCustomerOrders(currentUser.email);
  const listArea = $('#customerOrdersListArea');
  if (listArea) listArea.outerHTML = `<div id="customerOrdersListArea">${renderOrderHistoryList(userOrders)}</div>`;
}

function closeCustomerOrdersModal() {
  const overlay = $('#customerOrdersModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

function logoutCustomer() {
  localStorage.removeItem('stepz-current-user');
  closeCustomerOrdersModal();
  showToast('Logged out successfully');
  const onAccountPage = window.location.pathname.includes('account.html');
  setTimeout(() => {
    window.location.href = onAccountPage ? 'login.html' : window.location.href;
    if (!onAccountPage) window.location.reload();
  }, 600);
}

window.openCustomerOrdersModal = openCustomerOrdersModal;
window.closeCustomerOrdersModal = closeCustomerOrdersModal;
window.logoutCustomer = logoutCustomer;

/* ══════════════════════════════════
   ACCOUNT PAGE (account.html)
══════════════════════════════════ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function renderAccountAvatar(user) {
  const avatarEl = $('#accAvatar');
  if (!avatarEl) return;
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" alt="Profile photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  } else {
    avatarEl.textContent = (user.name || '?').trim().charAt(0).toUpperCase();
  }
}

/* Merges updates into both the active session user AND the persisted
   stepz-users record, so profile edits survive logout/login. */
function persistUserUpdate(updates) {
  let currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
  if (!currentUser) return null;
  const originalEmail = currentUser.email;

  currentUser = { ...currentUser, ...updates };
  localStorage.setItem('stepz-current-user', JSON.stringify(currentUser));

  let users = JSON.parse(localStorage.getItem('stepz-users') || '[]');
  users = users.map(u => u.email.toLowerCase() === originalEmail.toLowerCase() ? { ...u, ...updates } : u);
  localStorage.setItem('stepz-users', JSON.stringify(users));

  return currentUser;
}

/* Reads an uploaded image file, center-crops + downsizes it to a square
   JPEG data URL (keeps localStorage usage small), then saves it. */
function handleAvatarFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please choose an image file', '!');
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast('Image is too large (max 8MB)', '!');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const size = 240;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const updated = persistUserUpdate({ avatar: dataUrl });
      if (updated) {
        renderAccountAvatar(updated);
        showToast('Profile picture updated!', '✓');
        if (typeof initUserNav === 'function') initUserNav();
      }
    };
    img.onerror = () => showToast('Could not read that image', '!');
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function initAccountPage() {
  const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');

  // Guard: not logged in -> send to login
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const nameEl = $('#accName');
  const emailEl = $('#accEmail');
  renderAccountAvatar(currentUser);
  if (nameEl) nameEl.textContent = currentUser.name;
  if (emailEl) emailEl.textContent = currentUser.email;

  const avatarBtn = $('#accAvatarEditBtn');
  const avatarInput = $('#accAvatarInput');
  if (avatarBtn && avatarInput) {
    avatarBtn.onclick = () => avatarInput.click();
    avatarInput.onchange = (e) => handleAvatarFile(e.target.files[0]);
  }

  switchAccountTab('orders');
}

async function switchAccountTab(tab) {
  const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  ['Orders', 'Profile', 'Addresses'].forEach(t => {
    const btn = $(`#btnTab${t}`);
    if (btn) btn.classList.toggle('active', t.toLowerCase() === tab);
  });

  const body = $('#accountTabBody');
  if (!body) return;

  if (tab === 'orders') {
    body.innerHTML = `
      <h4 style="font-size:1.1rem;color:var(--text-primary);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <i class="fa-solid fa-clock-rotate-left" style="color:var(--accent)"></i> My Order History
      </h4>
      <div id="accountOrdersListArea" style="text-align:center;padding:30px;color:var(--text-muted)">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading your orders...
      </div>
    `;

    const userOrders = await fetchCustomerOrders(currentUser.email);
    const listArea = $('#accountOrdersListArea');
    if (listArea) listArea.outerHTML = `<div id="accountOrdersListArea">${renderOrderHistoryList(userOrders)}</div>`;
  } else if (tab === 'profile') {
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h4 style="font-size:1.1rem;color:var(--text-primary);display:flex;align-items:center;gap:8px;margin:0">
          <i class="fa-solid fa-user-gear" style="color:var(--accent)"></i> Personal Profile
        </h4>
        <button type="button" id="profileEditToggleBtn" class="btn-ghost" style="padding:8px 16px;font-size:0.85rem" onclick="toggleProfileEdit()">
          <i class="fa-solid fa-pen"></i> Edit
        </button>
      </div>
      <form id="profileEditForm" style="display:flex;flex-direction:column;gap:14px;max-width:420px">
        <div>
          <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:6px">Full Name</label>
          <input type="text" id="profileNameInput" value="${escapeHtml(currentUser.name)}" disabled
            style="width:100%;background:var(--bg-card);border:1px solid var(--border-glass);border-radius:10px;padding:12px 14px;color:var(--text-primary);font-family:inherit;font-size:0.95rem">
        </div>
        <div>
          <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:6px">Email Address</label>
          <input type="email" id="profileEmailInput" value="${escapeHtml(currentUser.email)}" disabled
            style="width:100%;background:var(--bg-card);border:1px solid var(--border-glass);border-radius:10px;padding:12px 14px;color:var(--text-primary);font-family:inherit;font-size:0.95rem">
        </div>
        <div>
          <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:6px">Phone Number</label>
          <input type="text" id="profilePhoneInput" value="${escapeHtml(currentUser.phone || '')}" disabled
            style="width:100%;background:var(--bg-card);border:1px solid var(--border-glass);border-radius:10px;padding:12px 14px;color:var(--text-primary);font-family:inherit;font-size:0.95rem">
        </div>
        <div>
          <label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:6px">Account Type</label>
          <div style="background:var(--bg-card);border:1px solid var(--border-glass);border-radius:10px;padding:12px 14px;color:var(--text-primary);text-transform:capitalize">${currentUser.role}</div>
        </div>
        <button type="submit" id="profileSaveBtn" class="btn-primary" style="display:none;width:fit-content;padding:10px 24px;margin-top:4px">
          <i class="fa-solid fa-check"></i> Save Changes
        </button>
      </form>
    `;

    $('#profileEditForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#profileNameInput').value.trim();
      const email = $('#profileEmailInput').value.trim();
      const phone = $('#profilePhoneInput').value.trim();

      if (!name || name.length < 2) {
        showToast('Please enter a valid name', '!');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email', '!');
        return;
      }

      const users = JSON.parse(localStorage.getItem('stepz-users') || '[]');
      const clash = users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.email.toLowerCase() !== currentUser.email.toLowerCase()
      );
      if (clash) {
        showToast('That email is already in use by another account', '!');
        return;
      }

      const updated = persistUserUpdate({ name, email, phone });
      if (updated) {
        showToast('Profile updated successfully!', '✓');
        if ($('#accName')) $('#accName').textContent = updated.name;
        if ($('#accEmail')) $('#accEmail').textContent = updated.email;
        renderAccountAvatar(updated);
        if (typeof initUserNav === 'function') initUserNav();
        switchAccountTab('profile');
      }
    });
  } else if (tab === 'addresses') {
    body.innerHTML = `
      <h4 style="font-size:1.1rem;color:var(--text-primary);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
        <i class="fa-solid fa-location-dot" style="color:var(--accent)"></i> Saved Addresses
      </h4>
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:10px"><i class="fa-solid fa-map-location-dot"></i></div>
        <p style="font-size:1rem;color:var(--text-secondary)">No saved addresses yet.</p>
        <p style="font-size:0.85rem">Addresses you use at checkout will appear here.</p>
      </div>
    `;
  }
}

window.switchAccountTab = switchAccountTab;

function toggleProfileEdit(forceState) {
  const ids = ['profileNameInput', 'profileEmailInput', 'profilePhoneInput'];
  const inputs = ids.map(id => $('#' + id));
  if (!inputs[0]) return;

  const editing = forceState !== undefined ? forceState : inputs[0].disabled;
  inputs.forEach(inp => { if (inp) inp.disabled = !editing; });

  const toggleBtn = $('#profileEditToggleBtn');
  const saveBtn = $('#profileSaveBtn');
  if (toggleBtn) toggleBtn.innerHTML = editing ? '<i class="fa-solid fa-xmark"></i> Cancel' : '<i class="fa-solid fa-pen"></i> Edit';
  if (saveBtn) saveBtn.style.display = editing ? 'inline-flex' : 'none';

  if (!editing) {
    // Cancel: reset fields back to the saved values
    const currentUser = JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
    if (currentUser) {
      if ($('#profileNameInput')) $('#profileNameInput').value = currentUser.name;
      if ($('#profileEmailInput')) $('#profileEmailInput').value = currentUser.email;
      if ($('#profilePhoneInput')) $('#profilePhoneInput').value = currentUser.phone || '';
    }
  } else {
    inputs[0].focus();
  }
}
window.toggleProfileEdit = toggleProfileEdit;

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

on('#modalClose', 'click', closeModal);
on('#modalOverlay', 'click', (e) => {
  if (e.target === $('#modalOverlay')) closeModal();
});

/* ══════════════════════════════════
   NAVBAR
══════════════════════════════════ */
window.addEventListener('scroll', () => {
  const navbar = $('#navbar');
  if (!navbar) return;
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
on('#hamburger', 'click', () => {
  isMobileNavOpen = !isMobileNavOpen;
  $('#hamburger').classList.toggle('active', isMobileNavOpen);
  $('#mobileNav')?.classList.toggle('open', isMobileNavOpen);
  $('#navOverlay')?.classList.toggle('open', isMobileNavOpen);
  document.body.style.overflow = isMobileNavOpen ? 'hidden' : '';
});

on('#navOverlay', 'click', () => {
  isMobileNavOpen = false;
  $('#hamburger')?.classList.remove('active');
  $('#mobileNav')?.classList.remove('open');
  $('#navOverlay')?.classList.remove('open');
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
on('#searchBtn', 'click', () => {
  isSearchOpen = !isSearchOpen;
  $('#searchBar').classList.toggle('open', isSearchOpen);
  if (isSearchOpen) {
    $('#searchInput').focus();
  }
});

on('#searchClose', 'click', () => {
  isSearchOpen = false;
  $('#searchBar').classList.remove('open');
});

on('#searchInput', 'keydown', (e) => {
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

  let currentQty = 1;

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
      addToCart(product.id, size, currentQty);
      setTimeout(() => openCart(), 500);
    };
  }
  if (buyNowBtn) {
    buyNowBtn.onclick = () => {
      const selectedSizeBtn = $('.size-btn.selected');
      const size = selectedSizeBtn ? Number(selectedSizeBtn.textContent) : product.sizes[0];
      addToCart(product.id, size, currentQty);
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

  // Quantity Stepper
  const qtyMinusBtn = $('#qtyMinusBtn');
  const qtyPlusBtn = $('#qtyPlusBtn');
  const qtyValue = $('#qtyValue');
  if (qtyMinusBtn && qtyPlusBtn && qtyValue) {
    qtyMinusBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        qtyValue.textContent = currentQty;
      }
    });
    qtyPlusBtn.addEventListener('click', () => {
      if (currentQty < 10) {
        currentQty++;
        qtyValue.textContent = currentQty;
      }
    });
  }

  // Delivery Estimator
  const deliveryCheckBtn = $('#deliveryCheckBtn');
  const deliveryDistrict = $('#deliveryDistrict');
  const deliveryEstimateResult = $('#deliveryEstimateResult');
  if (deliveryCheckBtn && deliveryDistrict && deliveryEstimateResult) {
    deliveryCheckBtn.addEventListener('click', () => {
      const district = deliveryDistrict.value;
      if (!district) {
        deliveryEstimateResult.innerHTML = `⚠️ Please select your district first.`;
        deliveryEstimateResult.classList.add('show');
        return;
      }
      const isColombo = district === 'colombo' || district === 'gampaha' || district === 'kalutara';
      const minDays = isColombo ? 1 : 2;
      const maxDays = isColombo ? 2 : 4;
      const today = new Date();
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + minDays);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + maxDays);
      const fmt = (d) => d.toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric' });
      const feeText = isColombo ? 'Rs. 350 (FREE over Rs. 5,000)' : 'Rs. 450 (FREE over Rs. 5,000)';
      deliveryEstimateResult.innerHTML = `✅ Estimated delivery: <strong>${fmt(minDate)} – ${fmt(maxDate)}</strong><br>Delivery fee: ${feeText}`;
      deliveryEstimateResult.classList.add('show');
    });
  }

  // Recently Viewed Products
  const RECENTLY_VIEWED_KEY = 'stepz-recently-viewed';
  let recentlyViewed = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  const recentGrid = $('#recentlyViewedGrid');
  const recentSection = $('#recentlyViewedSection');
  if (recentGrid && recentSection) {
    const viewedProducts = recentlyViewed
      .filter(pid => pid !== product.id)
      .map(pid => PRODUCTS.find(p => p.id === pid))
      .filter(Boolean)
      .slice(0, 4);

    if (viewedProducts.length > 0) {
      recentSection.style.display = '';
      recentGrid.innerHTML = '';
      viewedProducts.forEach((p, i) => {
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
        recentGrid.appendChild(card);
      });
      bindProductEvents();
    } else {
      recentSection.style.display = 'none';
    }
  }
  // Track this product as viewed (most recent first, max 8 remembered)
  recentlyViewed = [product.id, ...recentlyViewed.filter(pid => pid !== product.id)].slice(0, 8);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));

  // Sticky Mobile Add-to-Cart Bar
  const stickyCartBar = $('#stickyCartBar');
  const stickyCartName = $('#stickyCartName');
  const stickyCartPrice = $('#stickyCartPrice');
  const stickyCartAddBtn = $('#stickyCartAddBtn');
  if (stickyCartBar && stickyCartName && stickyCartPrice && stickyCartAddBtn) {
    stickyCartName.textContent = product.name;
    stickyCartPrice.textContent = formatPrice(product.price);
    stickyCartAddBtn.onclick = () => {
      const selectedSizeBtn = $('.size-btn.selected');
      const size = selectedSizeBtn ? Number(selectedSizeBtn.textContent) : product.sizes[0];
      addToCart(product.id, size, currentQty);
      setTimeout(() => openCart(), 500);
    };
    const actionButtonsBlock = $('.action-buttons-detail');
    if (actionButtonsBlock) {
      window.addEventListener('scroll', () => {
        const rect = actionButtonsBlock.getBoundingClientRect();
        const isPastActions = rect.bottom < 0;
        stickyCartBar.classList.toggle('visible', isPastActions);
      }, { passive: true });
    }
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
  if (!btn) return;
  const icon = btn.querySelector('i');
  if (wishlist.length > 0) {
    icon.className = 'fa-solid fa-heart';
    btn.style.color = '#ff6b6b';
  } else {
    icon.className = 'fa-regular fa-heart';
    btn.style.color = '';
  }
}

on('#wishlistBtn', 'click', () => {
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
  initTheme();
  initUserNav();
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
  } else if (window.location.pathname.includes('checkout.html')) {
    initCheckoutPage();
  } else if (window.location.pathname.includes('account.html')) {
    initAccountPage();
  } else if (!PRODUCTS_LOAD_FAILED) {
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