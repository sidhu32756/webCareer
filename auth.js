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
    
    // Send automatic email using EmailJS
    this.sendEmailNotification(adminEmail, subject, body, user);
  }

  // Send email notification
  async sendEmailNotification(adminEmail, subject, body, user) {
    try {
      // Send automatic email using Web3Forms
      const formData = new FormData();
      formData.append('access_key', 'a8d5f2c1-4b3e-4f7a-9d2c-8e1b5f3a7c9d'); // Free Web3Forms key
      formData.append('subject', subject);
      formData.append('email', user.email);
      formData.append('name', user.name);
      formData.append('message', `New user signup notification:\n\nName: ${user.name}\nEmail: ${user.email}\nSignup Date: ${new Date(user.createdAt).toLocaleString()}\nUser ID: ${user.id}`);
      formData.append('to', adminEmail);
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        console.log('Admin notification email sent successfully');
      } else {
        throw new Error('Email service failed');
      }
    } catch (error) {
      console.log('Email sending failed, using fallback');
      // Fallback: Create mailto link
      const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
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