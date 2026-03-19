import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getManufacturerAnalytics, getAdminAnalytics } from '../services/api';

/**
 * Analytics Dashboard Component
 * 
 * Features:
 * - Display key metrics and statistics
 * - Monthly sales chart
 * - Top products/manufacturers chart
 * - Real-time data visualization
 * - Works for both Manufacturer and Admin roles
 */

// Color palette matching South Indian theme
const COLORS = ['#2E7D32', '#FFC107', '#FF6B35', '#1976D2', '#7B1FA2'];

const AnalyticsDashboard = ({ userType = 'manufacturer' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [userType]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userType === 'admin') {
        response = await getAdminAnalytics();
      } else {
        response = await getManufacturerAnalytics();
      }

      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 font-medium">{error || 'No analytics data available'}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare chart data from analytics
  const monthlyChartData = Object.entries(analytics.monthlyData || {}).map(([month, revenue]) => ({
    month,
    revenue: parseFloat(revenue)
  }));

  const topProductsData = (analytics.topProducts || []).map(product => ({
    name: product.name,
    quantity: product.quantity
  }));

  const topManufacturersData = (analytics.topManufacturers || []).map(mfr => ({
    name: mfr.name,
    revenue: parseFloat(mfr.revenue)
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-primary-100">Real-time platform insights and metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-4xl font-bold text-primary-600 mt-2">{analytics.totalOrders}</p>
            </div>
            <span className="text-5xl">📦</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-secondary-400 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-4xl font-bold text-secondary-600 mt-2">₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>
            <span className="text-5xl">💰</span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Delivered Orders</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{analytics.deliveredOrders}</p>
            </div>
            <span className="text-5xl">✅</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-accent-500 hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
              <p className="text-4xl font-bold text-accent-600 mt-2">₹{analytics.averageOrderValue}</p>
            </div>
            <span className="text-5xl">📈</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        {monthlyChartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">💹 Monthly Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff8e7',
                    border: '2px solid #2e7d32',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2E7D32"
                  strokeWidth={3}
                  dot={{ fill: '#2E7D32', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Products Chart */}
        {topProductsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🏆 Top Products (By Quantity)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff8e7',
                    border: '2px solid #2e7d32',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="quantity" fill="#FFC107" radius={[8, 8, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Additional Stats for Admin */}
      {userType === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Processing Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Processing Orders</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.processingOrders}</p>
              </div>
              <span className="text-4xl">⚙️</span>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cancelled Orders</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{analytics.cancelledOrders}</p>
              </div>
              <span className="text-4xl">❌</span>
            </div>
          </div>

          {/* Unique Retailers/Manufacturers */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{userType === 'admin' ? 'Total Manufacturers' : 'Active Retailers'}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.uniqueRetailers || 0}</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Manufacturers (Admin only) */}
      {userType === 'admin' && topManufacturersData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🏢 Top Manufacturers (By Revenue)</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topManufacturersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff8e7',
                  border: '2px solid #2e7d32',
                  borderRadius: '8px'
                }}
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Bar dataKey="revenue" fill="#FF6B35" radius={[8, 8, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue Distribution Pie Chart (if enough data) */}
      {userType === 'admin' && topManufacturersData.length > 1 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Revenue Distribution</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topManufacturersData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {topManufacturersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8 border-l-4 border-primary-500">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700"><strong>Total Orders:</strong> {analytics.totalOrders}</p>
            <p className="text-gray-700"><strong>Total Revenue:</strong> ₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}</p>
            <p className="text-gray-700"><strong>Average Order Value:</strong> ₹{analytics.averageOrderValue}</p>
          </div>
          <div>
            <p className="text-gray-700"><strong>Delivered Orders:</strong> {analytics.deliveredOrders} ({((analytics.deliveredOrders / (analytics.totalOrders || 1)) * 100).toFixed(1)}%)</p>
            <p className="text-gray-700"><strong>Processing Orders:</strong> {analytics.processingOrders}</p>
            {analytics.cancelledOrders !== undefined && (
              <p className="text-gray-700"><strong>Cancelled Orders:</strong> {analytics.cancelledOrders}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
