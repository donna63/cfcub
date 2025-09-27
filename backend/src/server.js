const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✅ Starting server...');
console.log('✅ Environment:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Banking API Server is running!',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is healthy!',
        environment: process.env.NODE_ENV 
    });
});

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Server URL: http://0.0.0.0:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});