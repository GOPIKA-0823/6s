import { useState, useEffect, useRef } from 'react';
import { getMarketplaceProducts } from '../services/api';

/**
 * Product Chatbot Component
 * 
 * Features:
 * - Fixed position bottom-right corner
 * - Rule-based product search
 * - Real-time product data fetching
 * - Responsive chat interface
 * - Supports queries like:
 *   * Product names: "Show dosa batter", "I need idli"
 *   * Manufacturer: "Who sells coffee?"
 *   * Categories: "Show snacks", "Available beverages"
 */

const ProductChatbot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 I\'m your Agaram Agencies shopping assistant. I can help you find products! Try asking:\n\n• "Show dosa batter"\n• "Who sells coffee?"\n• "Available snacks"\n• "List all beverages"'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getMarketplaceProducts();
        setProducts(response.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Rule-based query matcher
  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase().trim();

    // Query 1: Product name search
    const productMatches = products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category?.toLowerCase().includes(lowerQuery)
    );

    // Query 2: Manufacturer search
    const manufacturerMatch = lowerQuery.includes('who sells') || lowerQuery.includes('sells');
    let manufacturerResults = [];
    if (manufacturerMatch) {
      const searchTerm = lowerQuery
        .replace('who sells', '')
        .replace('sells', '')
        .trim();

      manufacturerResults = products.filter(p =>
        p.manufacturer?.name?.toLowerCase().includes(searchTerm) ||
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    // Query 3: Category search
    const categoryMatch = lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('available');
    let categoryResults = [];
    if (categoryMatch) {
      const searchTerm = lowerQuery
        .replace('show', '')
        .replace('list', '')
        .replace('available', '')
        .trim();

      categoryResults = products.filter(p =>
        p.category?.toLowerCase().includes(searchTerm) ||
        p.name.toLowerCase().includes(searchTerm)
      );
    }

    // Combine results
    const results = [
      ...new Set([
        ...productMatches,
        ...manufacturerResults,
        ...categoryResults
      ])
    ];

    return results.slice(0, 5); // Limit to 5 results
  };

  const generateBotResponse = (query, results) => {
    if (results.length === 0) {
      return {
        type: 'bot',
        text: `Sorry, I couldn't find products matching "${query}". 😟\n\nTry:\n• Searching by product name (e.g., "idli", "coffee")\n• Asking "Who sells [product]?"\n• Browsing categories like "snacks" or "beverages"`
      };
    }

    const productList = results
      .map((p, i) => `${i + 1}. **${p.name}** by ${p.manufacturer?.name || 'Unknown'}\n   ₹${p.price} | ${p.category}`)
      .join('\n');

    return {
      type: 'bot',
      text: `Found ${results.length} product(s) matching "${query}":\n\n${productList}\n\n✨ Tap on any product in marketplace to order!`
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Process query
    const results = processQuery(inputValue);
    const botResponse = generateBotResponse(inputValue, results);

    setMessages(prev => [...prev, { id: prev.length + 1, ...botResponse }]);
    setLoading(false);
  };

  return (
    <>
      {/* Chatbot Widget */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-75 opacity-0 pointer-events-none'
        }`}
      >
        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-96 flex flex-col border-2 border-primary-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-bold">Agaram Assistant</h3>
                <p className="text-xs text-primary-100">Always here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-700 p-1 rounded-full transition-all"
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-primary-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-300 p-4 bg-white rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about products..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 font-semibold text-xl flex items-center justify-center ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
        }`}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Quick Actions (visible when closed) */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-30 space-y-2 animate-pulse">
          <div className="bg-primary-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg max-w-xs">
            Need help finding products? 🛍️
          </div>
        </div>
      )}
    </>
  );
};

export default ProductChatbot;
