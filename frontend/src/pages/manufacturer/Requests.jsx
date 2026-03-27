import { useState, useEffect } from 'react';
import { getProductRequests, updateRequest } from '../../services/api';

/**
 * Manufacturer Requests Page
 * 
 * Features:
 * - Display product requests from retailers
 * - Accept/Reject requests
 * - Real-time error handling and loading states
 * - South Indian theme styling
 */
const ManufacturerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductRequests();
      // Safety guard: never show requests from manufacturers (filter by userType)
      const validRequests = (response.data || []).filter(r => r.retailerId?.userType !== 'manufacturer');
      setRequests(validRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load product requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setUpdatingId(requestId);
      await updateRequest(requestId, { status: 'accepted' });
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'accepted' } : req
      ));
    } catch (error) {
      console.error('Error accepting request:', error);
      setError(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setUpdatingId(requestId);
      await updateRequest(requestId, { status: 'rejected' });
      setRequests(requests.map(req => 
        req._id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📋 Product Requests</h1>
        <p className="text-primary-100">Review and manage product requests from retail shops</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
          <button
            onClick={fetchRequests}
            className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b-2 border-primary-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Request ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Retail Shop</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block">
                      <div className="animate-spin h-8 w-8 text-primary-500"></div>
                    </div>
                    <p className="text-gray-600 mt-2">Loading product requests...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-gray-600 font-medium">No product requests yet</p>
                    <p className="text-gray-500 text-sm mt-1">Requests from retailers will appear here</p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">#{request._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <p className="font-medium text-gray-900">{request.retailerName || request.retailShopName || request.retailerId?.companyName || 'Unknown'}</p>
                        {request.retailerId?.isVerified && (
                          <span className="text-blue-500" title="Verified Retailer">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{request.quantity} units</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(request.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAccept(request._id)}
                            disabled={updatingId === request._id}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {updatingId === request._id ? '⏳' : '✅ Accept'}
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={updatingId === request._id}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {updatingId === request._id ? '⏳' : '❌ Reject'}
                          </button>
                        </div>
                      )}
                      {request.status === 'accepted' && (
                        <span className="text-green-600 font-medium">✅ Accepted</span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-red-600 font-medium">❌ Rejected</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerRequests;