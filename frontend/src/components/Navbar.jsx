import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component with South Indian Food Theme
 * 
 * Colors used:
 * - Banana Leaf Green (#2E7D32): Main brand color
 * - Turmeric Yellow (#FFC107): Accent and highlights
 * - Spice Orange (#FF6B35): Call-to-action buttons
 * 
 * The navbar represents the organic, fresh nature of South Indian cuisine
 */
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-primary-500 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - South Indian Style */}
          <Link to="/" className="flex items-center space-x-3">
            {/* Logo Icon - Banana Leaf inspired */}
            <div className="bg-yellow-300 text-primary-700 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                {/* Stylized leaf icon */}
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xl font-bold leading-none">Agaram</span>
              <span className="text-yellow-200 text-xs font-semibold">Food Agency</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-white hover:bg-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm font-medium">
                  Welcome, {user.companyName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:bg-primary-600 p-2 rounded-md transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-primary-600">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white hover:bg-primary-700 px-3 py-2 rounded-md font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left bg-accent-500 hover:bg-accent-600 text-white px-3 py-2 rounded-md font-medium transition-colors"
              >
                Logout
              </button>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;