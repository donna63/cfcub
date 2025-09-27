const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - More permissive CORS for production
app.use(cors({
    origin: true, // Allow all origins in production (we'll restrict later)
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// Health check endpoint (important for Render)
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Banking API is running!', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Banking API Server is running!',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            admin: '/api/admin'
        },
        documentation: 'API documentation available at /api endpoints'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
    
    try {
        await testConnection();
        console.log('✅ Database connection successful');
        
        await syncDatabase();
        console.log('✅ Database synced successfully');
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('⚠️  Server starting without database connection');
    }
});