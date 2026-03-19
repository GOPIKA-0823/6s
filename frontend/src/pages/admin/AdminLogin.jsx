import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Admin Login Page
 * 
 * Features:
 * - Admin authentication with email and password
 * - South Indian food theme styling
 * - Form validation
 * - Error handling
 */
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Hardcoded admin credentials for demo
      // In production, this should call an API endpoint
      const ADMIN_EMAIL = 'admin@agaram.com';
      const ADMIN_PASSWORD = 'admin123';

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Admin credentials are correct
        const adminUser = {
          _id: 'admin_' + Date.now(),
          email,
          companyName: 'Agaram Admin',
          role: 'admin',
          userType: 'admin'
        };

        // Store admin user in localStorage
        localStorage.setItem('agaram_user', JSON.stringify(adminUser));
        login(adminUser);

        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError('Invalid email or password. Try admin@agaram.com / admin123');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="bg-white rounded-t-xl shadow-2xl p-8 text-center">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">👨‍💼</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agaram Admin</h1>
          <p className="text-gray-600 text-sm">Manage the Food Trading Platform</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-xl shadow-2xl p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@agaram.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-secondary-50 border-l-4 border-secondary-400 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Demo Credentials:</strong><br />
              Email: admin@agaram.com<br />
              Password: admin123
            </p>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Logging in...' : '🔐 Login as Admin'}
          </button>

          {/* Back to Home */}
          <div className="text-center">
            <a href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium underline">
              ← Back to Home
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
