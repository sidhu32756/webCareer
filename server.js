const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;");
  next();
});

// Serve static files
app.use(express.static('.', {
  maxAge: '1d',
  etag: true
}));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'fed.html'));
});

app.get('/dashboard', (req, res) => {
  res.redirect('/fed.html#dashboard-screen');
});

app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, 'jobs.html'));
});

app.get('/careers', (req, res) => {
  res.sendFile(path.join(__dirname, 'css-careers.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'fed.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 CareerPath Platform running on http://localhost:${PORT}`);
  console.log(`📱 Mobile-friendly and production-ready!`);
});