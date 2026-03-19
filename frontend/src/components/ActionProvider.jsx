import { getManufacturerProducts, getMarketplaceProducts, getManufacturerOrders, getRetailerOrders } from '../services/dummyData';

const ActionProvider = (userType) => ({
  handleRecommendation: (createChatBotMessage, setState) => {
    let message;
    if (userType === 'manufacturer') {
      const products = getManufacturerProducts();
      const lowStock = products.filter(p => p.stock < 50);
      if (lowStock.length > 0) {
        message = `As a manufacturer, I recommend restocking these products: ${lowStock.map(p => p.name).join(', ')}.`;
      } else {
        message = 'Your inventory looks good! Consider promoting your top products.';
      }
    } else {
      const products = getMarketplaceProducts();
      const recommended = products.slice(0, 3);
      message = `As a retailer, I recommend these products: ${recommended.map(p => p.name).join(', ')}.`;
    }
    const botMessage = createChatBotMessage(message);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  },

  handleProductQuery: (createChatBotMessage, setState) => {
    let message;
    if (userType === 'manufacturer') {
      const products = getManufacturerProducts();
      message = `You have ${products.length} products. Top categories: ${[...new Set(products.map(p => p.category))].join(', ')}.`;
    } else {
      const products = getMarketplaceProducts();
      message = `There are ${products.length} products available in the marketplace.`;
    }
    const botMessage = createChatBotMessage(message);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  },

  handleOrderQuery: (createChatBotMessage, setState) => {
    let message;
    if (userType === 'manufacturer') {
      const orders = getManufacturerOrders();
      const active = orders.filter(o => o.status === 'processing').length;
      message = `You have ${active} active orders. Total revenue from recent orders: ₹${orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}.`;
    } else {
      const orders = getRetailerOrders();
      const pending = orders.filter(o => o.status === 'processing').length;
      message = `You have ${pending} pending orders.`;
    }
    const botMessage = createChatBotMessage(message);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  },

  handleDefault: (createChatBotMessage, setState) => {
    const message = "I'm here to help with recommendations, products, and orders. What would you like to know?";
    const botMessage = createChatBotMessage(message);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  },
});

export default ActionProvider;