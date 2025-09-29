// Union Bank - Main JavaScript File
// Handles dark mode, mobile menu, and common functionality

document.addEventListener('DOMContentLoaded', function() {
    // Dark mode functionality
    initDarkMode();
    
    // Mobile menu functionality
    initMobileMenu();
    
    // Newsletter form (if present)
    initNewsletter();
});

// Dark Mode Management
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    const sunIconMobile = document.getElementById('sunIconMobile');
    const moonIconMobile = document.getElementById('moonIconMobile');

    // Check for saved dark mode preference or default to light mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        toggleIcons(true);
    }

    // Desktop toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            toggleDarkMode();
        });
    }

    // Mobile toggle
    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('click', function() {
            toggleDarkMode();
        });
    }

    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        toggleIcons(isDark);
    }

    function toggleIcons(isDark) {
        if (sunIcon && moonIcon) {
            if (isDark) {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        }

        if (sunIconMobile && moonIconMobile) {
            if (isDark) {
                sunIconMobile.classList.remove('hidden');
                moonIconMobile.classList.add('hidden');
            } else {
                sunIconMobile.classList.add('hidden');
                moonIconMobile.classList.remove('hidden');
            }
        }
    }
}

// Mobile Menu Management
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isOpen = !mobileMenu.classList.contains('hidden');
            
            if (isOpen) {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            } else {
                mobileMenu.classList.remove('hidden');
                menuIcon.classList.add('hidden');
                closeIcon.classList.remove('hidden');
            }
        });

        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        });
    }
}

// Newsletter Form Management
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value.trim();
            
            if (!email) {
                alert('Please enter your email address');
                return;
            }
            
            if (!/\S+@\S+\.\S+/.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Simulate successful subscription
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
}

// Utility Functions

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone number formatting helper
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation helpers
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.classList.add('border-destructive');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.classList.remove('border-destructive');
        errorElement.classList.add('hidden');
    }
}

function clearAllErrors(fieldIds) {
    fieldIds.forEach(fieldId => {
        clearFieldError(fieldId);
    });
}

// Input sanitization
function sanitizeInput(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    
    // Remove HTML tags and trim whitespace
    const sanitized = input.replace(/<[^>]*>/g, '').trim();
    
    // Limit length
    return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

// Loading state management
function setLoadingState(buttonElement, isLoading = true) {
    if (!buttonElement) return;
    
    if (isLoading) {
        buttonElement.disabled = true;
        buttonElement.classList.add('opacity-50', 'cursor-not-allowed');
        const originalText = buttonElement.textContent;
        buttonElement.setAttribute('data-original-text', originalText);
        buttonElement.textContent = 'Loading...';
    } else {
        buttonElement.disabled = false;
        buttonElement.classList.remove('opacity-50', 'cursor-not-allowed');
        const originalText = buttonElement.getAttribute('data-original-text');
        if (originalText) {
            buttonElement.textContent = originalText;
        }
    }
}

// Toast notification system (basic implementation)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    // Set styling based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-black');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg font-bold">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Export functions for use in other scripts (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        formatPhoneNumber,
        sanitizeInput,
        showFieldError,
        clearFieldError,
        clearAllErrors,
        setLoadingState,
        showNotification
    };
}

// ✅ Create user endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, initialBalance = 0 } = req.body;
    
    console.log('Creating user:', { name, email, initialBalance });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password, // In real app, hash this!
      role: 'user',
      accountNumber: `UB${Date.now().toString().slice(-8)}`,
      balance: parseFloat(initialBalance) || 0,
    });

    // Create initial transaction if balance > 0
    if (initialBalance > 0) {
      await Transaction.create({
        userId: newUser._id,
        type: 'deposit',
        amount: parseFloat(initialBalance),
        description: 'Initial account funding',
        balance_after: parseFloat(initialBalance),
      });
    }

    // Return user without password
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// ✅ ADMIN ADD TRANSACTION ENDPOINT
app.post('/api/admin/transactions', async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;
    
    console.log('Adding transaction:', { userId, type, amount, description });

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let newBalance = user.balance;

    // Update balance based on transaction type
    if (type === 'deposit') {
      newBalance += parseFloat(amount);
    } else if (type === 'withdrawal') {
      if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      newBalance -= parseFloat(amount);
    }

    // Update user balance
    user.balance = newBalance;
    await user.save();

    // Create transaction record
    const newTransaction = await Transaction.create({
      userId: user._id,
      type,
      amount: parseFloat(amount),
      description,
      balance_after: newBalance,
    });

    res.json({
      success: true,
      new_balance: newBalance.toFixed(2),
      transaction: newTransaction
    });

  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Error processing transaction' });
  }
});

// ✅ User dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await User.findById(userId);
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(10);
    
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;
    
    res.json({
      user: userWithoutPassword,
      account: {
        balance: user.balance,
        account_number: user.accountNumber,
        account_type: "Primary",
        status: "Active"
      },
      recent_transactions: userTransactions.map(t => ({
        date: t.date,
        description: t.description,
        type: t.type,
        amount: t.amount,
        balance: t.balance_after
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error loading dashboard' });
  }
});

// ✅ User transactions endpoint
app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let user;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userIdMatch = token.match(/jwt-token-for-(.+)/);
      
      if (userIdMatch) {
        const userId = userIdMatch[1];
        user = await User.findById(userId);
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userTransactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1 });
    
    res.json({
      account_balance: user.balance,
      total_count: userTransactions.length,
      transactions: userTransactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        balance_after: t.balance_after
      }))
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Error loading transactions' });
  }
});