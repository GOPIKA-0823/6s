import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const LoginPage = () => {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('agaram_saved_email');
    const savedPassword = localStorage.getItem('agaram_saved_password');
    if (savedEmail && savedPassword) {
      setFormData({
        email: savedEmail,
        password: savedPassword
      });
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email: formData.email, password: formData.password });
      // Extract user object from response (backend returns { message, user })
      const userData = res.data.user;
      const user = { userType: userData.userType || userType, ...userData };
      
      if (rememberMe) {
        localStorage.setItem('agaram_saved_email', formData.email);
        localStorage.setItem('agaram_saved_password', formData.password);
      } else {
        localStorage.removeItem('agaram_saved_email');
        localStorage.removeItem('agaram_saved_password');
      }

      login(user);
      navigate(`/${userType}/dashboard`);
    } catch (err) {
      console.error('Login failed:', err);
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const title = userType === 'manufacturer' ? 'Manufacturer' : 'Retail Shop';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title} Login</h1>
            <p className="text-gray-600">Welcome back to Agaram Agency</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate(`/register/${userType}`)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;