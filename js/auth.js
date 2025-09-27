// API Base URL - Pointing to your backend on port 5001
const API_BASE = 'http://localhost:5001/api';

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'index.html'; // Redirect to login
        return null;
    }
    
    return JSON.parse(user);
}

// Login function 
async function login(email, password) {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // Save token and user data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Get user dashboard data
async function getDashboardData() {
    return await apiCall('/users/dashboard');
}

// Get dashboard data
// async function getDashboardData() {
//     return await apiCall('/users/dashboard');
// }

// Get account details
async function getAccountDetails() {
    return await apiCall('/users/account');
}

// Get transaction history
async function getTransactionHistory() {
    return await apiCall('/users/transactions');
}

// Load and display dashboard data
async function loadDashboardData(user) {
    try {
        const dashboardData = await getDashboardData();
        
        // Update the dashboard with real data
        document.getElementById('userName').textContent = dashboardData.user.name;
        document.getElementById('welcomeName').textContent = dashboardData.user.name;
        
        // Update account balance
        document.getElementById('accountBalance').textContent = '$' + dashboardData.account.balance;
        document.getElementById('accountNumber').textContent = dashboardData.account.account_number;
        
        // Update recent transactions
        const transactionsContainer = document.getElementById('recentTransactions');
        if (dashboardData.recent_transactions.length > 0) {
            transactionsContainer.innerHTML = dashboardData.recent_transactions.map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-type ${transaction.type}">${transaction.type}</div>
                    <div class="transaction-amount">$${transaction.amount}</div>
                    <div class="transaction-desc">${transaction.description}</div>
                    <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
                </div>
            `).join('');
        } else {
            transactionsContainer.innerHTML = '<p>No transactions yet.</p>';
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data: ' + error.message);
    }
}