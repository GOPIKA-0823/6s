import { useState, useEffect } from 'react';
import { getContactMessages, markMessageAsRead, deleteContactMessage } from '../../services/api';

/**
 * Admin Contact Messages Management Page
 */
const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getContactMessages();
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markMessageAsRead(id);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteContactMessage(id);
      setMessages(messages.filter(msg => msg._id !== id));
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 text-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📩 Contact Messages</h1>
        <p className="text-primary-100">Review and manage submissions from the contact form</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      ) : (
        <div className="grid gap-6">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div 
                key={message._id} 
                className={`bg-white rounded-xl shadow-md border-l-4 transition-all ${
                  message.status === 'unread' ? 'border-primary-500' : 'border-gray-300 opacity-75'
                } p-6`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{message.subject}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                      <span>👤 {message.name}</span>
                      <span>📧 {message.email}</span>
                      <span>📅 {new Date(message.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(message._id)}
                        className="bg-primary-100 text-primary-700 hover:bg-primary-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(message._id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                  {message.message}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <span className="text-5xl mb-4 block">📭</span>
              <p className="text-gray-600 text-lg">No messages found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
