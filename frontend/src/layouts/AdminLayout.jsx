import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Admin Dashboard Layout
 * 
 * Wraps all admin pages with navigation sidebar and header
 * Uses React Router Link for proper client-side navigation
 */
const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">Agaram Admin</h1>
              <p className="text-sm text-primary-100">Platform Manager</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavLink to="/admin/dashboard" icon="📊" label="Dashboard" isActive={location.pathname === '/admin/dashboard'} />
            <NavLink to="/admin/users" icon="👥" label="Users" isActive={location.pathname === '/admin/users'} />
            <NavLink to="/admin/products" icon="📦" label="Products" isActive={location.pathname === '/admin/products'} />
            <NavLink to="/admin/orders" icon="🛒" label="Orders" isActive={location.pathname === '/admin/orders'} />
            <NavLink to="/admin/requests" icon="📋" label="Requests" isActive={location.pathname === '/admin/requests'} />
            <NavLink to="/admin/messages" icon="📩" label="Messages" isActive={location.pathname === '/admin/messages'} />
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-primary-600 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-primary-100 hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/**
 * Navigation Link Component
 * Uses React Router's Link for proper client-side navigation without page reload
 */
const NavLink = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group ${
        isActive
          ? 'bg-white bg-opacity-20 text-white'
          : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default AdminLayout;
