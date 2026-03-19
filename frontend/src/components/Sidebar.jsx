import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ userType }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const manufacturerLinks = [
    { path: '/manufacturer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/manufacturer/products', label: 'My Products', icon: '📦' },
    { path: '/manufacturer/requests', label: 'Product Requests', icon: '📋' },
    { path: '/manufacturer/orders', label: 'Orders', icon: '🛒' },
    { path: '/manufacturer/profile', label: 'Profile', icon: '👤' },
  ];

  const retailerLinks = [
    { path: '/retailer/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/retailer/marketplace', label: 'Marketplace', icon: '🏪' },
    { path: '/retailer/send-request', label: 'Send Product Request', icon: '📤' },
    { path: '/retailer/my-requests', label: 'My Requests', icon: '📋' },
    { path: '/retailer/orders', label: 'Orders', icon: '🛒' },
    { path: '/retailer/bills', label: 'Bills/Invoices', icon: '🧾' },
    { path: '/retailer/profile', label: 'Profile', icon: '👤' },
  ];

  const links = userType === 'manufacturer' ? manufacturerLinks : retailerLinks;

  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear auth state and navigate to landing
    logout();
    navigate('/');
  };

  return (
    <div className={`bg-gray-900 text-white min-h-screen transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-4 flex items-center justify-between">
        <div className={`flex items-center space-x-2 ${!isOpen && 'justify-center w-full'}`}>
          <div className="bg-primary-600 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          {isOpen && (
            <div className="flex items-center space-x-1">
              <span className="font-bold text-lg">Agaram Agency</span>
              {useAuth().user?.isVerified && (
                <span className="text-blue-400" title="Verified Official Account">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className="mt-8 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              title={!isOpen ? link.label : ''}
            >
              <span className="text-xl">{link.icon}</span>
              {isOpen && <span className="font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {isOpen && (
        <div className="mt-auto pt-4 border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
      {!isOpen && (
        <div className="mt-auto pt-4 border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            title="Logout"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;