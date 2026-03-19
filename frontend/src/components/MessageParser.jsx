class MessageParser {
  constructor(actionProvider, state) {
    this.actionProvider = actionProvider;
    this.state = state;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('recommend') || lowerCaseMessage.includes('suggest')) {
      this.actionProvider.handleRecommendation();
    } else if (lowerCaseMessage.includes('product') || lowerCaseMessage.includes('inventory')) {
      this.actionProvider.handleProductQuery();
    } else if (lowerCaseMessage.includes('order') || lowerCaseMessage.includes('sales')) {
      this.actionProvider.handleOrderQuery();
    } else {
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;