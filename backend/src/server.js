

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('✅ Starting server with Mongoose...');

const app = express();
const PORT = process.env.PORT || 5001;



// MongoDB connection with Mongoose
const MONGODB_URI = 'mongodb+srv://donnalynn632:william632@cluster0.nedk38z.mongodb.net/union-bank?retryWrites=true&w=majority&appName=Cluster0';

console.log('🔗 Using MongoDB URL:', MONGODB_URI);
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
// ✅ Auth login route - SIMPLE VERSION
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 LOGIN REQUEST:', { email, password });
    
    const user = await User.findOne({ email, password });
    
    if (user) {
      console.log('✅ USER FOUND:', user.email);
      
      const userObject = user.toObject();
      const { password: _, ...userWithoutPassword } = userObject;
      
      res.json({
        success: true,
        token: `jwt-token-for-${user._id}`,
        user: userWithoutPassword
      });
    } else {
      console.log('❌ USER NOT FOUND');
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




// ✅ ADMIN ADD TRANSACTION ENDPOINT - ENHANCED
app.post('/api/admin/transactions', async (req, res) => {
  try {
    const { userId, type, amount, description, date } = req.body;
    
    console.log('💳 ADD TRANSACTION REQUEST =================================');
    console.log('📥 Full request body:', req.body);

    // Validate required fields
    if (!userId || !type || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, and amount are required' 
      });
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid transaction type. Must be "deposit" or "withdrawal"' 
      });
    }

    // Try to find user by ID
    let user;
    try {
      user = await User.findById(userId);
    } catch (error) {
      console.log('❌ Invalid user ID format:', userId);
      return res.status(400).json({ 
        error: 'Invalid user ID format' 
      });
    }
    
    if (!user) {
      console.log('❌ User not found with ID:', userId);
      
      // List available users for debugging
      const allUsers = await User.find({}, 'name email _id');
      console.log('📋 Available users:');
      allUsers.forEach(u => console.log(`   - ${u._id}: ${u.email}`));
      
      return res.status(404).json({ 
        error: `User not found with ID: ${userId}`,
        available_users: allUsers.map(u => ({ id: u._id, email: u.email, name: u.name }))
      });
    }

    console.log('✅ User found:', user.email);
    console.log('💰 Current balance:', user.balance);
    console.log('💸 Transaction amount:', amount);
    console.log('📝 Transaction type:', type);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be a positive number' 
      });
    }

    let newBalance = user.balance;

    // Update balance based on transaction type
    if (type === 'deposit') {
      newBalance += amountNum;
      console.log('✅ Deposit - New balance:', newBalance);
    } else if (type === 'withdrawal') {
      if (user.balance < amountNum) {
        console.log('❌ Insufficient funds:', user.balance, '<', amountNum);
        return res.status(400).json({ 
          error: `Insufficient funds. Current balance: $${user.balance}, Attempted withdrawal: $${amountNum}` 
        });
      }
      newBalance -= amountNum;
      console.log('✅ Withdrawal - New balance:', newBalance);
    }

    // Update user balance
    user.balance = newBalance;
    await user.save();
    console.log('✅ User balance updated to:', newBalance);

    // Create transaction record
 // ✅ USE THE CUSTOM DATE FROM ADMIN PANEL
    let transactionDate = new Date();
    if (date) {
      transactionDate = new Date(date);
      console.log('📅 Using custom date from admin:', transactionDate.toISOString());
    } else {
      console.log('📅 Using current date');
    }

    // Create transaction record with the selected date
    // Create transaction record with the selected date - FIXED
const newTransaction = await Transaction.create({
  userId: user._id,
  type,
  amount: amountNum,
  description: description || `Admin ${type}`,
  balance_after: newBalance,
  date: new Date(transactionDate.getTime() - (transactionDate.getTimezoneOffset() * 60000)) // FIX: Remove timezone offset
});

    console.log('✅ Transaction created successfully');
    console.log('📄 Transaction ID:', newTransaction._id);

    res.json({
      success: true,
      message: 'Transaction completed successfully',
      new_balance: newBalance.toFixed(2),
      transaction: {
        id: newTransaction._id,
        type: newTransaction.type,
        amount: newTransaction.amount,
        description: newTransaction.description,
        date: newTransaction.date
      }
    });

  } catch (error) {
    console.error('❌ TRANSACTION ERROR:', error);
    res.status(500).json({ 
      error: 'Error processing transaction',
      details: error.message 
    });
  }
});

// ✅ User dashboard endpoint - EXACT USER MATCHING
app.get('/api/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('📊 DASHBOARD REQUEST =================================');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ NO VALID AUTHORIZATION HEADER');
      return res.status(401).json({ message: 'No authorization token' });
    }

    const token = authHeader.substring(7);
    console.log('🔐 TOKEN RECEIVED:', token);
    
    const userIdMatch = token.match(/jwt-token-for-(.+)/);
    
    if (!userIdMatch) {
      console.log('❌ INVALID TOKEN FORMAT');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const userId = userIdMatch[1];
    console.log('🔍 EXTRACTED USER ID:', userId);
    console.log('🔍 TYPE OF USER ID:', typeof userId);
    
    // Find the EXACT user - no fallbacks!
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ USER NOT FOUND WITH ID:', userId);
      
      // List all users to see what's in the database
      const allUsers = await User.find({});
      console.log('📋 ALL USERS IN DATABASE:');
      allUsers.forEach(u => {
        console.log(`   - ${u._id} (${typeof u._id}): ${u.email} - ${u.name}`);
      });
      
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ USER FOUND FOR DASHBOARD:');
    console.log('   - User ID:', user._id);
    console.log('   - Email:', user.email);
    console.log('   - Name:', user.name);
    console.log('   - Balance:', user.balance);
    
    // Get THIS USER'S transactions only
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    console.log('💳 USER TRANSACTIONS FOUND:', userTransactions.length);
    
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    
    const responseData = {
      user: {
        ...userWithoutPassword,
        id: user._id.toString(), // Ensure it's a string
        accountNumber: user.accountNumber
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
    };
    
    console.log('✅ DASHBOARD RESPONSE SENT');
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ DASHBOARD ERROR:', error);
    res.status(500).json({ message: 'Error loading dashboard' });
  }
});

/// ✅ User transactions endpoint - EXACT USER MATCHING
app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('💳 TRANSACTIONS REQUEST =================================');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token' });
    }

    const token = authHeader.substring(7);
    console.log('🔐 TOKEN RECEIVED:', token);
    
    const userIdMatch = token.match(/jwt-token-for-(.+)/);
    
    if (!userIdMatch) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const userId = userIdMatch[1];
    console.log('🔍 EXTRACTED USER ID:', userId);
    
    // Find the EXACT user
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ USER NOT FOUND FOR TRANSACTIONS:', userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ USER FOUND FOR TRANSACTIONS:', user.email);
    
    // Get THIS USER'S transactions only
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 });

    console.log('📊 TRANSACTIONS FOUND:', userTransactions.length);
    
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

// ✅ GET available users for transactions (for admin panel)
app.get('/api/admin/available-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id accountNumber balance');
    console.log('📋 Available users for transactions:', users.length);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// ✅ GET sample transaction test endpoint
app.get('/api/admin/test-transaction', async (req, res) => {
  try {
    // Get the first user
    const user = await User.findOne({ role: 'user' });
    
    if (!user) {
      return res.status(404).json({ error: 'No user found for test transaction' });
    }

    console.log('🎯 Test transaction for:', user.email);
    
    // Just return user info without creating actual transaction
    res.json({
      success: true,
      message: 'Test endpoint working',
      test_user: {
        id: user._id,
        name: user.name,
        email: user.email,
        current_balance: user.balance
      },
      note: 'This endpoint only shows user info. Use POST /api/admin/transactions to create real transactions.'
    });

  } catch (error) {
    console.error('Test transaction error:', error);
    res.status(500).json({ error: 'Test failed: ' + error.message });
  }
});

// ✅ SIMPLE TRANSACTION ENDPOINT - FOR DEBUGGING
// app.post('/api/admin/transactions', async (req, res) => {
//   try {
//     console.log('💳 TRANSACTION REQUEST RECEIVED');
//     console.log('Request body:', req.body);
    
//     const { userId, type, amount, description } = req.body;
    
//     // Basic validation
//     if (!userId || !type || !amount) {
//       return res.status(400).json({ 
//         error: 'Missing required fields' 
//       });
//     }
    
//     console.log('🔍 Looking for user:', userId);
    
//     // Try to find the user
//     const user = await User.findById(userId);
    
//     if (!user) {
//       console.log('❌ User not found');
//       return res.status(404).json({ error: 'User not found' });
//     }
    
//     console.log('✅ User found:', user.email);
    
//     // Simple transaction logic
//     let newBalance = user.balance;
    
//     if (type === 'deposit') {
//       newBalance += parseFloat(amount);
//     } else if (type === 'withdrawal') {
//       if (user.balance < amount) {
//         return res.status(400).json({ error: 'Insufficient funds' });
//       }
//       newBalance -= parseFloat(amount);
//     }
    
//     // Update user
//     user.balance = newBalance;
//     await user.save();
    
//     // Create transaction
//     const transaction = await Transaction.create({
//       userId: user._id,
//       type,
//       amount: parseFloat(amount),
//       description: description || 'Admin transaction',
//       balance_after: newBalance
//     });
    
//     console.log('✅ Transaction successful');
    
//     res.json({
//       success: true,
//       new_balance: newBalance,
//       transaction: transaction
//     });
    
//   } catch (error) {
//     console.error('❌ TRANSACTION ERROR:', error);
//     res.status(500).json({ 
//       error: 'Server error: ' + error.message 
//     });
//   }
// });

// ✅ GET all users with their MongoDB IDs (for admin panel)
app.get('/api/admin/users-with-ids', async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id accountNumber balance role');
    
    const usersWithIds = users.map(user => ({
      mongoId: user._id, // This is what you need for transactions
      name: user.name,
      email: user.email, 
      accountNumber: user.accountNumber,
      balance: user.balance,
      role: user.role
    }));
    
    console.log('📋 Users with MongoDB IDs:', usersWithIds);
    
    res.json({
      success: true,
      users: usersWithIds
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});