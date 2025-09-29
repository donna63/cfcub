const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✅ Starting server...');

const app = express();
const PORT = process.env.PORT || 5001;

// Simple CORS
app.use(cors());
app.use(express.json());

// ✅ ONLY ONE users declaration
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@unionbank.com',
    password: 'admin123',
    role: 'admin',
    accountNumber: '1000001',
    balance: 10000.00,
    createdAt: new Date().toISOString()
  }
];

let transactions = [];

// ✅ FIXED Auth login route (ONLY ONE)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  console.log('Available users:', users.map(u => u.email));
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,  // ✅ ADD THIS LINE
      token: `jwt-token-for-${user.id}`,
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ 
      success: false,  // ✅ ADD THIS LINE
      message: 'Invalid email or password' 
    });
  }
});

// ✅ FIXED Auth me route - simple demo version
app.get('/api/auth/me', (req, res) => {
  // For demo: Get user from token in header, or return first user
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Extract user ID from token (simple demo logic)
    const userIdMatch = token.match(/jwt-token-for-(\d+)/);
    
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1]);
      const user = users.find(u => u.id === userId);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      }
    }
  }
  
  // Fallback: return first user (admin)
  const user = users[0];
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// ✅ Admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = users.length;
  const totalAccounts = users.length;
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  
  res.json({
    totalUsers,
    totalAccounts,
    totalBalance: totalBalance.toFixed(2)
  });
});

// ✅ Get all users endpoint
app.get('/api/admin/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => ({
    ...user,
    Account: {
      account_number: user.accountNumber,
      balance: user.balance
    }
  }));
  
  res.json({ users: usersWithoutPasswords });
});

// ======= ADD THESE MISSING ENDPOINTS TO YOUR server.js =======
// ======= ENHANCED ENDPOINTS - REPLACE THE OLD ONES =======

// ✅ CREATE USER ENDPOINT (for admin to create users)
app.post('/api/users', (req, res) => {
  try {
    const { name, email, password, initialBalance = 0 } = req.body;
    
    console.log('Creating user:', { name, email, initialBalance });

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // In real app, hash this!
      role: 'user',
      accountNumber: `UB${Date.now().toString().slice(-8)}`,
      balance: parseFloat(initialBalance) || 0,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Create initial transaction if balance > 0
    if (initialBalance > 0) {
      transactions.push({
        id: transactions.length + 1,
        userId: newUser.id,
        type: 'deposit',
        amount: parseFloat(initialBalance),
        description: 'Initial account funding',
        balance_after: parseFloat(initialBalance),
        date: new Date().toISOString()
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// ✅ ADMIN ADD TRANSACTION ENDPOINT
app.post('/api/admin/transactions', (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    console.log('Adding transaction:', { userId, type, amount, description });

    // Find user
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newBalance = user.balance;

    // Update balance based on transaction type
    if (type === 'deposit') {
      newBalance += parseFloat(amount);
    } else if (type === 'withdrawal') {
      if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      newBalance -= parseFloat(amount);
    }

    // Update user balance
    user.balance = newBalance;

    // Create transaction record
    const newTransaction = {
      id: transactions.length + 1,
      userId: user.id,
      type,
      amount: parseFloat(amount),
      description,
      balance_after: newBalance,
      date: new Date().toISOString()
    };

    transactions.push(newTransaction);

    res.json({
      success: true,
      new_balance: newBalance.toFixed(2),
      transaction: newTransaction
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Error processing transaction' });
  }
});

// ✅ USER DASHBOARD ENDPOINT (frontend expects /api/dashboard)
app.get('/api/dashboard', (req, res) => {
  try {
    // Get user from token or use first non-admin user
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(\d+)/);
      
      if (userIdMatch) {
        const userId = parseInt(userIdMatch[1]);
        user = users.find(u => u.id === userId);
      }
    }
    
    // Fallback to first non-admin user or admin
    if (!user) {
      user = users.find(u => u.role === 'user') || users[0];
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userTransactions = transactions.filter(t => t.userId === user.id);
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      account: {
        balance: user.balance,
        account_number: user.accountNumber
      },
      recent_transactions: userTransactions.slice(-10).reverse().map(t => ({
        date: t.date,
        description: t.description,
        type: t.type,
        amount: t.amount,
        balance: t.balance_after
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading dashboard' });
  }
});

// ✅ USER TRANSACTIONS ENDPOINT (frontend expects /api/transactions)
app.get('/api/transactions', (req, res) => {
  try {
    // Get user from token or use first non-admin user
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(\d+)/);
      
      if (userIdMatch) {
        const userId = parseInt(userIdMatch[1]);
        user = users.find(u => u.id === userId);
      }
    }
    
    // Fallback to first non-admin user or admin
    if (!user) {
      user = users.find(u => u.role === 'user') || users[0];
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userTransactions = transactions.filter(t => t.userId === user.id);
    
    res.json({
      account_balance: user.balance,
      total_count: userTransactions.length,
      transactions: userTransactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        balance_after: t.balance_after
      }))
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Error loading transactions' });
  }
});

// ======= END OF ENHANCED ENDPOINTS =======
/// ======= END OF ENHANCED ENDPOINTS =======

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy!',
    environment: process.env.NODE_ENV 
  });
});

// ✅ Root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Banking API Server is running!',
    status: 'OK'
  });
});

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ✅ Debug route to see all users
app.get('/api/debug/users', (req, res) => {
  console.log('=== ALL USERS ===');
  console.log(users);
  res.json({ users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })) });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
});


// ✅ ADD THIS TO YOUR server.js - Temporary debug route
app.get('/api/debug/routes', (req, res) => {
  const routes = [
    '/api/auth/login - POST',
    '/api/admin/stats - GET', 
    '/api/admin/users - GET',
    '/api/dashboard - GET',
    '/api/transactions - GET'
  ];
  
  res.json({
    message: 'Server is running',
    routes: routes,
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
});