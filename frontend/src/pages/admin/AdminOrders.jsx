import { useState, useEffect } from 'react';

/**
 * Admin Orders Management Page
 * 
 * Features:
 * - View all orders across the platform
 * - Filter by status
 * - Search functionality
 * - Order details
 */
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Mock data
      const mockOrders = [
        {
          _id: 'ORD001',
          manufacturerId: { companyName: 'Coffee Works' },
          retailerId: { companyName: 'Best Retail Store' },
          status: 'delivered',
          totalAmount: 5000,
          items: [{ name: 'Filter Coffee', quantity: 20 }],
          createdAt: '2024-02-01'
        },
        {
          _id: 'ORD002',
          manufacturerId: { companyName: 'Spice House' },
          retailerId: { companyName: 'Quick Shop' },
          status: 'shipped',
          totalAmount: 3500,
          items: [{ name: 'Sambar Powder', quantity: 15 }],
          createdAt: '2024-02-05'
        },
        {
          _id: 'ORD003',
          manufacturerId: { companyName: 'Taste of Tamil Nadu' },
          retailerId: { companyName: 'Store Corner' },
          status: 'processing',
          totalAmount: 8000,
          items: [{ name: 'Coconut Oil', quantity: 10 }],
          createdAt: '2024-02-08'
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
    if (filterType === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filterType));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🛒 Orders Management</h1>
        <p className="text-primary-100">View all orders across the platform</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex space-x-3 flex-wrap">
        <button
          onClick={() => handleFilter('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => handleFilter('processing')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'processing'
              ? 'bg-secondary-500 text-gray-900'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Processing ({orders.filter(o => o.status === 'processing').length})
        </button>
        <button
          onClick={() => handleFilter('shipped')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'shipped'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button
          onClick={() => handleFilter('delivered')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'delivered'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Delivered ({orders.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Order ID</th>
                <th className="px-6 py-4 text-left font-bold">Manufacturer</th>
                <th className="px-6 py-4 text-left font-bold">Retailer</th>
                <th className="px-6 py-4 text-left font-bold">Amount</th>
                <th className="px-6 py-4 text-left font-bold">Status</th>
                <th className="px-6 py-4 text-left font-bold">Date</th>
                <th className="px-6 py-4 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-primary-600">{order._id}</td>
                  <td className="px-6 py-4 text-gray-900">{order.manufacturerId.companyName}</td>
                  <td className="px-6 py-4 text-gray-900">{order.retailerId.companyName}</td>
                  <td className="px-6 py-4 font-bold">₹{order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
