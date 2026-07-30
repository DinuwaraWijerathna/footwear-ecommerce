'use strict';

const DEFAULT_ADMIN = {
  id: 1,
  name: 'STEPZ Admin',
  email: 'admin@stepz.lk',
  phone: '+94 11 234 5678',
  password: 'admin123',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z'
};

const DEFAULT_CUSTOMER = {
  id: 2,
  name: 'Kamal Perera',
  email: 'kamal@gmail.com',
  phone: '+94 77 123 4567',
  password: 'customer123',
  role: 'customer',
  createdAt: '2026-01-15T00:00:00Z'
};

function initUsersStore() {
  let users = JSON.parse(localStorage.getItem('stepz-users') || '[]');
  
  if (!users.some(u => u.email === DEFAULT_ADMIN.email)) {
    users.push(DEFAULT_ADMIN);
  }
  if (!users.some(u => u.email === DEFAULT_CUSTOMER.email)) {
    users.push(DEFAULT_CUSTOMER);
  }
  localStorage.setItem('stepz-users', JSON.stringify(users));
  return users;
}

function fillDemoLogin(role) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const loginForm = document.getElementById('loginForm');

  if (role === 'admin') {
    if (emailInput) emailInput.value = DEFAULT_ADMIN.email;
    if (passwordInput) passwordInput.value = DEFAULT_ADMIN.password;
  } else {
    if (emailInput) emailInput.value = DEFAULT_CUSTOMER.email;
    if (passwordInput) passwordInput.value = DEFAULT_CUSTOMER.password;
  }

  if (loginForm) {
    const event = new Event('submit', { cancelable: true, bubbles: true });
    loginForm.dispatchEvent(event);
  }
}
window.fillDemoLogin = fillDemoLogin;

function getUsers() {
  return JSON.parse(localStorage.getItem('stepz-users') || '[]');
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('stepz-current-user') || 'null');
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('stepz-current-user');
  window.location.href = 'login.html';
}

function setCurrentUser(user) {
  // Don't store the password in session
  const sessionUser = { ...user };
  delete sessionUser.password;
  localStorage.setItem('stepz-current-user', JSON.stringify(sessionUser));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[\+]?[0-9\s\-]{7,15}$/.test(phone);
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 'weak', text: 'Weak' };
  if (score <= 2) return { level: 'fair', text: 'Fair' };
  if (score <= 3) return { level: 'good', text: 'Good' };
  return { level: 'strong', text: 'Strong' };
}

function showInputError(inputGroup, message) {
  inputGroup.classList.add('error');
  const errorEl = inputGroup.querySelector('.input-error');
  if (errorEl) errorEl.textContent = message;
}

function clearInputError(inputGroup) {
  inputGroup.classList.remove('error');
}

function clearAllErrors(form) {
  form.querySelectorAll('.input-group').forEach(g => clearInputError(g));
}

function showAuthToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.auth-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `auth-toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function handleLogin(e) {
  e.preventDefault();
  const form = e.target;
  clearAllErrors(form);

  const email = form.querySelector('#loginEmail').value.trim();
  const password = form.querySelector('#loginPassword').value;
  const rememberMe = form.querySelector('#rememberMe')?.checked;

  let valid = true;

  // Validate email
  if (!email) {
    showInputError(form.querySelector('#loginEmail').closest('.input-group'), 'Email is required');
    valid = false;
  } else if (!validateEmail(email)) {
    showInputError(form.querySelector('#loginEmail').closest('.input-group'), 'Please enter a valid email');
    valid = false;
  }

  // Validate password
  if (!password) {
    showInputError(form.querySelector('#loginPassword').closest('.input-group'), 'Password is required');
    valid = false;
  }

  if (!valid) return;

  // Show loading
  const btn = form.querySelector('.auth-btn');
  btn.classList.add('loading');

  // Simulate API delay
  setTimeout(() => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      btn.classList.remove('loading');
      showAuthToast('Invalid email or password', 'error');
      return;
    }

    setCurrentUser(user);

    if (rememberMe) {
      localStorage.setItem('stepz-remember', email);
    } else {
      localStorage.removeItem('stepz-remember');
    }

    showAuthToast('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      if (user.role === 'admin') {
        window.location.href = 'admin/index.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1000);
  }, 800);
}

function handleSignup(e) {
  e.preventDefault();
  const form = e.target;
  clearAllErrors(form);

  const name = form.querySelector('#signupName').value.trim();
  const email = form.querySelector('#signupEmail').value.trim();
  const phone = form.querySelector('#signupPhone').value.trim();
  const password = form.querySelector('#signupPassword').value;
  const confirmPassword = form.querySelector('#signupConfirm').value;
  const agreeTerms = form.querySelector('#agreeTerms')?.checked;

  let valid = true;

  // Name
  if (!name || name.length < 2) {
    showInputError(form.querySelector('#signupName').closest('.input-group'), 'Full name is required');
    valid = false;
  }

  // Email
  if (!email) {
    showInputError(form.querySelector('#signupEmail').closest('.input-group'), 'Email is required');
    valid = false;
  } else if (!validateEmail(email)) {
    showInputError(form.querySelector('#signupEmail').closest('.input-group'), 'Please enter a valid email');
    valid = false;
  }

  // Phone
  if (!phone) {
    showInputError(form.querySelector('#signupPhone').closest('.input-group'), 'Phone number is required');
    valid = false;
  } else if (!validatePhone(phone)) {
    showInputError(form.querySelector('#signupPhone').closest('.input-group'), 'Please enter a valid phone number');
    valid = false;
  }

  // Password
  if (!password) {
    showInputError(form.querySelector('#signupPassword').closest('.input-group'), 'Password is required');
    valid = false;
  } else if (password.length < 6) {
    showInputError(form.querySelector('#signupPassword').closest('.input-group'), 'Password must be at least 6 characters');
    valid = false;
  }

  // Confirm
  if (password !== confirmPassword) {
    showInputError(form.querySelector('#signupConfirm').closest('.input-group'), 'Passwords do not match');
    valid = false;
  }

  // Terms
  if (!agreeTerms) {
    showAuthToast('You must agree to the Terms & Conditions', 'error');
    valid = false;
  }

  if (!valid) return;

  // Check if email already exists
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showInputError(form.querySelector('#signupEmail').closest('.input-group'), 'This email is already registered');
    return;
  }

  // Show loading
  const btn = form.querySelector('.auth-btn');
  btn.classList.add('loading');

  setTimeout(() => {
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('stepz-users', JSON.stringify(users));

    // Show success
    const formEl = document.getElementById('signupFormContent');
    const successEl = document.getElementById('signupSuccess');
    if (formEl) formEl.style.display = 'none';
    if (successEl) successEl.classList.add('show');

    showAuthToast('Account created successfully!', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }, 800);
}

function togglePasswordVisibility(btn) {
  const input = btn.parentElement.querySelector('input');
  const icon = btn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function updatePasswordStrength(password) {
  const strengthFill = document.querySelector('.strength-fill');
  const strengthText = document.querySelector('.strength-text');
  if (!strengthFill || !strengthText) return;

  if (!password) {
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = '0%';
    strengthText.textContent = '';
    strengthText.className = 'strength-text';
    return;
  }

  const strength = getPasswordStrength(password);
  strengthFill.className = `strength-fill ${strength.level}`;
  strengthText.textContent = strength.text;
  strengthText.className = `strength-text ${strength.level}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initUsersStore();

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);

    // Auto-fill remembered email
    const remembered = localStorage.getItem('stepz-remember');
    if (remembered) {
      const emailInput = document.getElementById('loginEmail');
      const rememberCheck = document.getElementById('rememberMe');
      if (emailInput) emailInput.value = remembered;
      if (rememberCheck) rememberCheck.checked = true;
    }
  }

  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);

    // Password strength listener
    const pwInput = document.getElementById('signupPassword');
    if (pwInput) {
      pwInput.addEventListener('input', () => {
        updatePasswordStrength(pwInput.value);
      });
    }
  }

  // Password toggle buttons
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => togglePasswordVisibility(btn));
  });

  // Clear errors on input
  document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('input', () => {
      clearInputError(input.closest('.input-group'));
    });
  });
});
