// Simple Authentication System
class AuthSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('careerpath_users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('careerpath_current_user') || 'null');
  }

  // Sign Up
  signUp(name, email, password) {
    // Check if user exists
    if (this.users.find(user => user.email === email)) {
      throw new Error('Account already exists with this email');
    }

    // Validate inputs
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create user
    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In production, hash this
      createdAt: new Date().toISOString()
    };

    this.users.push(user);
    localStorage.setItem('careerpath_users', JSON.stringify(this.users));
    
    // Send admin notification
    this.notifyAdmin(user);
    
    return { success: true, message: 'Account created successfully!' };
  }

  // Admin notification system
  notifyAdmin(user) {
    const adminEmail = 'sidheswargouda8@gmail.com';
    const subject = 'New User Signup - CareerPath Platform';
    const body = `New user registered on CareerPath:

Name: ${user.name}
Email: ${user.email}
Signup Date: ${new Date(user.createdAt).toLocaleString()}
User ID: ${user.id}`;
    
    // Store notification for admin dashboard
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.push({
      id: Date.now(),
      type: 'signup',
      user: user,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    
    // Create mailto link for email notification
    const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Auto-open email client (optional)
    try {
      window.open(mailtoLink, '_blank');
    } catch (e) {
      console.log('Email notification created for admin');
    }
  }

  // Sign In
  signIn(email, password) {
    const user = this.users.find(u => 
      u.email === email.toLowerCase().trim() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = user;
    localStorage.setItem('careerpath_current_user', JSON.stringify(user));
    
    return { success: true, user: user };
  }

  // Sign Out
  signOut() {
    this.currentUser = null;
    localStorage.removeItem('careerpath_current_user');
  }

  // Check if logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Admin functions
  getAdminNotifications() {
    return JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  }

  markNotificationRead(notificationId) {
    const notifications = this.getAdminNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
  }

  isAdmin(email) {
    return email === 'sidheswargouda8@gmail.com';
  }
}

// Initialize auth system
const auth = new AuthSystem();

// Form handlers
function handleSignUp(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.querySelector('input[type="text"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  try {
    auth.signUp(name, email, password);
    showMessage('Account created! Please sign in.', 'success');
    showForm('signin');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function handleSignIn(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  try {
    auth.signIn(email, password);
    showMessage('Welcome back!', 'success');
    setTimeout(() => {
      showScreen('dashboard-screen');
      updateDashboard();
    }, 1000);
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function handleSignOut() {
  auth.signOut();
  showMessage('Signed out successfully', 'success');
  setTimeout(() => {
    showScreen('home-screen');
  }, 1000);
}

// Message display
function showMessage(message, type = 'info') {
  const existing = document.querySelector('.auth-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = `auth-message ${type}`;
  msg.textContent = message;
  
  const formBox = document.querySelector('.form-box');
  if (formBox) {
    formBox.insertBefore(msg, formBox.firstChild);
    setTimeout(() => msg.remove(), 4000);
  }
}

// Update dashboard with user info
function updateDashboard() {
  const user = auth.getCurrentUser();
  if (user) {
    const dashTitle = document.querySelector('#dash-container h1');
    if (dashTitle) {
      dashTitle.textContent = `Welcome back, ${user.name}!`;
    }
  }
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', function() {
  if (auth.isLoggedIn()) {
    showScreen('dashboard-screen');
    updateDashboard();
  }
});