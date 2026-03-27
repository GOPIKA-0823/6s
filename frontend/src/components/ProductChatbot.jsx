import { useState, useEffect, useRef } from 'react';
import { getMarketplaceProducts, getRetailerRequests, getProductRequests, getRetailerOrders, getManufacturerOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

/**
 * Product Chatbot Component (Updated v2.1)
 */

const ProductChatbot = () => {
  const { user } = useAuth() || {};
  const location = useLocation();
  
  const isRetailer = user?.userType === 'retailer' || user?.role === 'retailer';
  const isManufacturer = user?.userType === 'manufacturer' || user?.role === 'manufacturer';

  const botName = isRetailer ? 'Agaram Retail Assistant' : (isManufacturer ? 'Agaram Seller Assistant' : 'Agaram Assistant');
  const botTagline = isRetailer ? 'Helping you buy smarter 🛒' : (isManufacturer ? 'Helping you manage products and requests 🏭' : 'Always here to help!');

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const messagesEndRef = useRef(null);

  // Auto-close or hide chatbot on Login/Register pages
  useEffect(() => {
    if (location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname === '/admin-login') {
      setIsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const initialText = isRetailer 
      ? 'Hello! 👋 I\'m your Agaram Retail Assistant. I can help you buy smarter! Try asking:\n\n• "Show coffee powder"\n• "Who sells dosa batter?"\n• "My pending requests"\n• "What should I reorder?"'
      : (isManufacturer 
        ? 'Hello! 👋 I\'m your Agaram Seller Assistant. I can help you manage products and requests! Try asking:\n\n• "Show my products"\n• "Which products are low in stock?"\n• "Show pending retailer requests"\n• "Track current orders"'
        : 'Hello! 👋 I\'m your Agaram Agencies shopping assistant. I can help you find products! Try asking:\n\n• "Show dosa batter"\n• "Who sells coffee?"\n• "Available snacks"\n• "List all beverages"'
      );
    setMessages([{ id: Date.now(), type: 'bot', text: initialText }]);
  }, [isRetailer, isManufacturer]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all products, requests, and orders on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await getMarketplaceProducts();
        setProducts(prodRes.data || []);
        
        if (user) {
          if (isRetailer) {
            const reqRes = await getRetailerRequests();
            const ordRes = await getRetailerOrders();
            setRequests(reqRes.data || []);
            setOrders(ordRes.data || []);
          } else if (isManufacturer) {
            const reqRes = await getProductRequests();
            const ordRes = await getManufacturerOrders();
            setRequests(reqRes.data || []);
            setOrders(ordRes.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching chatbot data:', err);
      }
    };
    fetchData();
  }, [user, isRetailer, isManufacturer]);

  const matchFuzzy = (text, query) => {
    if (!text || !query) return false;
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (t.includes(q)) return true;
    if (q.endsWith('s') && t.includes(q.slice(0, -1))) return true;
    if (t.endsWith('s') && q.includes(t.slice(0, -1))) return true;
    
    // Stricter word intersection
    const stopWords = ['for', 'the', 'and', 'with', 'show', 'me', 'list', 'all', 'available', 'i', 'want', 'need', 'buy'];
    const qWords = q.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
    
    // Only return true if EVERY significant word is found in the text (either as-is or singular)
    if (qWords.length > 0 && qWords.every(w => t.includes(w) || (w.endsWith('s') && t.includes(w.slice(0, -1))))) {
      return true;
    }
    return false;
  };

  // Rule-based query matcher
  const processQuery = (query) => {
    const rawLower = query.toLowerCase().trim();
    const lowerQuery = rawLower.replace(/[?.,!]/g, '');

    // =============== GENERAL GREETINGS & SMALL TALK ===============
    if (lowerQuery === 'hi' || lowerQuery === 'hello' || lowerQuery === 'hey' || lowerQuery.includes('hii') || lowerQuery.includes('how are you')) {
      if (isManufacturer) {
        return { type: 'canned', text: "Hello there! 👋 I'm your Agaram Seller Assistant. I'm here to help you manage your stock, track orders, and view sales insights. Try asking 'which products are low in stock?'" };
      } else {
        return { type: 'canned', text: "Hello there! 👋 I'm your Agaram Retail Assistant. I'm here to help you restock effortlessly! Try asking me for 'popular items' or to 'suggest products'." };
      }
    }

    // =============== MANUFACTURER SPECIFIC QUERIES ===============
    if (isManufacturer) {
      if ((lowerQuery.includes('low') || lowerQuery.includes('out')) && lowerQuery.includes('stock')) {
        return { type: 'stock', data: products.filter(p => (p.manufacturerId?._id === user?._id || p.manufacturerId === user?._id) && p.stock < 20).slice(0, 5) };
      }
      if (lowerQuery.includes('my product') || lowerQuery.includes('show my')) {
        const myProds = products.filter(p => p.manufacturerId?._id === user?._id || p.manufacturerId === user?._id);
        return { type: 'my_products', data: myProds.slice(0, 5) };
      }
      if (lowerQuery.includes('add') && lowerQuery.includes('product')) {
        return { type: 'canned', text: "To **Add a new product**, simply navigate to the 'Products' tab and click the 'Add New' button. 🏭" };
      }
      if (lowerQuery.includes('update') && lowerQuery.includes('stock')) {
        return { type: 'canned', text: "To update stock, click on the pencil icon next to the product in your 'My Products' view and enter the new inventory count." };
      }
      if (lowerQuery.includes('where') || lowerQuery.includes('how') || lowerQuery.includes('see') || lowerQuery.includes('view') || lowerQuery.includes('find') || lowerQuery.includes('locate') || lowerQuery.includes('show')) {
        if (lowerQuery.includes('order')) {
          return { type: 'canned', text: "To view and manage your orders, click on the **Orders** tab in the sidebar on the left. You'll see all your active and past orders there! 🚚" };
        }
        if (lowerQuery.includes('request')) {
          return { type: 'canned', text: "Retailer requests can be found in the **Product Requests** tab in the left sidebar. This is where you can approve or decline new requests! 📋" };
        }
        if (lowerQuery.includes('product') || lowerQuery.includes('item') || lowerQuery.includes('stock')) {
          return { type: 'canned', text: "Your product catalog is located in the **My Products** tab in the sidebar. You can edit stock or add new items there! 🏭" };
        }
      }
      if (lowerQuery.includes('pending') && lowerQuery.includes('request')) {
        const pending = requests.filter(r => r.status === 'pending');
        if (pending.length > 0) {
          return { type: 'canned', text: `You have **${pending.length} pending retailer requests** waiting for your approval right now. 📦\nPlease check your 'Requests' dashboard.` };
        }
        return { type: 'canned', text: "You have no pending requests to approve! 🎉" };
      }
      if (lowerQuery.includes('sell') && (lowerQuery.includes('high') || lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('popular') || lowerQuery.includes('fast'))) {
          const myProducts = products.filter(p => p.manufacturerId?._id === user?._id || p.manufacturerId === user?._id);
          if (myProducts.length > 0) {
            const sorted = [...myProducts].sort((a, b) => a.stock - b.stock);
            return { type: 'canned', text: `🚀 Your fast/high-selling product is **${sorted[0].name}**. It's currently in high demand!` };
          }
          return { type: 'canned', text: "🚀 You haven't listed any products yet, so we don't have any sales data to analyze." };
      }
      if (lowerQuery.includes('accept') && lowerQuery.includes('request')) {
        const accepted = requests.filter(r => r.status === 'accepted');
        return { type: 'canned', text: `You have accepted **${accepted.length}** requests overall. Great work! 👍` };
      }
      if (lowerQuery.includes('need') && lowerQuery.includes('approv')) {
        const pending = requests.filter(r => r.status === 'pending');
        if (pending.length > 0) {
          return { type: 'canned', text: `The request for **${pending[0].productId?.name || 'an item'} (${pending[0].quantity || 0} units)** needs your immediate approval.` };
        }
        return { type: 'canned', text: "No requests need your approval right now." };
      }
      if (lowerQuery.includes('track') && lowerQuery.includes('order')) {
        const processing = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
        return { type: 'canned', text: `You have **${processing.length} active orders** processing right now. 🚚` };
      }
      if (lowerQuery.includes('order') && (lowerQuery.includes('placed') || lowerQuery.includes('total'))) {
        return { type: 'canned', text: `You have **${orders.length} orders** in total. Keep selling! 📈` };
      }
      if (lowerQuery.includes('cancel') || (lowerQuery.includes('cancelled') && lowerQuery.includes('order'))) {
        const cancelled = orders.filter(o => o.status === 'cancelled');
        if (cancelled.length === 0) {
          return { type: 'canned', text: "🎉 No orders have been cancelled by any retailer. Keep it up!" };
        }
        // Group by retailer name using correct populated field
        const byRetailer = {};
        cancelled.forEach(o => {
          const name = o.retailerId?.companyName || o.retailerName || 'Unknown Retailer';
          if (!byRetailer[name]) byRetailer[name] = [];
          byRetailer[name].push(o);
        });
        const lines = Object.entries(byRetailer)
          .map(([retailer, ords]) => `🏪 **${retailer}** — ${ords.length} cancelled order(s)`)
          .join('\n');
        return { type: 'canned', text: `❌ **Cancelled Orders by Retailer:**\n\n${lines}\n\nTotal Cancelled: ${cancelled.length}` };
      }
      if (lowerQuery.includes('sales') || lowerQuery.includes('insight') || lowerQuery.includes('summary')) {
        const completedOrders = orders.filter(o => o.status === 'delivered');
        if (completedOrders.length === 0) return { type: 'canned', text: "📊 **Sales Summary:**\nYou don't have any completed (delivered) orders yet." };
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return { type: 'canned', text: `📊 **Sales Summary:**\nTotal Revenue: ₹${totalRevenue.toLocaleString('en-IN')}\nTotal Delivered: ${completedOrders.length} order(s)` };
      }
      if ((lowerQuery.includes('most') || lowerQuery.includes('top')) && (lowerQuery.includes('request') || lowerQuery.includes('product'))) {
        const myProducts = products.filter(p => p.manufacturerId?._id === user?._id || p.manufacturerId === user?._id);
        if (myProducts.length > 0) {
          const sorted = [...myProducts].sort((a, b) => a.stock - b.stock);
          return { type: 'canned', text: `🏆 Your most requested product is **${sorted[0].name}**.\n📦 It currently has only ${sorted[0].stock} units left — consider restocking!` };
        }
        return { type: 'canned', text: "🏆 You haven't listed any products yet, so we don't have a most requested product." };
      }
      if (lowerQuery.includes('top retailer') || (lowerQuery.includes('top') && lowerQuery.includes('retailer'))) {
        const retailerCounts = {};
        orders.forEach(o => {
          // Use populated retailerId.companyName, fallback to retailerName string
          const name = o.retailerId?.companyName || o.retailerName || 'Unknown';
          retailerCounts[name] = (retailerCounts[name] || 0) + 1;
        });
        const sorted = Object.entries(retailerCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) {
          return { type: 'canned', text: "🥇 You don't have enough orders to determine a top retailer yet." };
        }
        const top = sorted.slice(0, 3).map(([name, count], i) => `${i + 1}. **${name}** — ${count} order(s)`).join('\n');
        return { type: 'canned', text: `🥇 **Top Retailers by Orders:**\n\n${top}` };
      }
      if (lowerQuery.includes('verified') && (lowerQuery.includes('retailer') || lowerQuery.includes('retiler') || lowerQuery.includes('buyer') || lowerQuery.includes('customer'))) {
        const verifiedSet = new Set();
        orders.forEach(o => {
          // Backend populates retailerId with { companyName, email, phone, isVerified }
          if (o.retailerId?.isVerified === true) {
            const name = o.retailerId?.companyName || o.retailerName || 'Unknown';
            verifiedSet.add(name);
          }
        });
        if (verifiedSet.size === 0) {
          return { type: 'canned', text: "✅ No verified retailers found in your orders yet. Verified status is set by the admin." };
        }
        const list = [...verifiedSet].map((n, i) => `${i + 1}. ✔️ **${n}**`).join('\n');
        return { type: 'canned', text: `✅ **Verified Retailers who ordered from you:**\n\n${list}` };
      }
    }

    // =============== RETAILER SPECIFIC QUERIES ===============
    if (isRetailer) {
      if (lowerQuery.includes('pending') && lowerQuery.includes('request')) {
        const pending = requests.filter(r => r.status === 'pending');
        if (pending.length > 0) {
          const names = pending.map(r => `'${r.productId?.name || 'Unknown'}'`).join(', ');
          return { type: 'canned', text: `You have **${pending.length} pending request(s)**: ${names}. The manufacturer is reviewing them. ⏳` };
        }
        return { type: 'canned', text: "You don't have any pending requests right now. 👍" };
      }
      if ((lowerQuery.includes('suggest') || lowerQuery.includes('recommend')) && !lowerQuery.includes('why')) {
        const shuffled = [...products].sort(() => 0.5 - Math.random()).slice(0, 3);
        if (shuffled.length === 0) return { type: 'canned', text: "💡 **Suggestions for your shop:**\nNo products available." };
        const suggList = shuffled.map((p, i) => `${i + 1}. **${p.name}** (₹${p.price})`).join('\n');
        return { type: 'canned', text: `💡 **Suggestions for your shop:**\n${suggList}` };
      }
      if ((lowerQuery.includes('popular') || lowerQuery.includes('trending')) && !lowerQuery.includes('why')) {
        const pop = [...products].sort((a, b) => a.stock - b.stock).slice(0, 4);
        if (pop.length === 0) return { type: 'canned', text: "🔥 No popular items right now." };
        const popList = pop.map(p => `- **${p.name}**`).join('\n');
        return { type: 'canned', text: `🔥 **Popular this week:**\n${popList}` };
      }
      if (lowerQuery.includes('why') && (lowerQuery.includes('popular') || lowerQuery.includes('suggest'))) {
         return { type: 'canned', text: "🤔 We analyze market demand and regional inventory to find top-moving products for you!" };
      }
    }

    // =============== GENERAL PRODUCT QUERIES ===============
    const results = products.filter(p =>
      matchFuzzy(p.name, lowerQuery) ||
      matchFuzzy(p.category, lowerQuery) ||
      matchFuzzy(p.manufacturerId?.companyName, lowerQuery)
    );

    if (results.length > 0) {
      return { type: 'products', data: results.slice(0, 5) };
    }

    return { type: 'unmatched', data: [], query: rawLower };
  };

  const generateBotResponse = (query, resultObj) => {
    if (resultObj.type === 'canned') return { type: 'bot', text: resultObj.text };

    if (resultObj.type === 'stock') {
      if (resultObj.data.length === 0) return { type: 'bot', text: "All products are well-stocked! ✅" };
      const list = resultObj.data.map((p, i) => `${i + 1}. **${p.name}** (${p.stock} units left)`).join('\n');
      return { type: 'bot', text: `Low stock alerts:\n\n${list}` };
    }

    if (resultObj.type === 'my_products') {
      if (resultObj.data.length === 0) return { type: 'bot', text: "No products found in your catalog." };
      const list = resultObj.data.map((p, i) => `${i + 1}. **${p.name}** (₹${p.price}, ${p.stock} stock)`).join('\n');
      return { type: 'bot', text: `Your products:\n\n${list}` };
    }

    const results = resultObj.data;
    if (!results || results.length === 0) {
      const suggest = isRetailer ? 'searching products (e.g. coffee)' : 'viewing stock or sales summary';
      return { type: 'bot', text: `Sorry, I couldn't understand "${query}". Try ${suggest}.` };
    }

    const productList = results.map((p, i) => {
      const mfg = p.manufacturerId?.companyName || 'Unknown';
      return `${i + 1}. **${p.name}**\n   🏢 ${mfg}\n   💰 ₹${p.price}\n   📦 ${p.stock} left`;
    }).join('\n\n');

    return { type: 'bot', text: `Matching products:\n\n${productList}` };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));
    const resultObj = processQuery(userMessage.text);
    const botRes = generateBotResponse(userMessage.text, resultObj);
    setMessages(prev => [...prev, { id: Date.now() + 1, ...botRes }]);
    setLoading(false);
  };

  if (user?.role === 'admin') return null;
  if (location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname === '/admin-login') return null;

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
        <div className={`bg-white rounded-2xl shadow-2xl w-96 ${isExpanded ? 'h-[90vh]' : 'h-96'} flex flex-col border-2 border-primary-500`}>
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isManufacturer ? '🏭' : '🛒'}</span>
              <div>
                <h3 className="font-bold">{botName}</h3>
                <p className="text-xs text-white/90">{botTagline}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-black/20 p-1 rounded-full w-8 h-8 flex items-center justify-center">↕</button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-black/20 p-1 rounded-full w-8 h-8 flex items-center justify-center">×</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-primary-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${msg.type === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-300 p-4 bg-white rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isManufacturer ? "Ask about stock, requests, products..." : "Ask about products..."}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !inputValue.trim()} className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-semibold disabled:bg-gray-400 text-sm">Send</button>
            </form>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'}`}
      >
        {isOpen ? '✕' : (isManufacturer ? '🏭' : '🛒')}
      </button>

      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-30 animate-pulse">
          <div className="bg-primary-500 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
            {isManufacturer ? 'Manage products easily! 🏭' : 'Need help shopping? 🛒'}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductChatbot;
