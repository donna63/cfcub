// // const express = require('express');
// // const cors = require('cors');
// // const path = require('path');
// // require('dotenv').config();

// // console.log('✅ Starting server...');
// // console.log('✅ Environment:', process.env.NODE_ENV);

// // const app = express();
// // const PORT = process.env.PORT || 5001;

// // // Simple CORS for now
// // app.use(cors());
// // app.use(express.json());

// // // ✅ FIXED: Use absolute paths for routes
// // app.use('/api/auth', require(path.join(__dirname, 'routes', 'auth')));
// // app.use('/api/admin', require(path.join(__dirname, 'routes', 'admin')));
// // app.use('/api/users', require(path.join(__dirname, 'routes', 'users')));

// // // Test route
// // app.get('/', (req, res) => {
// //     res.json({ 
// //         message: 'Banking API Server is running!',
// //         status: 'OK',
// //         timestamp: new Date().toISOString()
// //     });
// // });

// // // Health check
// // app.get('/health', (req, res) => {
// //     res.json({ 
// //         status: 'OK', 
// //         message: 'Server is healthy!',
// //         environment: process.env.NODE_ENV 
// //     });
// // });

// // // Simple test route
// // app.get('/api/test', (req, res) => {
// //     res.json({ message: 'API is working!' });
// // });

// // // Start server
// // app.listen(PORT, '0.0.0.0', () => {
// //     console.log(`🚀 Server running on port ${PORT}`);
// //     console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
// //     console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
// // });

// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();

// console.log('✅ Starting server...');

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Simple CORS
// app.use(cors());
// app.use(express.json());

// // Import routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/users', require('./routes/users'));

// // Simple in-memory user for testing (remove this later)
// const testUser = {
//   id: 1,
//   name: 'Admin User',
//   email: 'admin@unionbank.com',
//   role: 'admin'
// };

// // Override the auth login route temporarily
// app.post('/api/auth/login', (req, res) => {
//   const { email, password } = req.body;
  
//   // Simple hardcoded login for testing
//   if (email === 'admin@unionbank.com' && password === 'admin123') {
//     res.json({
//       token: 'test-jwt-token',
//       user: testUser
//     });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Server is healthy!',
//     environment: process.env.NODE_ENV 
//   });
// });

// // Root
// app.get('/', (req, res) => {
//   res.json({ message: 'Banking API Server' });
// });

// // Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✅ Starting server...');

const app = express();
const PORT = process.env.PORT || 5001;

// Simple CORS
app.use(cors());
app.use(express.json());

// Remove database imports - we don't need them
// const { testConnection } = require('./config/database');
// const { syncDatabase } = require('./models');

// Simple in-memory user for testing
const testUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@unionbank.com',
  role: 'admin'
};

// Auth login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  // Simple hardcoded login
  if (email === 'admin@unionbank.com' && password === 'admin123') {
    res.json({
      token: 'test-jwt-token-for-admin',
      user: testUser
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Simple auth me route
app.get('/api/auth/me', (req, res) => {
  res.json({ user: testUser });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy!',
    environment: process.env.NODE_ENV 
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Banking API Server is running!',
    status: 'OK'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
});