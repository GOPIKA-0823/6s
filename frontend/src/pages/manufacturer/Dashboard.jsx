import { useState, useEffect } from 'react';
import { getManufacturerStats } from '../../services/dummyData';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

/**
 * Manufacturer Dashboard Component
 * 
 * Displays:
 * - Statistics cards: Total Products, Pending Requests, Active Orders, Total Revenue
 * - Recent product requests from retailers
 * - Recent orders from customers
 * - Analytics tab with charts and detailed insights
 * 
 * Data is fetched dynamically from the backend API,
 * filtered to show only the logged-in manufacturer's data
 */
const ManufacturerDashboard = () => {
  // State to store stats data and loading status
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingRequests: 0,
    activeOrders: 0,
    totalRevenue: 0,
    recentRequests: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call the async function to get manufacturer stats
        const data = await getManufacturerStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stat cards configuration
  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: '📋',
      bgColor: 'bg-yellow-500',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: '🛒',
      bgColor: 'bg-green-500',
    },
  ];

  // Loading state UI
  if (loading && activeTab === 'overview') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturer Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard data...</p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Fetching real-time data from database...</p>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error && activeTab === 'overview') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manufacturer Dashboard</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          Manufacturer Dashboard
          {JSON.parse(localStorage.getItem('agaram_user'))?.isVerified && (
            <span className="text-blue-500" title="Verified Account">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </span>
          )}
        </h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your business.</p>
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
          {/* Stats Cards - Display real-time data from database */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity - Fetched from MongoDB */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Product Requests */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Product Requests</h2>
              {stats.recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentRequests.map((request) => (
                    <div key={request.id} className="border-l-4 border-primary-500 pl-4 py-2">
                      <p className="font-semibold text-gray-900">{request.productName}</p>
                      <p className="text-sm text-gray-600">Requested by {request.retailerName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Quantity: {request.quantity} | Status: <span className="font-medium">{request.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent requests</p>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">Status: <span className="font-medium capitalize">{order.status}</span></p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent orders</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard userType="manufacturer" />
      )}
    </div>
  );
};

export default ManufacturerDashboard;