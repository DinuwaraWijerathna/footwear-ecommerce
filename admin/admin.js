'use strict';

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Redirect if not admin
(function authGuard() {
  if (!isAdmin()) {
    window.location.href = '../login.html';
  }
})();

function showToast(message, type = 'success') {
  const existing = document.querySelector('.admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function initSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  const overlay = document.querySelector('.sidebar-overlay');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('stepz-current-user');
      window.location.href = '../login.html';
    });
  }

  // Set user info
  const user = getCurrentUser();
  if (user) {
    const nameEl = document.querySelector('.sidebar-user-name');
    const avatarEl = document.querySelector('.sidebar-user-avatar');
    if (nameEl) nameEl.textContent = user.name || 'Admin';
    if (avatarEl) avatarEl.textContent = (user.name || 'A').charAt(0).toUpperCase();
  }
}
function getProducts() {
  let products = JSON.parse(localStorage.getItem('stepz-admin-products') || 'null');
  if (!products) {
    // Seed with default products
    products = [
      { id: 1, brand: 'Nike', name: 'Air Max 270 React', category: 'men', price: 18500, oldPrice: 24000, badge: 'sale', rating: 4.8, reviews: 214, image: '../assets/images/product_mens.png', sizes: '6,7,8,9,10,11,12', description: 'The Nike Air Max 270 React combines two of Nike\'s most innovative cushioning technologies.', inStock: true },
      { id: 2, brand: 'Adidas', name: 'Ultraboost 23', category: 'sport', price: 21000, oldPrice: null, badge: 'new', rating: 4.9, reviews: 187, image: '../assets/images/product_sport.png', sizes: '6,7,8,9,10,11', description: 'Engineered for elite performance with BOOST midsole technology.', inStock: true },
      { id: 3, brand: 'Steve Madden', name: 'Elara Stiletto Heels', category: 'women', price: 9800, oldPrice: 14500, badge: 'sale', rating: 4.7, reviews: 92, image: '../assets/images/product_womens.png', sizes: '4,5,6,7,8,9', description: 'The Elara stiletto is the epitome of elegant femininity.', inStock: true },
      { id: 4, brand: 'Timberland', name: 'Premium Loafer', category: 'casual', price: 13500, oldPrice: null, badge: 'hot', rating: 4.6, reviews: 143, image: '../assets/images/product_casual.png', sizes: '6,7,8,9,10,11,12', description: 'Crafted from full-grain leather with a padded collar.', inStock: true },
      { id: 5, brand: 'Jordan', name: 'Air Jordan 1 Retro High', category: 'men', price: 32000, oldPrice: 38000, badge: 'sale', rating: 4.9, reviews: 512, image: '../assets/images/product_mens.png', sizes: '7,8,9,10,11,12', description: 'The iconic Air Jordan 1 Retro High OG is a classic reimagined.', inStock: true },
      { id: 6, brand: 'Puma', name: 'Nitro Runner Elite', category: 'sport', price: 15800, oldPrice: null, badge: 'new', rating: 4.5, reviews: 76, image: '../assets/images/product_sport.png', sizes: '6,7,8,9,10,11', description: 'Built for speed and endurance with NITRO foam technology.', inStock: true },
      { id: 7, brand: 'Aldo', name: 'Strappy Sandal Heels', category: 'women', price: 7200, oldPrice: 10800, badge: 'sale', rating: 4.4, reviews: 61, image: '../assets/images/product_womens.png', sizes: '4,5,6,7,8', description: 'ALDO Strappy Sandal Heels feature delicate ankle straps.', inStock: true },
      { id: 8, brand: 'Skechers', name: 'Arch Fit Loafer', category: 'casual', price: 8900, oldPrice: 11000, badge: 'sale', rating: 4.6, reviews: 208, image: '../assets/images/product_casual.png', sizes: '6,7,8,9,10,11,12', description: 'Skechers Arch Fit Loafer features an orthopedic insole.', inStock: true }
    ];
    localStorage.setItem('stepz-admin-products', JSON.stringify(products));
  }
  return products;
}

function saveProducts(products) {
  localStorage.setItem('stepz-admin-products', JSON.stringify(products));
}

// Mock Orders
function getOrders() {
  let orders = JSON.parse(localStorage.getItem('stepz-admin-orders') || 'null');
  if (!orders) {
    orders = [
      { id: 'ORD-1001', customer: 'Kamal Perera', email: 'kamal@gmail.com', date: '2026-07-28', items: [{ name: 'Air Max 270 React', qty: 1, price: 18500 }], total: 18500, status: 'delivered' },
      { id: 'ORD-1002', customer: 'Nimali Fernando', email: 'nimali@gmail.com', date: '2026-07-27', items: [{ name: 'Elara Stiletto Heels', qty: 2, price: 9800 }], total: 19600, status: 'shipped' },
      { id: 'ORD-1003', customer: 'Saman Silva', email: 'saman@gmail.com', date: '2026-07-27', items: [{ name: 'Ultraboost 23', qty: 1, price: 21000 }, { name: 'Arch Fit Loafer', qty: 1, price: 8900 }], total: 29900, status: 'processing' },
      { id: 'ORD-1004', customer: 'Dilini Jayawardena', email: 'dilini@gmail.com', date: '2026-07-26', items: [{ name: 'Air Jordan 1 Retro High', qty: 1, price: 32000 }], total: 32000, status: 'pending' },
      { id: 'ORD-1005', customer: 'Ruwan Wickramasinghe', email: 'ruwan@gmail.com', date: '2026-07-26', items: [{ name: 'Premium Loafer', qty: 1, price: 13500 }], total: 13500, status: 'delivered' },
      { id: 'ORD-1006', customer: 'Tharushi Bandara', email: 'tharushi@gmail.com', date: '2026-07-25', items: [{ name: 'Strappy Sandal Heels', qty: 1, price: 7200 }], total: 7200, status: 'cancelled' },
      { id: 'ORD-1007', customer: 'Nuwan Gamage', email: 'nuwan@gmail.com', date: '2026-07-25', items: [{ name: 'Nitro Runner Elite', qty: 2, price: 15800 }], total: 31600, status: 'shipped' },
      { id: 'ORD-1008', customer: 'Sachini Rathnayake', email: 'sachini@gmail.com', date: '2026-07-24', items: [{ name: 'Arch Fit Loafer', qty: 1, price: 8900 }], total: 8900, status: 'delivered' },
      { id: 'ORD-1009', customer: 'Chamara Dissanayake', email: 'chamara@gmail.com', date: '2026-07-24', items: [{ name: 'Air Max 270 React', qty: 1, price: 18500 }, { name: 'Premium Loafer', qty: 1, price: 13500 }], total: 32000, status: 'processing' },
      { id: 'ORD-1010', customer: 'Iresha Kumari', email: 'iresha@gmail.com', date: '2026-07-23', items: [{ name: 'Elara Stiletto Heels', qty: 1, price: 9800 }], total: 9800, status: 'delivered' }
    ];
    localStorage.setItem('stepz-admin-orders', JSON.stringify(orders));
  }
  return orders;
}

function saveOrders(orders) {
  localStorage.setItem('stepz-admin-orders', JSON.stringify(orders));
}

// Customers from registered users
function getCustomers() {
  const users = JSON.parse(localStorage.getItem('stepz-users') || '[]');
  const orders = getOrders();

  // Generate some mock customers beyond registered users
  let customers = [
    { id: 1, name: 'Kamal Perera', email: 'kamal@gmail.com', phone: '+94 77 123 4567', joinDate: '2026-01-15', totalOrders: 3 },
    { id: 2, name: 'Nimali Fernando', email: 'nimali@gmail.com', phone: '+94 71 234 5678', joinDate: '2026-02-20', totalOrders: 5 },
    { id: 3, name: 'Saman Silva', email: 'saman@gmail.com', phone: '+94 76 345 6789', joinDate: '2026-03-10', totalOrders: 2 },
    { id: 4, name: 'Dilini Jayawardena', email: 'dilini@gmail.com', phone: '+94 70 456 7890', joinDate: '2026-04-05', totalOrders: 7 },
    { id: 5, name: 'Ruwan Wickramasinghe', email: 'ruwan@gmail.com', phone: '+94 75 567 8901', joinDate: '2026-04-18', totalOrders: 1 },
    { id: 6, name: 'Tharushi Bandara', email: 'tharushi@gmail.com', phone: '+94 77 678 9012', joinDate: '2026-05-02', totalOrders: 4 },
    { id: 7, name: 'Nuwan Gamage', email: 'nuwan@gmail.com', phone: '+94 71 789 0123', joinDate: '2026-05-22', totalOrders: 2 },
    { id: 8, name: 'Sachini Rathnayake', email: 'sachini@gmail.com', phone: '+94 76 890 1234', joinDate: '2026-06-08', totalOrders: 6 },
    { id: 9, name: 'Chamara Dissanayake', email: 'chamara@gmail.com', phone: '+94 70 901 2345', joinDate: '2026-06-25', totalOrders: 3 },
    { id: 10, name: 'Iresha Kumari', email: 'iresha@gmail.com', phone: '+94 75 012 3456', joinDate: '2026-07-01', totalOrders: 1 }
  ];

  // Add any registered users that aren't already in the list
  users.filter(u => u.role === 'customer').forEach(u => {
    if (!customers.find(c => c.email === u.email)) {
      const userOrders = orders.filter(o => o.email === u.email).length;
      customers.push({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || 'N/A',
        joinDate: u.createdAt ? u.createdAt.split('T')[0] : 'N/A',
        totalOrders: userOrders
      });
    }
  });

  return customers;
}

function formatPrice(n) {
  return 'Rs. ' + Number(n).toLocaleString('en-LK');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function animateCounter(el, target, prefix = '', suffix = '') {
  let current = 0;
  const duration = 1500;
  const step = target / (duration / 16);

  function update() {
    current += step;
    if (current >= target) {
      current = target;
      el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
      return;
    }
    el.textContent = prefix + Math.round(current).toLocaleString() + suffix;
    requestAnimationFrame(update);
  }
  update();
}

function initDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const customers = getCustomers();
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);

  // Animate stat counters
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length >= 4) {
    animateCounter(statEls[0], products.length);
    animateCounter(statEls[1], orders.length);
    animateCounter(statEls[2], totalRevenue, 'Rs. ');
    animateCounter(statEls[3], customers.length);
  }

  // Recent orders table
  renderRecentOrders(orders.slice(0, 5));

  // Revenue chart
  renderRevenueChart();
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recentOrdersBody');
  if (!tbody) return;

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span style="font-weight:600;color:var(--text-primary)">${o.id}</span></td>
      <td>${o.customer}</td>
      <td>${formatDate(o.date)}</td>
      <td><span style="font-weight:600;color:var(--text-primary)">${formatPrice(o.total)}</span></td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
    </tr>
  `).join('');
}

function renderRevenueChart() {
  const chart = document.getElementById('revenueChart');
  if (!chart) return;

  // Mock monthly revenue data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const values = [85000, 120000, 95000, 150000, 130000, 180000, 210000];
  const maxVal = Math.max(...values);

  chart.innerHTML = months.map((month, i) => {
    const height = (values[i] / maxVal) * 100;
    return `
      <div class="bar-col">
        <span class="bar-value">${(values[i] / 1000).toFixed(0)}K</span>
        <div class="bar" style="height: ${height}%" title="${formatPrice(values[i])}"></div>
        <span class="bar-label">${month}</span>
      </div>
    `;
  }).join('');

  // Animate bars
  setTimeout(() => {
    chart.querySelectorAll('.bar').forEach(bar => {
      const h = bar.style.height;
      bar.style.height = '4px';
      setTimeout(() => { bar.style.height = h; }, 100);
    });
  }, 300);
}

let editingProductId = null;

function initProductsPage() {
  renderProductsTable();

  // Add product button
  const addBtn = document.getElementById('addProductBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openProductModal());
  }

  // Search
  const searchInput = document.getElementById('productSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderProductsTable(searchInput.value.trim().toLowerCase());
    });
  }

  // Modal close
  const modalOverlay = document.getElementById('productModalOverlay');
  const modalClose = document.getElementById('productModalClose');
  const cancelBtn = document.getElementById('productCancelBtn');

  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeProductModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }

  // Form submit
  const form = document.getElementById('productForm');
  if (form) {
    form.addEventListener('submit', saveProduct);
  }
}

function renderProductsTable(search = '') {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  let products = getProducts();
  if (search) {
    products = products.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.brand.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="empty-state-icon">📦</div><h3>No products found</h3></td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <div class="table-product">
          <img src="${p.image}" alt="${p.name}" class="table-product-img">
          <div>
            <div class="table-product-name">${p.name}</div>
            <div class="table-product-brand">${p.brand}</div>
          </div>
        </div>
      </td>
      <td><span style="text-transform:capitalize">${p.category}</span></td>
      <td><span style="font-weight:600;color:var(--text-primary)">${formatPrice(p.price)}</span></td>
      <td>${p.badge ? `<span class="status-badge ${p.badge === 'sale' ? 'pending' : p.badge === 'new' ? 'processing' : 'shipped'}">${p.badge.toUpperCase()}</span>` : '—'}</td>
      <td><span class="status-badge ${p.inStock ? 'in-stock' : 'out-of-stock'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn edit" onclick="openProductModal(${p.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="table-action-btn delete" onclick="deleteProduct(${p.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(productId = null) {
  editingProductId = productId;
  const overlay = document.getElementById('productModalOverlay');
  const title = document.getElementById('productModalTitle');
  const form = document.getElementById('productForm');

  if (productId) {
    const product = getProducts().find(p => p.id === productId);
    if (!product) return;

    title.textContent = 'Edit Product';
    form.querySelector('#pBrand').value = product.brand;
    form.querySelector('#pName').value = product.name;
    form.querySelector('#pCategory').value = product.category;
    form.querySelector('#pPrice').value = product.price;
    form.querySelector('#pOldPrice').value = product.oldPrice || '';
    form.querySelector('#pBadge').value = product.badge || '';
    form.querySelector('#pImage').value = product.image;
    form.querySelector('#pSizes').value = product.sizes;
    form.querySelector('#pDesc').value = product.description;
    form.querySelector('#pStock').checked = product.inStock;
  } else {
    title.textContent = 'Add New Product';
    form.reset();
    form.querySelector('#pStock').checked = true;
  }

  overlay.classList.add('active');
}

function closeProductModal() {
  const overlay = document.getElementById('productModalOverlay');
  overlay.classList.remove('active');
  editingProductId = null;
}

function saveProduct(e) {
  e.preventDefault();
  const form = e.target;
  const products = getProducts();

  const productData = {
    brand: form.querySelector('#pBrand').value.trim(),
    name: form.querySelector('#pName').value.trim(),
    category: form.querySelector('#pCategory').value,
    price: parseFloat(form.querySelector('#pPrice').value),
    oldPrice: form.querySelector('#pOldPrice').value ? parseFloat(form.querySelector('#pOldPrice').value) : null,
    badge: form.querySelector('#pBadge').value || null,
    image: form.querySelector('#pImage').value.trim() || '../assets/images/product_mens.png',
    sizes: form.querySelector('#pSizes').value.trim(),
    description: form.querySelector('#pDesc').value.trim(),
    inStock: form.querySelector('#pStock').checked,
    rating: 4.5,
    reviews: 0
  };

  if (editingProductId) {
    const index = products.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      showToast('Product updated successfully!');
    }
  } else {
    productData.id = Date.now();
    products.push(productData);
    showToast('Product added successfully!');
  }

  saveProducts(products);
  closeProductModal();
  renderProductsTable();
}

function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  renderProductsTable();
  showToast('Product deleted', 'error');
}

// Make functions globally accessible
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;

   ORDERS PAGE
══════════════════════════════════ */
function initOrdersPage() {
  renderOrdersTable();

  // Search
  const searchInput = document.getElementById('orderSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderOrdersTable(searchInput.value.trim().toLowerCase(), currentOrderFilter);
    });
  }

  // Filter buttons
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOrderFilter = btn.dataset.filter;
      const searchVal = document.getElementById('orderSearch')?.value.trim().toLowerCase() || '';
      renderOrdersTable(searchVal, currentOrderFilter);
    });
  });
}

let currentOrderFilter = 'all';

function renderOrdersTable(search = '', filter = 'all') {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  let orders = getOrders();

  if (filter !== 'all') {
    orders = orders.filter(o => o.status === filter);
  }

  if (search) {
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(search) ||
      o.customer.toLowerCase().includes(search) ||
      o.email.toLowerCase().includes(search)
    );
  }

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="empty-state-icon">📋</div><h3>No orders found</h3></td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span style="font-weight:600;color:var(--text-primary)">${o.id}</span></td>
      <td>
        <div>
          <div style="font-weight:500;color:var(--text-primary)">${o.customer}</div>
          <div style="font-size:0.7rem;color:var(--text-muted)">${o.email}</div>
        </div>
      </td>
      <td>${formatDate(o.date)}</td>
      <td>
        <div style="font-size:0.75rem;color:var(--text-muted)">${o.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</div>
      </td>
      <td><span style="font-weight:600;color:var(--text-primary)">${formatPrice(o.total)}</span></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn view" onclick="openOrderModal('${o.id}')" title="View Order & Invoice"><i class="fa-solid fa-file-invoice"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders(orders);
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  }
}

function openOrderModal(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const modalOverlay = document.getElementById('orderModalOverlay');
  const body = document.getElementById('orderModalBody');
  if (!modalOverlay || !body) return;

  const subtotal = order.total;
  const shipping = subtotal > 15000 ? 0 : 350;
  const grandTotal = subtotal + shipping;

  body.innerHTML = `
    <div class="order-invoice-box">
      <div class="invoice-header">
        <div class="invoice-brand">
          <h2>STEP<span>Z</span></h2>
          <p style="font-size:0.8rem;color:var(--text-muted)">Premium Footwear Store</p>
        </div>
        <div class="invoice-meta">
          <div class="invoice-id">${order.id}</div>
          <div class="invoice-date">Date: ${formatDate(order.date)}</div>
          <div class="invoice-date">Status: <strong style="text-transform:uppercase;color:var(--accent)">${order.status}</strong></div>
        </div>
      </div>

      <div class="invoice-addresses">
        <div>
          <div class="invoice-col-title">Customer Info</div>
          <div class="invoice-col-content">
            <p><strong>${order.customer}</strong></p>
            <p>${order.email}</p>
            <p>+94 77 123 4567</p>
          </div>
        </div>
        <div>
          <div class="invoice-col-title">Shipping Address</div>
          <div class="invoice-col-content">
            <p>123 Store Street, Colombo 03</p>
            <p>Western Province, Sri Lanka</p>
            <p>Payment: Cash on Delivery (COD)</p>
          </div>
        </div>
      </div>

      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td>${item.qty}</td>
              <td>${formatPrice(item.price)}</td>
              <td>${formatPrice(item.price * item.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="invoice-total-wrap">
        <div class="invoice-summary-box">
          <div class="invoice-summary-row">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div class="invoice-summary-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
          </div>
          <div class="invoice-summary-row total">
            <span>Grand Total:</span>
            <span>${formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeOrderModal() {
  const overlay = document.getElementById('orderModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

window.updateOrderStatus = updateOrderStatus;
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;

function initCustomersPage() {
  renderCustomersTable();

  const searchInput = document.getElementById('customerSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCustomersTable(searchInput.value.trim().toLowerCase());
    });
  }

  const modalOverlay = document.getElementById('customerModalOverlay');
  const modalClose = document.getElementById('customerModalClose');
  const closeBtn = document.getElementById('customerModalCloseBtn');

  if (modalClose) modalClose.addEventListener('click', closeCustomerModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCustomerModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeCustomerModal();
    });
  }
}

function renderCustomersTable(search = '') {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  let customers = getCustomers();

  if (search) {
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.phone.includes(search)
    );
  }

  if (customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-state-icon">👥</div><h3>No customers found</h3></td></tr>`;
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td>
        <div class="table-product">
          <div class="sidebar-user-avatar" style="width:36px;height:36px;font-size:0.8rem">${c.name.charAt(0)}</div>
          <div>
            <div class="table-product-name">${c.name}</div>
            <div class="table-product-brand">${c.email}</div>
          </div>
        </div>
      </td>
      <td>${c.phone}</td>
      <td>${formatDate(c.joinDate)}</td>
      <td><span style="font-weight:600;color:var(--text-primary)">${c.totalOrders}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn view" title="View Profile" onclick="openCustomerModal(${c.id})"><i class="fa-solid fa-user"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openCustomerModal(customerId) {
  const customers = getCustomers();
  const customer = customers.find(c => c.id === customerId);
  if (!customer) return;

  const orders = getOrders().filter(o => o.email.toLowerCase() === customer.email.toLowerCase() || o.customer.toLowerCase() === customer.name.toLowerCase());
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const modalOverlay = document.getElementById('customerModalOverlay');
  const body = document.getElementById('customerModalBody');
  if (!modalOverlay || !body) return;

  body.innerHTML = `
    <div class="customer-profile-card">
      <div class="customer-avatar-large">${customer.name.charAt(0)}</div>
      <div>
        <h3 style="margin-bottom:4px;font-size:1.2rem">${customer.name}</h3>
        <p style="font-size:0.85rem;color:var(--text-secondary)"><i class="fa-solid fa-envelope"></i> ${customer.email}</p>
        <p style="font-size:0.85rem;color:var(--text-secondary)"><i class="fa-solid fa-phone"></i> ${customer.phone}</p>
      </div>
    </div>

    <div class="customer-meta-grid">
      <div class="customer-meta-box">
        <div class="customer-meta-label">Joined</div>
        <div class="customer-meta-val">${formatDate(customer.joinDate)}</div>
      </div>
      <div class="customer-meta-box">
        <div class="customer-meta-label">Orders</div>
        <div class="customer-meta-val">${orders.length}</div>
      </div>
      <div class="customer-meta-box">
        <div class="customer-meta-label">Total Spent</div>
        <div class="customer-meta-val">${formatPrice(totalSpent)}</div>
      </div>
    </div>

    <h4 style="margin-bottom:12px;font-size:0.95rem;color:var(--text-primary)">Customer Order History</h4>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.length > 0 ? orders.map(o => `
            <tr>
              <td><strong>${o.id}</strong></td>
              <td>${formatDate(o.date)}</td>
              <td>${formatPrice(o.total)}</td>
              <td><span class="status-badge ${o.status}">${o.status}</span></td>
            </tr>
          `).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No orders placed yet</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeCustomerModal() {
  const overlay = document.getElementById('customerModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

window.openCustomerModal = openCustomerModal;
window.closeCustomerModal = closeCustomerModal;

function getReviews() {
  let reviews = JSON.parse(localStorage.getItem('stepz-admin-reviews') || 'null');
  if (!reviews) {
    reviews = [
      { id: 1, product: 'Air Max 270 React', customer: 'Kamal Perera', rating: 5, comment: 'Super comfortable sneakers! Fast delivery too.', date: '2026-07-28', approved: true },
      { id: 2, product: 'Ultraboost 23', customer: 'Nimali Fernando', rating: 5, comment: 'Great for running, love the cushioning.', date: '2026-07-27', approved: true },
      { id: 3, product: 'Elara Stiletto Heels', customer: 'Dilini Jayawardena', rating: 4, comment: 'Looks elegant, fits well.', date: '2026-07-25', approved: true },
      { id: 4, product: 'Arch Fit Loafer', customer: 'Saman Silva', rating: 3, comment: 'Good quality but sizing runs a bit small.', date: '2026-07-22', approved: false },
      { id: 5, product: 'Air Jordan 1 Retro High', customer: 'Ruwan Wickramasinghe', rating: 5, comment: '100% authentic design, classic look.', date: '2026-07-20', approved: true }
    ];
    localStorage.setItem('stepz-admin-reviews', JSON.stringify(reviews));
  }
  return reviews;
}

function saveReviews(reviews) {
  localStorage.setItem('stepz-admin-reviews', JSON.stringify(reviews));
}

let currentReviewRatingFilter = 'all';

function initReviewsPage() {
  renderReviewsTable();

  const searchInput = document.getElementById('reviewSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderReviewsTable(searchInput.value.trim().toLowerCase(), currentReviewRatingFilter);
    });
  }

  document.querySelectorAll('.review-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.review-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReviewRatingFilter = btn.dataset.filter;
      const searchVal = document.getElementById('reviewSearch')?.value.trim().toLowerCase() || '';
      renderReviewsTable(searchVal, currentReviewRatingFilter);
    });
  });
}

function renderReviewsTable(search = '', filter = 'all') {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  let reviews = getReviews();

  if (filter !== 'all') {
    reviews = reviews.filter(r => r.rating === parseInt(filter));
  }

  if (search) {
    reviews = reviews.filter(r =>
      r.product.toLowerCase().includes(search) ||
      r.customer.toLowerCase().includes(search) ||
      r.comment.toLowerCase().includes(search)
    );
  }

  if (reviews.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="empty-state-icon">⭐</div><h3>No reviews found</h3></td></tr>`;
    return;
  }

  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td><span style="font-weight:600;color:var(--text-primary)">${r.product}</span></td>
      <td>${r.customer}</td>
      <td><span class="star-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></td>
      <td><span style="font-size:0.85rem;color:var(--text-secondary)">"${r.comment}"</span></td>
      <td>${formatDate(r.date)}</td>
      <td><span class="status-badge ${r.approved ? 'delivered' : 'pending'}">${r.approved ? 'Approved' : 'Pending'}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn ${r.approved ? 'delete' : 'edit'}" title="${r.approved ? 'Hide' : 'Approve'}" onclick="toggleReviewStatus(${r.id})">
            <i class="fa-solid fa-${r.approved ? 'eye-slash' : 'check'}"></i>
          </button>
          <button class="table-action-btn delete" title="Delete" onclick="deleteReview(${r.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleReviewStatus(id) {
  let reviews = getReviews();
  const review = reviews.find(r => r.id === id);
  if (review) {
    review.approved = !review.approved;
    saveReviews(reviews);
    renderReviewsTable();
    showToast(`Review status updated to ${review.approved ? 'Approved' : 'Hidden'}`);
  }
}

function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  let reviews = getReviews().filter(r => r.id !== id);
  saveReviews(reviews);
  renderReviewsTable();
  showToast('Review deleted', 'error');
}

window.toggleReviewStatus = toggleReviewStatus;
window.deleteReview = deleteReview;

function getOffers() {
  let offers = JSON.parse(localStorage.getItem('stepz-admin-offers') || 'null');
  if (!offers) {
    offers = [
      { id: 1, code: 'STEPZ15', type: 'percentage', value: 15, minSpend: 5000, expiry: '2026-12-31', active: true },
      { id: 2, code: 'WELCOME2000', type: 'fixed', value: 2000, minSpend: 10000, expiry: '2026-10-31', active: true },
      { id: 3, code: 'SUMMERSALE', type: 'percentage', value: 20, minSpend: 15000, expiry: '2026-08-31', active: false }
    ];
    localStorage.setItem('stepz-admin-offers', JSON.stringify(offers));
  }
  return offers;
}

function saveOffers(offers) {
  localStorage.setItem('stepz-admin-offers', JSON.stringify(offers));
}

function initOffersPage() {
  renderOffersTable();

  const searchInput = document.getElementById('offerSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderOffersTable(searchInput.value.trim().toLowerCase());
    });
  }

  const addBtn = document.getElementById('addOfferBtn');
  if (addBtn) addBtn.addEventListener('click', () => openOfferModal());

  const modalOverlay = document.getElementById('offerModalOverlay');
  const modalClose = document.getElementById('offerModalClose');
  const cancelBtn = document.getElementById('offerCancelBtn');

  if (modalClose) modalClose.addEventListener('click', closeOfferModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeOfferModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeOfferModal();
    });
  }

  const form = document.getElementById('offerForm');
  if (form) form.addEventListener('submit', saveOffer);
}

function renderOffersTable(search = '') {
  const tbody = document.getElementById('offersTableBody');
  if (!tbody) return;

  let offers = getOffers();

  if (search) {
    offers = offers.filter(o => o.code.toLowerCase().includes(search));
  }

  if (offers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="empty-state-icon">🏷️</div><h3>No promo codes found</h3></td></tr>`;
    return;
  }

  tbody.innerHTML = offers.map(o => `
    <tr>
      <td><span class="coupon-code-pill">${o.code}</span></td>
      <td><span style="font-weight:600;color:var(--text-primary)">${o.type === 'percentage' ? o.value + '%' : formatPrice(o.value)}</span></td>
      <td>${formatPrice(o.minSpend)}</td>
      <td>${formatDate(o.expiry)}</td>
      <td><span class="status-badge ${o.active ? 'in-stock' : 'out-of-stock'}">${o.active ? 'Active' : 'Expired / Inactive'}</span></td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn edit" title="Toggle Status" onclick="toggleOfferStatus(${o.id})"><i class="fa-solid fa-power-off"></i></button>
          <button class="table-action-btn delete" title="Delete" onclick="deleteOffer(${o.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openOfferModal() {
  const overlay = document.getElementById('offerModalOverlay');
  const form = document.getElementById('offerForm');
  if (form) form.reset();
  if (overlay) overlay.classList.add('active');
}

function closeOfferModal() {
  const overlay = document.getElementById('offerModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function saveOffer(e) {
  e.preventDefault();
  const form = e.target;
  const offers = getOffers();

  const newOffer = {
    id: Date.now(),
    code: form.querySelector('#oCode').value.trim().toUpperCase(),
    type: form.querySelector('#oType').value,
    value: parseFloat(form.querySelector('#oValue').value),
    minSpend: parseFloat(form.querySelector('#oMinSpend').value),
    expiry: form.querySelector('#oExpiry').value,
    active: form.querySelector('#oActive').checked
  };

  offers.push(newOffer);
  saveOffers(offers);
  closeOfferModal();
  renderOffersTable();
  showToast(`Promo Code ${newOffer.code} created successfully!`);
}

function toggleOfferStatus(id) {
  let offers = getOffers();
  const offer = offers.find(o => o.id === id);
  if (offer) {
    offer.active = !offer.active;
    saveOffers(offers);
    renderOffersTable();
    showToast(`Promo code ${offer.code} status set to ${offer.active ? 'Active' : 'Inactive'}`);
  }
}

function deleteOffer(id) {
  if (!confirm('Are you sure you want to delete this promo code?')) return;
  let offers = getOffers().filter(o => o.id !== id);
  saveOffers(offers);
  renderOffersTable();
  showToast('Promo code deleted', 'error');
}

window.toggleOfferStatus = toggleOfferStatus;
window.deleteOffer = deleteOffer;

function initSettingsPage() {
  const storeForm = document.getElementById('storeSettingsForm');
  const shippingForm = document.getElementById('shippingSettingsForm');

  if (storeForm) {
    storeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Store profile details updated successfully!');
    });
  }

  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Shipping & Currency settings updated successfully!');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();

  const path = window.location.pathname;

  if (path.includes('products.html')) {
    initProductsPage();
  } else if (path.includes('orders.html')) {
    initOrdersPage();
  } else if (path.includes('customers.html')) {
    initCustomersPage();
  } else if (path.includes('reviews.html')) {
    initReviewsPage();
  } else if (path.includes('offers.html')) {
    initOffersPage();
  } else if (path.includes('settings.html')) {
    initSettingsPage();
  } else {
    // Dashboard (index.html)
    initDashboard();
  }
});

