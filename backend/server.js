const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - Remove the duplicate declarations below
app.use(cors({
    origin: [
        'http://127.0.0.1:5500', 
        'http://localhost:5500', 
        'http://localhost:3000',
        'https://your-vercel-app.vercel.app' // We'll update this later
    ],
    credentials: true
}));

// Or for development, you can use:
// app.use(cors());

// Or if you want to allow all origins (for development), use this instead:
// app.use(cors());

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        message: 'Banking API is running!', 
        timestamp: new Date().toISOString() 
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await testConnection();
    await syncDatabase();
});