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

// ✅ Auth login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', email);
  
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token: 'test-jwt-token-for-admin',
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// ✅ Auth me route
app.get('/api/auth/me', (req, res) => {
  // For demo, return the first user (admin)
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

// ✅ Create user endpoint (ONLY ONE)
app.post('/api/users', (req, res) => {
  try {
    const { name, email, password, initialBalance = 0 } = req.body;
    
    console.log('Creating user:', { name, email });
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: 'user',
      accountNumber: `1000${String(users.length + 1).padStart(3, '0')}`,
      balance: parseFloat(initialBalance) || 0,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// ✅ Add transaction endpoint
app.post('/api/admin/transactions', (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const transactionAmount = parseFloat(amount);
    
    if (type === 'deposit') {
      user.balance += transactionAmount;
    } else if (type === 'withdrawal') {
      if (user.balance < transactionAmount) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
      user.balance -= transactionAmount;
    }
    
    const transaction = {
      id: transactions.length + 1,
      userId: parseInt(userId),
      type,
      amount: transactionAmount,
      description,
      date: new Date().toISOString(),
      balance_after: user.balance
    };
    
    transactions.push(transaction);
    
    res.json({
      message: 'Transaction completed successfully',
      new_balance: user.balance.toFixed(2)
    });
    
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Error processing transaction' });
  }
});

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

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
});