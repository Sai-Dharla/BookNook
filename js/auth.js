/**
 * BookNook Simulated Authentication Controller
 * Manages:
 * - Simulated user login and session persistence in localStorage (booknook_session)
 * - Registration of new user accounts with validation into booknook_user
 * - Password matching and email validation
 * - Demo account autofill buttons for immediate tester convenience
 * - Remember me flag
 * - Redirect to account dashboard or return URL
 *
 * Company: Data Alpha Systems | Intern: Dharla SaiBabu (SaiBabu Dharla)
 */

const AuthController = {
  init() {
    this.bindLogin();
    this.bindRegister();
    this.setupDemoButtons();
  },

  setupDemoButtons() {
    const demoBtn = document.getElementById('fill-demo-credentials');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        if (emailInput) emailInput.value = 'saibabu@dataalpha.com';
        if (passwordInput) passwordInput.value = 'BookNook2026!';
        BookNookApp.showToast('Demo intern credentials populated!', 'info');
      });
    }
  },

  bindLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        BookNookApp.showToast('Please enter both email and password.', 'error');
        return;
      }

      // Check registered users
      const users = Storage.get(STORAGE_KEYS.USER, []);
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      // If matches demo credentials or existing user
      if (email.toLowerCase() === 'saibabu@dataalpha.com' || (user && user.password === password)) {
        const sessionUser = user || {
          name: 'Dharla SaiBabu',
          email: 'saibabu@dataalpha.com',
          phone: '+91 98765 43210'
        };

        Storage.set(STORAGE_KEYS.SESSION, {
          ...sessionUser,
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        });

        BookNookApp.showToast(`Welcome back, ${sessionUser.name.split(' ')[0]}!`, 'success');

        setTimeout(() => {
          window.location.href = 'account.html';
        }, 800);
      } else {
        // Allow simulated login if credentials look valid
        if (email.includes('@') && password.length >= 6) {
          const simulatedUser = {
            name: email.split('@')[0].replace('.', ' '),
            email: email,
            phone: '+91 98765 00000',
            isLoggedIn: true
          };
          Storage.set(STORAGE_KEYS.SESSION, simulatedUser);
          BookNookApp.showToast(`Welcome, ${simulatedUser.name}!`, 'success');
          setTimeout(() => window.location.href = 'account.html', 800);
        } else {
          BookNookApp.showToast('Invalid credentials. Password must be at least 6 characters.', 'error');
        }
      }
    });
  },

  bindRegister() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const phone = document.getElementById('reg-phone').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const terms = document.getElementById('reg-terms').checked;

      if (!name || !email || !password || !confirmPassword) {
        BookNookApp.showToast('Please fill out all required fields.', 'error');
        return;
      }

      if (!email.includes('@') || !email.includes('.')) {
        BookNookApp.showToast('Please enter a valid email address.', 'error');
        return;
      }

      if (password.length < 6) {
        BookNookApp.showToast('Password must be at least 6 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        BookNookApp.showToast('Passwords do not match. Please recheck.', 'error');
        return;
      }

      if (!terms) {
        BookNookApp.showToast('You must agree to the Terms of Service.', 'error');
        return;
      }

      let users = Storage.get(STORAGE_KEYS.USER, []);
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        BookNookApp.showToast('An account with this email already exists. Please log in.', 'error');
        return;
      }

      const newUser = {
        id: `USR-${Date.now()}`,
        name: name,
        email: email,
        phone: phone || '+91 98765 43210',
        password: password,
        registeredAt: new Date().toISOString()
      };

      users.push(newUser);
      Storage.set(STORAGE_KEYS.USER, users);

      // Auto login
      Storage.set(STORAGE_KEYS.SESSION, {
        ...newUser,
        isLoggedIn: true
      });

      BookNookApp.showToast('Account registered successfully! Redirecting...', 'success');

      setTimeout(() => {
        window.location.href = 'account.html';
      }, 1000);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AuthController.init();
});

