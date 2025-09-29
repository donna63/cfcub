

// const express = require('express');
// const cors = require('cors');
// const { MongoClient, ObjectId } = require('mongodb');
// require('dotenv').config();

// console.log('✅ Starting server with MongoDB...');

// const app = express();
// const PORT = process.env.PORT || 5001;

// // MongoDB connection
// const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/banking';
// const DB_NAME = 'banking';
// let db, usersCollection, transactionsCollection;


// // Connect to MongoDB
// async function connectToDatabase() {
//   try {
//     console.log('🔗 Connecting to MongoDB...');
//     console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    
//     const client = new MongoClient(MONGODB_URI, {
//       tls: true,
//       tlsAllowInvalidCertificates: true, // Temporary for debugging
//       tlsAllowInvalidHostnames: true,    // Temporary for debugging
//       retryWrites: true,
//       w: 'majority',
//       serverSelectionTimeoutMS: 5000,
//       connectTimeoutMS: 10000
//     });
    
//     await client.connect();
//     console.log('✅ MongoDB client connected');
    
//     // Test the connection
//     await client.db('admin').command({ ping: 1 });
//     console.log('✅ MongoDB ping successful');
    
//     db = client.db(DB_NAME);
//     console.log(`✅ Using database: ${DB_NAME}`);
    
//     // Get or create collections
//     usersCollection = db.collection('users');
//     transactionsCollection = db.collection('transactions');
//     console.log('✅ Collections initialized');
    
//     // Create initial admin user if doesn't exist
//     const adminExists = await usersCollection.findOne({ email: 'admin@unionbank.com' });
//     if (!adminExists) {
//       const adminResult = await usersCollection.insertOne({
//         name: 'Admin User',
//         email: 'admin@unionbank.com',
//         password: 'admin123',
//         role: 'admin',
//         accountNumber: '1000001',
//         balance: 10000.00,
//         createdAt: new Date().toISOString()
//       });
//       console.log('✅ Admin user created with ID:', adminResult.insertedId);
//     } else {
//       console.log('✅ Admin user already exists');
//     }
    
//     console.log('🎉 MongoDB setup completed successfully');
    
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error);
//     console.error('Error details:', {
//       message: error.message,
//       code: error.code,
//       name: error.name
//     });
//   }
// }

// connectToDatabase();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Auth login route
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     console.log('Login attempt:', email);
    
//     const user = await usersCollection.findOne({ email, password });
    
//     if (user) {
//       const { password: _, ...userWithoutPassword } = user;
      
//       res.json({
//         success: true,
//         token: `jwt-token-for-${user._id}`,
//         user: userWithoutPassword
//       });
//     } else {
//       res.status(401).json({ 
//         success: false,
//         message: 'Invalid email or password' 
//       });
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ✅ Auth me endpoint
// app.get('/api/auth/me', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
//       if (userIdMatch) {
//         const userId = userIdMatch[1];
//         const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
//         if (user) {
//           const { password: _, ...userWithoutPassword } = user;
//           return res.json({ user: userWithoutPassword });
//         }
//       }
//     }
    
//     return res.status(401).json({ message: 'Not authenticated' });
//   } catch (error) {
//     console.error('Auth me error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ✅ Create user endpoint
// app.post('/api/users', async (req, res) => {
//   try {
//     const { name, email, password, initialBalance = 0 } = req.body;
    
//     console.log('Creating user:', { name, email, initialBalance });

//     // Check if user already exists
//     const existingUser = await usersCollection.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User with this email already exists' });
//     }

//     // Create new user
//     const newUser = {
//       name,
//       email,
//       password, // In real app, hash this!
//       role: 'user',
//       accountNumber: `UB${Date.now().toString().slice(-8)}`,
//       balance: parseFloat(initialBalance) || 0,
//       createdAt: new Date().toISOString()
//     };

//     const result = await usersCollection.insertOne(newUser);

//     // Create initial transaction if balance > 0
//     if (initialBalance > 0) {
//       await transactionsCollection.insertOne({
//         userId: result.insertedId,
//         type: 'deposit',
//         amount: parseFloat(initialBalance),
//         description: 'Initial account funding',
//         balance_after: parseFloat(initialBalance),
//         date: new Date().toISOString()
//       });
//     }

//     // Return user without password
//     const { password: _, ...userWithoutPassword } = newUser;
    
//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       user: { ...userWithoutPassword, _id: result.insertedId }
//     });

//   } catch (error) {
//     console.error('User creation error:', error);
//     res.status(500).json({ error: 'Error creating user' });
//   }
// });

// // ✅ User dashboard endpoint
// app.get('/api/dashboard', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     let user;
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
//       if (userIdMatch) {
//         const userId = userIdMatch[1];
//         user = await usersCollection.findOne({ _id: new ObjectId(userId) });
//       }
//     }
    
//     if (!user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }
    
//     const userTransactions = await transactionsCollection.find({ userId: user._id })
//       .sort({ date: -1 })
//       .limit(10)
//       .toArray();
    
//     const { password, ...userWithoutPassword } = user;
    
//     res.json({
//       user: userWithoutPassword,
//       account: {
//         balance: user.balance,
//         account_number: user.accountNumber,
//         account_type: "Primary",
//         status: "Active"
//       },
//       recent_transactions: userTransactions.map(t => ({
//         date: t.date,
//         description: t.description,
//         type: t.type,
//         amount: t.amount,
//         balance: t.balance_after
//       }))
//     });
//   } catch (error) {
//     console.error('Dashboard error:', error);
//     res.status(500).json({ message: 'Error loading dashboard' });
//   }
// });

// // ✅ User transactions endpoint
// app.get('/api/transactions', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     let user;
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
//       if (userIdMatch) {
//         const userId = userIdMatch[1];
//         user = await usersCollection.findOne({ _id: new ObjectId(userId) });
//       }
//     }
    
//     if (!user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }
    
//     const userTransactions = await transactionsCollection.find({ userId: user._id })
//       .sort({ date: -1 })
//       .toArray();
    
//     res.json({
//       account_balance: user.balance,
//       total_count: userTransactions.length,
//       transactions: userTransactions.map(t => ({
//         id: t._id,
//         type: t.type,
//         amount: t.amount,
//         description: t.description,
//         date: t.date,
//         balance_after: t.balance_after
//       }))
//     });
//   } catch (error) {
//     console.error('Transactions error:', error);
//     res.status(500).json({ message: 'Error loading transactions' });
//   }
// });

// // ✅ Admin users endpoint - FIXED VERSION
// app.get('/api/admin/users', async (req, res) => {
//   try {
//     console.log('📊 Fetching all users...');
    
//     // Check if collection exists and is accessible
//     if (!usersCollection) {
//       return res.status(500).json({ error: 'Database not connected' });
//     }
    
//     const allUsers = await usersCollection.find({}).toArray();
//     console.log(`✅ Found ${allUsers.length} users`);
    
//     const usersWithoutPasswords = allUsers.map(({ password, ...user }) => ({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       accountNumber: user.accountNumber,
//       balance: user.balance,
//       createdAt: user.createdAt,
//       Account: {
//         account_number: user.accountNumber,
//         balance: user.balance
//       }
//     }));
    
//     res.json({ 
//       success: true,
//       users: usersWithoutPasswords 
//     });
    
//   } catch (error) {
//     console.error('❌ Admin users error:', error);
//     res.status(500).json({ 
//       error: 'Server error',
//       details: error.message 
//     });
//   }
// });

// // ✅ Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     message: 'Server is healthy!',
//     environment: process.env.NODE_ENV 
//   });
// });

// // ✅ Root
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Banking API Server with MongoDB is running!',
//     status: 'OK'
//   });
// });

// // ✅ Debug route
// app.get('/api/debug/users', async (req, res) => {
//   try {
//     const allUsers = await usersCollection.find({}).toArray();
//     console.log('=== ALL USERS ===');
//     console.log(allUsers);
//     res.json({ users: allUsers.map(u => ({ id: u._id, email: u.email, name: u.name, role: u.role })) });
//   } catch (error) {
//     console.error('Debug users error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ✅ Start server
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
//   console.log(`🗄️ MongoDB URI: ${MONGODB_URI ? 'Connected' : 'Not set'}`);
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('✅ Starting server with Mongoose...');

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection with Mongoose
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/banking';

// Connect to MongoDB with Mongoose
async function connectToDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB with Mongoose...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully with Mongoose');
    
    // Create initial admin user if doesn't exist
    await createInitialAdmin();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  accountNumber: String,
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  amount: Number,
  description: String,
  balance_after: Number,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Create initial admin user
async function createInitialAdmin() {
  try {
    const adminExists = await User.findOne({ email: 'admin@unionbank.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@unionbank.com',
        password: 'admin123',
        role: 'admin',
        accountNumber: '1000001',
        balance: 10000.00
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
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
    
    const user = await User.findOne({ email, password });
    
    if (user) {
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;
      
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
        const user = await User.findById(userId);
        if (user) {
          const userObject = user.toObject();
          const { password: _, ...userWithoutPassword } = userObject;
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

// ✅ Admin users endpoint
app.get('/api/admin/users', async (req, res) => {
  try {
    console.log('📊 Fetching all users...');
    
    const allUsers = await User.find({});
    console.log(`✅ Found ${allUsers.length} users`);
    
    const usersWithoutPasswords = allUsers.map(user => {
      const userObj = user.toObject();
      const { password, ...userWithoutPassword } = userObj;
      return {
        ...userWithoutPassword,
        Account: {
          account_number: user.accountNumber,
          balance: user.balance
        }
      };
    });
    
    res.json({ 
      success: true,
      users: usersWithoutPasswords 
    });
    
  } catch (error) {
    console.error('❌ Admin users error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
});

// ✅ Admin stats endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalanceResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
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

// ✅ Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy!',
    database: dbStatus,
    environment: process.env.NODE_ENV 
  });
});

// ✅ Root
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    message: 'Banking API Server with MongoDB is running!',
    status: 'OK',
    database: dbStatus
  });
});

// ✅ Debug route
app.get('/api/debug/users', async (req, res) => {
  try {
    const allUsers = await User.find({});
    console.log('=== ALL USERS ===');
    console.log(allUsers);
    res.json({ 
      users: allUsers.map(u => ({ 
        id: u._id, 
        email: u.email, 
        name: u.name, 
        role: u.role 
      })) 
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`🗄️ MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});


// // ✅ Create user endpoint
// app.post('/api/users', async (req, res) => {
//   try {
//     const { name, email, password, initialBalance = 0 } = req.body;
    
//     console.log('Creating user:', { name, email, initialBalance });

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User with this email already exists' });
//     }

//     // Create new user
//     const newUser = await User.create({
//       name,
//       email,
//       password, // In real app, hash this!
//       role: 'user',
//       accountNumber: `UB${Date.now().toString().slice(-8)}`,
//       balance: parseFloat(initialBalance) || 0,
//     });

//     // Create initial transaction if balance > 0
//     if (initialBalance > 0) {
//       await Transaction.create({
//         userId: newUser._id,
//         type: 'deposit',
//         amount: parseFloat(initialBalance),
//         description: 'Initial account funding',
//         balance_after: parseFloat(initialBalance),
//       });
//     }

//     // Return user without password
//     const userObject = newUser.toObject();
//     const { password: _, ...userWithoutPassword } = userObject;
    
//     res.status(201).json({
//       success: true,
//       message: 'User created successfully',
//       user: userWithoutPassword
//     });

//   } catch (error) {
//     console.error('User creation error:', error);
//     res.status(500).json({ error: 'Error creating user' });
//   }
// });

// ✅ ADMIN ADD TRANSACTION ENDPOINT
app.post('/api/admin/transactions', async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    console.log('Adding transaction:', { userId, type, amount, description });

    // Find user
    const user = await User.findById(userId);
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
    await user.save();

    // Create transaction record
    const newTransaction = await Transaction.create({
      userId: user._id,
      type,
      amount: parseFloat(amount),
      description,
      balance_after: newBalance,
    });

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

// ✅ User dashboard endpoint - FIXED VERSION
app.get('/api/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await User.findById(userId);
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    
    // Return data in exact format frontend expects
    res.json({
      user: {
        ...userWithoutPassword,
        id: user._id, // Include id field
        accountNumber: user.accountNumber // Make sure accountNumber is included
      },
      account: {
        balance: user.balance,
        account_number: user.accountNumber,
        account_type: "Primary",
        status: "Active"
      },
      recent_transactions: userTransactions.map(t => ({
        id: t._id,
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
// ✅ User transactions endpoint - FIXED VERSION
app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await User.findById(userId);
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 });
    
    res.json({
      account_balance: user.balance,
      total_count: userTransactions.length,
      transactions: userTransactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description,
        date: t.date,
        balance_after: parseFloat(t.balance_after)
      }))
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Error loading transactions' });
  }
});

// ✅ Create user endpoint - ENHANCED VERSION
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, initialBalance = 0 } = req.body;
    
    console.log('Creating user:', { name, email, initialBalance });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: 'user',
      accountNumber: `UB${Date.now().toString().slice(-8)}`,
      balance: parseFloat(initialBalance) || 0,
      createdAt: new Date().toISOString() // Make sure this is included
    });

    // Create initial transaction if balance > 0
    if (initialBalance > 0) {
      await Transaction.create({
        userId: newUser._id,
        type: 'deposit',
        amount: parseFloat(initialBalance),
        description: 'Initial account funding',
        balance_after: parseFloat(initialBalance),
        date: new Date().toISOString()
      });
    }

    // Return user in the exact format frontend expects
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...userWithoutPassword,
        id: newUser._id, // Include both _id and id for compatibility
        Account: {
          account_number: newUser.accountNumber,
          balance: newUser.balance
        }
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// ✅ Debug endpoint to check specific user
app.get('/api/debug/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactions = await Transaction.find({ userId: user._id });
    
    res.json({
      user: user.toObject(),
      transactions: transactions,
      userRaw: user
    });
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});