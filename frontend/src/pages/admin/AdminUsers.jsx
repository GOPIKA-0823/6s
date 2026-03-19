import { useState, useEffect } from 'react';
import { getAllUsers, toggleUserVerification, toggleUserStatus } from '../../services/api';

/**
 * Admin Users Management Page
 * 
 * Features:
 * - Display all manufacturers and retailers
 * - Filter by user type
 * - View user details
 * - Enable/disable users
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, manufacturer, retailer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const realUsers = response.data;
      setUsers(realUsers);
      setFilteredUsers(realUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
    if (filterType === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.userType === filterType));
    }
  };

  const handleStatusToggle = async (userId) => {
    try {
      const response = await toggleUserStatus(userId);
      const updatedUser = response.data.user;
      
      setUsers(users.map(user => 
        user._id === userId ? updatedUser : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user._id === userId ? updatedUser : user
      ));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleVerificationToggle = async (userId) => {
    try {
      const response = await toggleUserVerification(userId);
      const updatedUser = response.data.user;
      
      setUsers(users.map(user => 
        user._id === userId ? updatedUser : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user._id === userId ? updatedUser : user
      ));
    } catch (err) {
      console.error('Error toggling verification:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">👥 User Management</h1>
        <p className="text-primary-100">Manage all manufacturers and retailers on the platform</p>
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
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 All Users ({users.length})
        </button>
        <button
          onClick={() => handleFilter('manufacturer')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'manufacturer'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🏭 Manufacturers ({users.filter(u => u.userType === 'manufacturer').length})
        </button>
        <button
          onClick={() => handleFilter('retailer')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'retailer'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🏪 Retailers ({users.filter(u => u.userType === 'retailer').length})
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Company Name</th>
                <th className="px-6 py-4 text-left font-bold">Contact Person</th>
                <th className="px-6 py-4 text-left font-bold">Email</th>
                <th className="px-6 py-4 text-left font-bold">Type</th>
                <th className="px-6 py-4 text-left font-bold">Status</th>
                <th className="px-6 py-4 text-left font-bold">Joined</th>
                <th className="px-6 py-4 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="font-semibold text-gray-900">{user.companyName}</div>
                      {user.isVerified && (
                        <span className="text-blue-500" title="Verified Account">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.contactPerson}</td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.userType === 'manufacturer'
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-secondary-100 text-secondary-800'
                    }`}>
                      {user.userType === 'manufacturer' ? '🏭 Manufacturer' : '🏪 Retailer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerificationToggle(user._id)}
                        className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                          user.isVerified
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                        }`}
                      >
                        {user.isVerified ? '⚡ Unverify' : '🛡️ Verify Official'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-4xl font-bold text-primary-600">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Active Users</p>
          <p className="text-4xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Inactive Users</p>
          <p className="text-4xl font-bold text-red-600">{users.filter(u => !u.isActive).length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
