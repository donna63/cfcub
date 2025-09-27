const express = require('express');
const { User, Account, Transaction } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Generate random account number
function generateAccountNumber() {
    return 'ACC' + Date.now() + Math.floor(Math.random() * 1000);
}

// Create new user and bank account
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, initialBalance = 0 } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user (password will be hashed automatically by model hooks)
        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        // Create bank account for user
        const account = await Account.create({
            user_id: user.id,
            account_number: generateAccountNumber(),
            balance: parseFloat(initialBalance)
        });

        // If initial balance > 0, create initial deposit transaction
        if (initialBalance > 0) {
            await Transaction.create({
                account_id: account.id,
                type: 'deposit',
                amount: parseFloat(initialBalance),
                description: 'Initial account deposit'
            });
        }

        // Return user info without password
        res.status(201).json({
            message: 'User and account created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            account: {
                account_number: account.account_number,
                balance: account.balance
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// Add transaction to user account
router.post('/transactions', async (req, res) => {
    try {
        const { userId, type, amount, description, transactionDate } = req.body;

        // Find user's account
        const account = await Account.findOne({ where: { user_id: userId } });
        if (!account) {
            return res.status(404).json({ message: 'User account not found' });
        }

        // Validate transaction type
        const validTypes = ['deposit', 'withdrawal'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        // Calculate new balance
        let newBalance = parseFloat(account.balance);
        const transactionAmount = parseFloat(amount);

        if (type === 'deposit') {
            newBalance += transactionAmount;
        } else if (type === 'withdrawal') {
            if (newBalance < transactionAmount) {
                return res.status(400).json({ message: 'Insufficient funds' });
            }
            newBalance -= transactionAmount;
        }

        // Update account balance
        account.balance = newBalance;
        await account.save();

        // Create transaction record with custom date
        const transactionData = {
            account_id: account.id,
            type,
            amount: transactionAmount,
            description
        };

        // If custom date provided, use it
        if (transactionDate) {
            transactionData.createdAt = new Date(transactionDate);
            transactionData.updatedAt = new Date(transactionDate);
        }

        const transaction = await Transaction.create(transactionData);

        res.status(201).json({
            message: 'Transaction completed successfully',
            transaction: {
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description,
                date: transaction.createdAt
            },
            new_balance: account.balance
        });

    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ message: 'Error processing transaction' });
    }
});

// Get all users with their accounts
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: 'user' },
            include: [{
                model: Account,
                attributes: ['account_number', 'balance']
            }],
            attributes: ['id', 'name', 'email', 'createdAt']
        });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get admin dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.count({ where: { role: 'user' } });
        const totalAccounts = await Account.count();
        const totalBalanceResult = await Account.sum('balance');

        res.json({
            totalUsers,
            totalAccounts,
            totalBalance: totalBalanceResult || 0
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

module.exports = router;