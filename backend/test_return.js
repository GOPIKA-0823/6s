const axios = require('axios');
const mongoose = require('mongoose');

async function testReturn() {
  try {
    await mongoose.connect('mongodb://localhost:27017/b2b-ecommerce');
    const Order = mongoose.connection.collection('orders');
    const User = mongoose.connection.collection('users');

    const orders = await Order.find({}).toArray();
    if (orders.length === 0) {
        console.log("No orders exist.");
        process.exit(0);
    }
    
    // Pick the most recent order
    const order = orders[orders.length - 1];
    console.log("Found Order:", order._id);
    console.log("Order Current Status:", order.status);
    
    // forcefully mark it as delivered manually to bypass standard flow for this test
    if (order.status !== 'delivered') {
      await Order.updateOne({ _id: order._id }, { $set: { status: 'delivered' }});
      console.log("Order artificially marked delivered.");
    }

    const payload = {
      newStatus: 'returned',
      notes: 'Test reason from script'
    };

    // Need retailer ID to authorize
    const orderRetailerId = order.retailerId;
    
    console.log("Sending PUT request with retailer:", orderRetailerId);

    const res = await axios.put(`http://localhost:5000/api/orders/${order._id}/status`, payload, {
      headers: {
        'X-User-Id': orderRetailerId.toString()
      }
    });

    console.log("SUCCESS RESPONSE:", res.data);
  } catch (err) {
    if (err.response) {
       console.log("FAIL RESPONSE:", err.response.data);
    } else {
       console.log("ERROR:", err.message);
    }
  }
  process.exit(0);
}

testReturn();
