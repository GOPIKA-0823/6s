import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRetailerRequests, createOrder } from '../../services/api';

/**
 * Retailer My Requests Page
 * 
 * Features:
 * - Display all product requests created by retailer
 * - Track request status (pending, accepted, rejected)
 * - Error handling and loading states
 * - South Indian theme styling
 */
const RetailerMyRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRetailerRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load your requests. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentNavigation = (request) => {
    // Navigate to address page first
    navigate('/retailer/address', { state: { request } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📋 My Requests</h1>
        <p className="text-primary-100">Track all your product requests to manufacturers</p>
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

      {/* Requests Cards */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 text-primary-500"></div>
            </div>
            <p className="text-gray-600 mt-2">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">No requests yet</p>
            <p className="text-gray-500 text-sm mt-2">Create a new request to get products from manufacturers</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-primary-500">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Request #{request._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-gray-600 text-sm mt-1">📦 Product: <strong>{request.productName}</strong></p>
                    <div className="flex items-center space-x-1 mt-1">
                      <p className="text-gray-500 text-xs">🏭 Manufacturer: {request.manufacturerName || request.manufacturerId?.companyName || 'Unknown'}</p>
                      {request.manufacturerId?.isVerified && (
                        <span className="text-blue-500" title="Verified Manufacturer">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs">📅 Date: {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                      request.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(request.status || 'pending').toUpperCase()}
                    </span>
                    {request.status === 'accepted' && (
                      <button
                        onClick={() => handlePaymentNavigation(request)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                      >
                        🛒 Place Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 font-medium">Quantity Requested</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{request.quantity} units</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 font-medium">Unit Price</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">₹{request.unitPrice || 'N/A'}</p>
                    </div>
                    <div className="bg-primary-50 p-3 rounded">
                      <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                      <p className="text-lg font-semibold text-primary-600 mt-1">₹{request.totalAmount || 'N/A'}</p>
                    </div>
                  </div>
                  {request.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-300">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {request.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RetailerMyRequests;