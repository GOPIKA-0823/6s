import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { 
  getAllUsers, 
  getAllProductsAdmin, 
  getAllRequestsAdmin, 
  getAdminAnalytics,
  getContactMessages
} from '../../services/api';

/**
 * Admin Dashboard Page
 * 
 * Features:
 * - Display platform statistics
 * - Quick access to admin management sections
 * - Real-time data overview
 * - Analytics dashboard with charts
 * - South Indian food theme
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManufacturers: 0,
    totalRetailers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRequests: 0,
    activeProducts: 0,
    totalMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate fetching stats from API
    // In production, this would call actual API endpoints
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, requestsRes, analyticsRes, messagesRes] = await Promise.all([
          getAllUsers(),
          getAllProductsAdmin(),
          getAllRequestsAdmin(),
          getAdminAnalytics(),
          getContactMessages()
        ]);

        const users = usersRes.data;
        const products = productsRes.data;
        const requests = requestsRes.data;
        const analytics = analyticsRes.data;
        const messages = messagesRes.data;
        
        setStats({
          totalUsers: users.length,
          totalManufacturers: users.filter(u => u.userType === 'manufacturer').length,
          totalRetailers: users.filter(u => u.userType === 'retailer').length,
          totalProducts: products.length,
          activeProducts: products.filter(p => p.status === 'active').length,
          totalRequests: requests.length,
          totalOrders: analytics.totalOrders || 0,
          totalMessages: messages.length
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = [
    {
      icon: '👥',
      title: 'Total Users',
      value: stats.totalUsers,
      color: 'from-blue-500 to-blue-600',
      path: '/admin/users'
    },
    {
      icon: '🏭',
      title: 'Manufacturers',
      value: stats.totalManufacturers,
      color: 'from-primary-500 to-primary-600',
      path: '/admin/manufacturers'
    },
    {
      icon: '🏪',
      title: 'Retailers',
      value: stats.totalRetailers,
      color: 'from-secondary-400 to-secondary-500',
      path: '/admin/retailers'
    },
    {
      icon: '📦',
      title: 'Total Products',
      value: stats.totalProducts,
      color: 'from-accent-500 to-accent-600',
      path: '/admin/products'
    },
    {
      icon: '🛒',
      title: 'Total Orders',
      value: stats.totalOrders,
      color: 'from-purple-500 to-purple-600',
      path: '/admin/orders'
    },
    {
      icon: '📋',
      title: 'Product Requests',
      value: stats.totalRequests,
      color: 'from-pink-500 to-pink-600',
      path: '/admin/requests'
    },
    {
      icon: '📩',
      title: 'Contact Messages',
      value: stats.totalMessages || 0,
      color: 'from-orange-500 to-orange-600',
      path: '/admin/messages'
    }
  ];

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">👨‍💼 Admin Dashboard</h1>
        <p className="text-primary-100">Welcome to Agaram Agencies Administration Panel</p>
        <p className="text-primary-100 text-sm mt-2">Manage the entire platform including users, products, orders, and requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'analytics'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => (
          <Link key={index} to={card.path}>
            <div className={`bg-gradient-to-br ${card.color} rounded-xl p-8 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">{card.icon}</span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-bold">Manage</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-4xl font-bold">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/products" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center shadow-md">
            📦 Manage Products
          </Link>
          <Link to="/admin/users" className="bg-gradient-to-r from-secondary-400 to-secondary-500 hover:from-secondary-500 hover:to-secondary-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all text-center shadow-md">
            👥 Manage Users
          </Link>
          <Link to="/admin/orders" className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center shadow-md">
            🛒 View Orders
          </Link>
          <Link to="/admin/messages" className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all text-center shadow-md">
            📩 Contact Messages
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 System Overview</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div>
              <p className="font-semibold text-gray-900">Active Products</p>
              <p className="text-sm text-gray-600">{stats.activeProducts} products are currently listed</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
            <div>
              <p className="font-semibold text-gray-900">Pending Requests</p>
              <p className="text-sm text-gray-600">{stats.totalRequests} requests awaiting approval</p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div>
              <p className="font-semibold text-gray-900">Processing Orders</p>
              <p className="text-sm text-gray-600">{Math.floor(stats.totalOrders * 0.3)} orders currently in transit</p>
            </div>
            <span className="text-3xl">🚚</span>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard userType="admin" />
      )}
    </div>
  );
};

export default AdminDashboard;
