const express = require('express');
const { User, Account, Transaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Get user dashboard data
// Get user dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user's account with balance
        const account = await Account.findOne({ 
            where: { user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found for user' });
        }

        // Get all transactions (not just recent)
        const transactions = await Transaction.findAll({
            where: { account_id: account.id },
            order: [['createdAt', 'ASC']] // Oldest first for balance calculation
        });

        // Calculate running balance for each transaction
        let runningBalance = 0;
        const transactionsWithBalance = transactions.map(transaction => {
            if (transaction.type === 'deposit') {
                runningBalance += parseFloat(transaction.amount);
            } else {
                runningBalance -= parseFloat(transaction.amount);
            }
            
            return {
                id: transaction.id,
                type: transaction.type,
                amount: parseFloat(transaction.amount),
                description: transaction.description,
                date: transaction.createdAt,
                balance: runningBalance
            };
        });

        // Get recent transactions (last 10) for the table
        const recentTransactions = transactionsWithBalance
            .slice(-10) // Last 10 transactions
            .reverse(); // Newest first for display

        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            account: {
                account_number: account.account_number,
                balance: parseFloat(account.balance),
                account_created: account.createdAt
            },
            recent_transactions: recentTransactions,
            total_transactions: transactions.length
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            message: 'Error fetching dashboard data',
            error: error.message 
        });
    }
});

// Get user account details
router.get('/account', async (req, res) => {
    try {
        const userId = req.user.id;

        const account = await Account.findOne({ 
            where: { user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json({
            account_number: account.account_number,
            current_balance: parseFloat(account.balance),
            account_created: account.createdAt,
            account_type: 'Savings Account',
            status: 'Active'
        });

    } catch (error) {
        console.error('Account error:', error);
        res.status(500).json({ message: 'Error fetching account details' });
    }
});

// Get full transaction history
router.get('/transactions', async (req, res) => {
    try {
        const userId = req.user.id;

        const account = await Account.findOne({ 
            where: { user_id: userId }
        });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const transactions = await Transaction.findAll({
            where: { account_id: account.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            transactions: transactions.map(t => ({
                id: t.id,
                type: t.type,
                amount: parseFloat(t.amount),
                description: t.description,
                date: t.createdAt
            })),
            total_count: transactions.length,
            account_balance: parseFloat(account.balance)
        });

    } catch (error) {
        console.error('Transactions error:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

module.exports = router;