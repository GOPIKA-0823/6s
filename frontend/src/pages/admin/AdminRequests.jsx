import { useState, useEffect } from 'react';

/**
 * Admin Product Requests Management Page
 * 
 * Features:
 * - View all product requests
 * - Approve or reject requests
 * - Track request status
 */
const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Mock data
      const mockRequests = [
        {
          _id: 'REQ001',
          manufacturerId: { companyName: 'Coffee Works' },
          retailerId: { companyName: 'Best Retail Store' },
          productName: 'Filter Coffee',
          quantity: 100,
          status: 'pending',
          createdAt: '2024-02-06'
        },
        {
          _id: 'REQ002',
          manufacturerId: { companyName: 'Spice House' },
          retailerId: { companyName: 'Quick Shop' },
          productName: 'Chaat Masala',
          quantity: 50,
          status: 'approved',
          createdAt: '2024-02-04'
        },
        {
          _id: 'REQ003',
          manufacturerId: { companyName: 'Taste of Tamil Nadu' },
          retailerId: { companyName: 'Store Corner' },
          productName: 'Idiyappam Mix',
          quantity: 75,
          status: 'rejected',
          createdAt: '2024-02-02'
        }
      ];
      setRequests(mockRequests);
      setFilteredRequests(mockRequests.filter(r => r.status === 'pending'));
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
    setFilteredRequests(requests.filter(req => req.status === filterType));
  };

  const handleApprove = (requestId) => {
    setRequests(requests.map(req =>
      req._id === requestId ? { ...req, status: 'approved' } : req
    ));
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(req =>
      req._id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📋 Requests Management</h1>
        <p className="text-primary-100">Review and manage product requests from retailers</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-3 flex-wrap">
        <button
          onClick={() => handleFilter('pending')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'pending'
              ? 'bg-secondary-500 text-gray-900'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ⏳ Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => handleFilter('approved')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ✅ Approved ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => handleFilter('rejected')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          ❌ Rejected ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Requests Cards */}
      <div className="grid gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-primary-500 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{request.productName}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      📌 <strong>Request ID:</strong> {request._id}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-secondary-100 text-secondary-800'
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-primary-50 p-4 rounded">
                    <p className="text-xs text-gray-600 font-medium">Manufacturer</p>
                    <p className="font-bold text-gray-900">{request.manufacturerId.companyName}</p>
                  </div>
                  <div className="bg-secondary-50 p-4 rounded">
                    <p className="text-xs text-gray-600 font-medium">Retailer</p>
                    <p className="font-bold text-gray-900">{request.retailerId.companyName}</p>
                  </div>
                  <div className="bg-accent-50 p-4 rounded">
                    <p className="text-xs text-gray-600 font-medium">Quantity Requested</p>
                    <p className="font-bold text-gray-900">{request.quantity} units</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-xs text-gray-600 font-medium">Date</p>
                    <p className="font-bold text-gray-900">{new Date(request.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold transition-colors"
                    >
                      ✅ Approve Request
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold transition-colors"
                    >
                      ❌ Reject Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg font-medium">No {filter} requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
