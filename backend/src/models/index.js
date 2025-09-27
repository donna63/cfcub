const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Account Model
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  account_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  }
}, {
  tableName: 'accounts',
  timestamps: true
});

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

// Define Relationships
User.hasOne(Account, { foreignKey: 'user_id' });
Account.belongsTo(User, { foreignKey: 'user_id' });

Account.hasMany(Transaction, { foreignKey: 'account_id' });
Transaction.belongsTo(Account, { foreignKey: 'account_id' });

// Sync database (create tables)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Set force: true to reset database
    console.log('✅ Database tables synchronized');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
};

module.exports = {
  User,
  Account,
  Transaction,
  syncDatabase
};