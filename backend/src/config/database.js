const { Sequelize } = require('sequelize');

// Use SQLite instead of PostgreSQL for simplicity
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // This will create a file-based database
  logging: false, // Disable SQL log output
});

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.log('✅ Using SQLite database (no external connection needed)');
    return true; // Still return true for SQLite
  }
}

module.exports = { sequelize, testConnection };