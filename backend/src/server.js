

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

console.log('✅ Starting server with MongoDB...');

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/banking';
const DB_NAME = 'banking';
let db, usersCollection, transactionsCollection;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    transactionsCollection = db.collection('transactions');
    
    // Create initial admin user if doesn't exist
    const adminExists = await usersCollection.findOne({ email: 'admin@unionbank.com' });
    if (!adminExists) {
      await usersCollection.insertOne({
        name: 'Admin User',
        email: 'admin@unionbank.com',
        password: 'admin123',
        role: 'admin',
        accountNumber: '1000001',
        balance: 10000.00,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Admin user created');
    }
    
    console.log('✅ Connected to MongoDB Atlas with SSL');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

connectToDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Auth login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', email);
    
    const user = await usersCollection.findOne({ email, password });
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        token: `jwt-token-for-${user._id}`,
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Auth me endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          return res.json({ user: userWithoutPassword });
        }
      }
    }
    
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Create user endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, initialBalance = 0 } = req.body;
    
    console.log('Creating user:', { name, email, initialBalance });

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      name,
      email,
      password, // In real app, hash this!
      role: 'user',
      accountNumber: `UB${Date.now().toString().slice(-8)}`,
      balance: parseFloat(initialBalance) || 0,
      createdAt: new Date().toISOString()
    };

    const result = await usersCollection.insertOne(newUser);

    // Create initial transaction if balance > 0
    if (initialBalance > 0) {
      await transactionsCollection.insertOne({
        userId: result.insertedId,
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
      user: { ...userWithoutPassword, _id: result.insertedId }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// ✅ User dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await transactionsCollection.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      account: {
        balance: user.balance,
        account_number: user.accountNumber,
        account_type: "Primary",
        status: "Active"
      },
      recent_transactions: userTransactions.map(t => ({
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

// ✅ User transactions endpoint
app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await transactionsCollection.find({ userId: user._id })
      .sort({ date: -1 })
      .toArray();
    
    res.json({
      account_balance: user.balance,
      total_count: userTransactions.length,
      transactions: userTransactions.map(t => ({
        id: t._id,
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

// ✅ Admin endpoints (keep your existing ones, just update to use MongoDB)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await usersCollection.countDocuments();
    const totalBalanceResult = await usersCollection.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]).toArray();
    const totalBalance = totalBalanceResult[0]?.total || 0;
    
    res.json({
      totalUsers,
      totalAccounts: totalUsers,
      totalBalance: totalBalance.toFixed(2)
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const allUsers = await usersCollection.find({}).toArray();
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => ({
      ...user,
      Account: {
        account_number: user.accountNumber,
        balance: user.balance
      }
    }));
    
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Server error' });
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
    message: 'Banking API Server with MongoDB is running!',
    status: 'OK'
  });
});

// ✅ Debug route
app.get('/api/debug/users', async (req, res) => {
  try {
    const allUsers = await usersCollection.find({}).toArray();
    console.log('=== ALL USERS ===');
    console.log(allUsers);
    res.json({ users: allUsers.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role })) });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ MongoDB URI: ${MONGODB_URI ? 'Connected' : 'Not set'}`);
});