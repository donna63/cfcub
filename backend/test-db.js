const { User, Account, Transaction } = require('./models');

async function checkDatabase() {
    try {
        console.log('🔍 Checking database contents...\n');

        // Check all users
        const users = await User.findAll();
        console.log('📋 ALL USERS:');
        users.forEach(user => {
            console.log(`- ${user.id}: ${user.name} (${user.email}) - Role: ${user.role}`);
        });

        // Check all accounts
        const accounts = await Account.findAll();
        console.log('\n🏦 ALL ACCOUNTS:');
        accounts.forEach(account => {
            console.log(`- User ID: ${account.user_id} | Account: ${account.account_number} | Balance: $${account.balance}`);
        });

        // Check all transactions
        const transactions = await Transaction.findAll();
        console.log('\n💳 ALL TRANSACTIONS:');
        transactions.forEach(t => {
            console.log(`- Account: ${t.account_id} | ${t.type} | $${t.amount} | ${t.description}`);
        });

    } catch (error) {
        console.error('Error checking database:', error);
    }
}

checkDatabase();