// // Add these endpoints to your server.js after the existing routes

// // User dashboard data endpoint
// app.get('/api/users/dashboard', (req, res) => {
//     // For demo: return the first non-admin user or use token to identify
//     const user = users.find(u => u.role === 'user') || users[0];
//     const userTransactions = transactions.filter(t => t.userId === user.id);
    
//     const { password, ...userWithoutPassword } = user;
    
//     res.json({
//         user: userWithoutPassword,
//         account: {
//             balance: user.balance,
//             account_number: user.accountNumber
//         },
//         recent_transactions: userTransactions.slice(-5).map(t => ({
//             date: t.date,
//             description: t.description,
//             type: t.type,
//             amount: t.amount,
//             balance: t.balance_after
//         }))
//     });
// });

// // User account endpoint
// app.get('/api/users/account', (req, res) => {
//     const user = users.find(u => u.role === 'user') || users[0];
//     const { password, ...userData } = user;
//     res.json(userData);
// });

// // User transactions endpoint
// app.get('/api/users/transactions', (req, res) => {
//     const user = users.find(u => u.role === 'user') || users[0];
//     const userTransactions = transactions.filter(t => t.userId === user.id);
//     res.json(userTransactions);
// });


// // js/auth.js - Complete authentication system

// /// js/auth.js - Fixed authentication system

// class AuthSystem {
//     constructor() {
//         this.currentUser = null;
//         this.init();
//     }

//     init() {
//         // Check if user is already logged in
//         this.loadUserSession();
//     }

//     // Mock user data for demo
//     get mockUsers() {
//         return [
//             {
//                 id: 1,
//                 name: 'Mauro',
//                 email: 'mauro@unionbank.com',
//                 password: 'password123',
//                 role: 'user',
//                 accountNumber: '1000001',
//                 balance: 1250000.00,
//                 createdAt: new Date().toISOString()
//             },
//             {
//                 id: 2,
//                 name: 'Admin User',
//                 email: 'admin@unionbank.com',
//                 password: 'admin123',
//                 role: 'admin',
//                 accountNumber: '1000002',
//                 balance: 50000.00,
//                 createdAt: new Date().toISOString()
//             }
//         ];
//     }

//     // Mock transactions data
//     get mockTransactions() {
//         return [
//             {
//                 id: 1,
//                 userId: 1,
//                 date: '2025-09-15',
//                 description: 'Executive Salary Deposit',
//                 type: 'deposit',
//                 amount: 125000.00,
//                 balance_after: 1200000.00
//             },
//             {
//                 id: 2,
//                 userId: 1,
//                 date: '2025-09-14',
//                 description: 'Stock Dividend Payment',
//                 type: 'deposit',
//                 amount: 87500.00,
//                 balance_after: 706343.21
//             },
//             {
//                 id: 3,
//                 userId: 1,
//                 date: '2025-09-13',
//                 description: 'Business Revenue - Q4',
//                 type: 'deposit',
//                 amount: 225000.00,
//                 balance_after: 20843.21
//             },
//             {
//                 id: 4,
//                 userId: 1,
//                 date: '2025-09-12',
//                 description: 'Real Estate Investment Return',
//                 type: 'deposit',
//                 amount: 150000.00,
//                 balance_after: 100543.21
//             }
//         ];
//     }

//     async login(email, password) {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 const user = this.mockUsers.find(u => u.email === email && u.password === password);
                
//                 if (user) {
//                     // Remove password from stored data
//                     const { password: _, ...userWithoutPassword } = user;
//                     this.currentUser = userWithoutPassword;
                    
//                     // Store user session
//                     localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
//                     localStorage.setItem('isLoggedIn', 'true');
                    
//                     console.log('Login successful:', this.currentUser);
//                     resolve({
//                         success: true,
//                         user: this.currentUser
//                     });
//                 } else {
//                     reject(new Error('Invalid email or password'));
//                 }
//             }, 1000);
//         });
//     }

//     logout() {
//         this.currentUser = null;
//         localStorage.removeItem('currentUser');
//         localStorage.removeItem('isLoggedIn');
//         window.location.href = 'login.html';
//     }

//     isAuthenticated() {
//         if (this.currentUser) return true;
        
//         const storedUser = localStorage.getItem('currentUser');
//         if (storedUser) {
//             this.currentUser = JSON.parse(storedUser);
//             return true;
//         }
        
//         return false;
//     }

//     getCurrentUser() {
//         if (!this.isAuthenticated()) {
//             return null;
//         }
//         return this.currentUser;
//     }

//     loadUserSession() {
//         const isLoggedIn = localStorage.getItem('isLoggedIn');
//         const storedUser = localStorage.getItem('currentUser');
        
//         if (isLoggedIn === 'true' && storedUser) {
//             this.currentUser = JSON.parse(storedUser);
//             console.log('User session loaded:', this.currentUser);
//         }
//     }

//     requireAuth(redirectTo = 'login.html') {
//         if (!this.isAuthenticated()) {
//             window.location.href = redirectTo;
//             return false;
//         }
//         return true;
//     }

//     async getDashboardData() {
//         if (!this.isAuthenticated()) {
//             throw new Error('User not authenticated');
//         }

//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 const userTransactions = this.mockTransactions.filter(t => t.userId === this.currentUser.id);
                
//                 const dashboardData = {
//                     user: this.currentUser,
//                     account: {
//                         balance: this.currentUser.balance,
//                         account_number: this.currentUser.accountNumber
//                     },
//                     recent_transactions: userTransactions.slice(-5).map(t => ({
//                         date: t.date,
//                         description: t.description,
//                         type: t.type,
//                         amount: t.amount,
//                         balance: t.balance_after
//                     }))
//                 };
                
//                 console.log('Dashboard data loaded:', dashboardData);
//                 resolve(dashboardData);
//             }, 500);
//         });
//     }
// }

// // Create global instance
// window.authSystem = new AuthSystem();

// // Make functions globally available for backward compatibility
// window.login = (email, password) => window.authSystem.login(email, password);
// window.logout = () => window.authSystem.logout();
// window.checkAuth = () => window.authSystem.isAuthenticated();
// window.getDashboardData = () => window.authSystem.getDashboardData();

// js/auth.js - Client-side authentication that talks to your backend
// js/auth.js - Fixed authentication system

// class AuthSystem {
//     constructor() {
//         this.currentUser = null;
//         this.baseURL = 'https://banking-backend-hqe6.onrender.com';
//         this.init();
//     }

//     init() {
//         this.loadUserSession();
//     }

//     async login(email, password) {
//         try {
//             console.log('🔄 Attempting login:', email);
            
//             const response = await fetch(this.baseURL + '/api/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ email, password })
//             });

//             console.log('📡 Login response status:', response.status);

//             const result = await response.json();
//             console.log('📡 Login response data:', result);

//             if (!response.ok) {
//                 throw new Error(result.message || 'Invalid email or password');
//             }

//             // Check for success flag or token
//             if (result.success || result.token) {
//                 this.currentUser = result.user;
                
//                 // Store user session
//                 localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
//                 localStorage.setItem('authToken', result.token);
//                 localStorage.setItem('isLoggedIn', 'true');
                
//                 console.log('✅ Login successful:', this.currentUser);
                
//                 return {
//                     success: true,
//                     user: this.currentUser
//                 };
//             } else {
//                 throw new Error('Login failed: Invalid response from server');
//             }
//         } catch (error) {
//             console.error('❌ Login error:', error);
//             throw new Error('Login failed: ' + error.message);
//         }
//     }

//     logout() {
//         this.currentUser = null;
//         localStorage.removeItem('currentUser');
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('isLoggedIn');
//         window.location.href = 'login.html';
//     }

//     isAuthenticated() {
//         if (this.currentUser) return true;
        
//         const storedUser = localStorage.getItem('currentUser');
//         if (storedUser) {
//             this.currentUser = JSON.parse(storedUser);
//             return true;
//         }
        
//         return false;
//     }

//     getCurrentUser() {
//         return this.currentUser;
//     }

//     loadUserSession() {
//         const storedUser = localStorage.getItem('currentUser');
//         if (storedUser) {
//             this.currentUser = JSON.parse(storedUser);
//             console.log('✅ User session loaded:', this.currentUser);
//         }
//     }

//     requireAuth(redirectTo = 'login.html') {
//         if (!this.isAuthenticated()) {
//             window.location.href = redirectTo;
//             return false;
//         }
//         return true;
//     }

//     async getDashboardData() {
//         try {
//             const data = await apiCall('/api/dashboard');
//             console.log('📊 Dashboard data:', data);
//             return data;
//         } catch (error) {
//             console.error('Error fetching dashboard:', error);
//             throw error;
//         }
//     }
// }

// // ✅ SINGLE API Call Helper Function (NO DUPLICATES)
// async function apiCall(endpoint, options = {}) {
//     const baseURL = 'https://banking-backend-hqe6.onrender.com';
//     const url = baseURL + endpoint;
    
//     console.log('🔄 API Call:', url);
    
//     const config = {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('token') || 'test-token'}`
//         },
//         ...options
//     };
    
//     if (options.body) {
//         config.body = options.body;
//     }
    
//     try {
//         const response = await fetch(url, config);
        
//         console.log('📡 Response status:', response.status);
        
//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`HTTP ${response.status}: ${errorText}`);
//         }
        
//         return await response.json();
        
//     } catch (error) {
//         console.error('❌ API Call Error:', error);
//         throw error;
//     }
// }

// // ✅ Get Dashboard Data
// async function getDashboardData() {
//     try {
//         const data = await apiCall('/api/dashboard');
//         console.log('📊 Dashboard data:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching dashboard:', error);
//         throw error;
//     }
// }

// // ✅ Get Transaction History
// async function getTransactionHistory() {
//     try {
//         const data = await apiCall('/api/transactions');
//         console.log('📋 Transaction data:', data);
//         return data;
//     } catch (error) {
//         console.error('Error fetching transactions:', error);
//         throw error;
//     }
// }

// // Create global instance
// window.authSystem = new AuthSystem();

// // Make functions globally available
// window.checkAuth = () => window.authSystem.isAuthenticated();
// window.logout = () => window.authSystem.logout();
// window.getDashboardData = getDashboardData;
// window.getTransactionHistory = getTransactionHistory;

// // Check auth on page load
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🔐 Auth system initialized');
//     console.log('User authenticated:', window.authSystem.isAuthenticated());
//     console.log('Current user:', window.authSystem.getCurrentUser());
// });




// js/auth.js - SIMPLIFIED AUTH SYSTEM

// // ✅ Check if user is logged in
// function checkAuth() {
//     const user = localStorage.getItem('user');
//     const token = localStorage.getItem('token');
    
//     console.log('🔐 Auth check:');
//     console.log('- User exists:', !!user);
//     console.log('- Token exists:', !!token);
    
//     if (user && token) {
//         const userData = JSON.parse(user);
//         console.log('✅ User authenticated:', userData.name);
//         return userData;
//     }
    
//     console.log('❌ No user found');
//     return null;
// }

// // ✅ Simple logout
// function logout() {
//     console.log('🚪 Logging out...');
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     window.location.href = 'login.html';
// }

// // ✅ Require authentication (stops redirect loops)
// function requireAuth() {
//     const user = checkAuth();
//     if (!user) {
//         console.log('🔒 Redirecting to login');
//         window.location.href = 'login.html';
//         return null;
//     }
//     return user;
// }

// // Make functions global
// window.checkAuth = checkAuth;
// window.logout = logout;
// window.requireAuth = requireAuth;


// js/auth.js - USES sessionStorage INSTEAD of localStorage

// ✅ Check if user is logged in
function checkAuth() {
    try {
        const user = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        
        console.log('🔐 Auth check:');
        console.log('- User exists:', !!user);
        console.log('- Token exists:', !!token);
        
        if (user && token) {
            const userData = JSON.parse(user);
            console.log('✅ User authenticated:', userData.name);
            return userData;
        }
        
        console.log('❌ No user found');
        return null;
    } catch (error) {
        console.log('❌ Storage access denied, using memory fallback');
        return window.__tempUser || null;
    }
}

// ✅ Simple logout
function logout() {
    console.log('🚪 Logging out...');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.__tempUser = null;
    window.location.href = 'login.html';
}

// ✅ Require authentication
function requireAuth() {
    const user = checkAuth();
    if (!user) {
        console.log('🔒 Redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// ✅ Save user data
function saveUser(userData) {
    try {
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', 'token-' + userData.id);
        window.__tempUser = userData; // Memory fallback
        console.log('💾 User saved successfully');
    } catch (error) {
        console.log('❌ Cannot save to storage, using memory only');
        window.__tempUser = userData;
    }
}

// Make functions global
window.checkAuth = checkAuth;
window.logout = logout;
window.requireAuth = requireAuth;
window.saveUser = saveUser;


// ✅ API Call Helper Function - ADD THIS TO YOUR auth.js
async function apiCall(endpoint, options = {}) {
    const baseURL = 'https://banking-backend-hqe6.onrender.com';
    const url = baseURL + endpoint;
    
    console.log('🔄 API Call:', url);
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    if (options.body) {
        config.body = options.body;
    }
    
    try {
        const response = await fetch(url, config);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('❌ API Call Error:', error);
        throw error;
    }
}

// Make it global
window.apiCall = apiCall;

// ✅ API Call Helper Function - ADD THIS TO YOUR auth.js
async function apiCall(endpoint, options = {}) {
    const baseURL = 'https://banking-backend-hqe6.onrender.com';
    const url = baseURL + endpoint;
    
    console.log('🔄 API Call:', url);
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    if (options.body) {
        config.body = options.body;
    }
    
    try {
        const response = await fetch(url, config);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('❌ API Call Error:', error);
        throw error;
    }
}

// ✅ Check if user is logged in
function checkAuth() {
    try {
        const user = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('token');
        
        console.log('🔐 Auth check:');
        console.log('- User exists:', !!user);
        console.log('- Token exists:', !!token);
        
        if (user && token) {
            const userData = JSON.parse(user);
            console.log('✅ User authenticated:', userData.name);
            return userData;
        }
        
        console.log('❌ No user found');
        return null;
    } catch (error) {
        console.log('❌ Storage access denied, using memory fallback');
        return window.__tempUser || null;
    }
}

// ✅ Simple logout
function logout() {
    console.log('🚪 Logging out...');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.__tempUser = null;
    window.location.href = 'login.html';
}

// ✅ Require authentication
function requireAuth() {
    const user = checkAuth();
    if (!user) {
        console.log('🔒 Redirecting to login');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// ✅ Save user data
function saveUser(userData) {
    try {
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('token', 'token-' + userData.id);
        window.__tempUser = userData; // Memory fallback
        console.log('💾 User saved successfully');
    } catch (error) {
        console.log('❌ Cannot save to storage, using memory only');
        window.__tempUser = userData;
    }
}

// Make functions global
window.apiCall = apiCall;
window.checkAuth = checkAuth;
window.logout = logout;
window.requireAuth = requireAuth;
window.saveUser = saveUser;


// Add this to your auth.js if it doesn't exist
async function getTransactionHistory() {
    try {
        const response = await apiCall('/api/transactions');
        return response;
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        throw error;
    }
}

// Update in auth.js - use dashboard endpoint instead
async function getAccountDetails() {
    try {
        const response = await apiCall('/api/dashboard');
        return {
            account_number: response.account.account_number,
            account_type: response.account.account_type,
            current_balance: response.account.balance,
            status: "Active",
            account_created: new Date().toISOString() // You might want to add this to your backend
        };
    } catch (error) {
        console.error('Error fetching account details:', error);
        throw error;
    }
}