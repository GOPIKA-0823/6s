const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Request = require('./models/Request');
const Order = require('./models/Order');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agaram-agency', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data (in order of dependencies)
    await Request.deleteMany();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing data...');

    /**
     * STEP 1: Create test users (manufacturers and retailers)
     * These users will own the products and orders
     */
    const users = [
      {
        userType: 'manufacturer',
        email: 'coffee-works@example.com',
        password: 'password123', // In production, use bcrypt to hash
        companyName: 'Chennai Coffee Works',
        contactPerson: 'Rajesh Kumar',
        phone: '9876543210',
        address: '123 Coffee Estate, Chennai, Tamil Nadu',
        website: 'https://chennaicoffee.com',
      },
      {
        userType: 'manufacturer',
        email: 'rice-mills@example.com',
        password: 'password123',
        companyName: 'Thanjavur Rice Mills',
        contactPerson: 'Priya Sharma',
        phone: '9876543211',
        address: '456 Rice Farm, Thanjavur, Tamil Nadu',
        website: 'https://thanjavurrice.com',
      },
      {
        userType: 'manufacturer',
        email: 'oil-company@example.com',
        password: 'password123',
        companyName: 'Kerala-TN Oil Company',
        contactPerson: 'Anil Nair',
        phone: '9876543212',
        address: '789 Oil Mill, Kochi, Kerala',
        website: 'https://keralatn-oils.com',
      },
      {
        userType: 'retailer',
        email: 'best-retail@example.com',
        password: 'password123',
        companyName: 'Best Retail Store',
        contactPerson: 'Vikram Singh',
        phone: '9876543220',
        address: '100 Retail Plaza, Bangalore, Karnataka',
      },
      {
        userType: 'retailer',
        email: 'city-mart@example.com',
        password: 'password123',
        companyName: 'City Mart',
        contactPerson: 'Deepa Gupta',
        phone: '9876543221',
        address: '200 City Center, Hyderabad, Telangana',
      },
      {
        userType: 'retailer',
        email: 'super-shop@example.com',
        password: 'password123',
        companyName: 'Super Shop',
        contactPerson: 'Arjun Patel',
        phone: '9876543222',
        address: '300 Shopping Complex, Mumbai, Maharashtra',
      },
    ];

    const savedUsers = await User.insertMany(users);
    console.log('✓ Created 6 test users (3 manufacturers, 3 retailers)');

    // Get manufacturer and retailer IDs for creating products/orders
    const manufacturer1 = savedUsers[0]._id;
    const manufacturer2 = savedUsers[1]._id;
    const manufacturer3 = savedUsers[2]._id;
    const retailer1 = savedUsers[3]._id;
    const retailer2 = savedUsers[4]._id;
    const retailer3 = savedUsers[5]._id;

    /**
     * STEP 2: Create products
     * Products are created by manufacturers and owned by them (manufacturerId)
     */
    const products = [
      {
        manufacturerId: manufacturer1,
        name: 'Filter Coffee',
        category: 'Beverages',
        description: 'Authentic South Indian filter coffee made with premium beans from Tamil Nadu',
        price: 45,
        stock: 150,
        status: 'active',
        minOrder: 10,
      },
      {
        manufacturerId: manufacturer2,
        name: 'Idli Rice',
        category: 'Food Grains',
        description: 'Premium quality idli rice from Thanjavur region, perfect for soft idlis',
        price: 120,
        stock: 200,
        status: 'active',
        minOrder: 25,
      },
      {
        manufacturerId: manufacturer3,
        name: 'Coconut Oil',
        category: 'Oils',
        description: 'Pure virgin coconut oil extracted from Tamil Nadu coconuts',
        price: 180,
        stock: 85,
        status: 'active',
        minOrder: 12,
      },
      {
        manufacturerId: manufacturer1,
        name: 'Sambar Powder',
        category: 'Spices',
        description: 'Authentic Tamil Nadu sambar masala with traditional spices',
        price: 95,
        stock: 120,
        status: 'active',
        minOrder: 20,
      },
      {
        manufacturerId: manufacturer2,
        name: 'Jaggery',
        category: 'Sweeteners',
        description: 'Natural palm jaggery from Tamil Nadu sugarcane farms',
        price: 150,
        stock: 90,
        status: 'active',
        minOrder: 15,
      },
      {
        manufacturerId: manufacturer3,
        name: 'Banana Chips',
        category: 'Snacks',
        description: 'Crispy Kerala-Tamil Nadu style banana chips made with nendran bananas',
        price: 220,
        stock: 75,
        status: 'active',
        minOrder: 10,
      },
    ];

    const savedProducts = await Product.insertMany(products);
    console.log('✓ Created 6 products from manufacturers');

    /**
     * STEP 3: Create requests
     * Requests are created by retailers (retailerId) requesting manufacturer's products
     * Links to manufacturerId, retailerId, and productId
     */
    const requests = [
      {
        productId: savedProducts[0]._id,
        manufacturerId: manufacturer1,
        retailerId: retailer1,
        productName: 'Filter Coffee',
        manufacturerName: 'Chennai Coffee Works',
        retailerName: 'Best Retail Store',
        quantity: 50,
        unitPrice: 45,
        totalAmount: 2250,
        status: 'pending',
        notes: 'Need delivery by end of month',
      },
      {
        productId: savedProducts[1]._id,
        manufacturerId: manufacturer2,
        retailerId: retailer2,
        productName: 'Idli Rice',
        manufacturerName: 'Thanjavur Rice Mills',
        retailerName: 'City Mart',
        quantity: 30,
        unitPrice: 120,
        totalAmount: 3600,
        status: 'accepted',
        notes: 'Regular supply needed',
      },
      {
        productId: savedProducts[2]._id,
        manufacturerId: manufacturer3,
        retailerId: retailer3,
        productName: 'Coconut Oil',
        manufacturerName: 'Kerala-TN Oil Company',
        retailerName: 'Super Shop',
        quantity: 25,
        unitPrice: 180,
        totalAmount: 4500,
        status: 'accepted',
        notes: 'Bulk order discount requested',
      },
    ];

    const savedRequests = await Request.insertMany(requests);
    console.log('✓ Created 3 sample requests from retailers');

    /**
     * STEP 4: Create orders
     * Orders are created when request is accepted
     * Links to manufacturerId and retailerId
     */
    const orders = [
      {
        manufacturerId: manufacturer1,
        retailerId: retailer1,
        manufacturerName: 'Chennai Coffee Works',
        retailerName: 'Best Retail Store',
        items: [
          {
            productId: savedProducts[0]._id,
            name: 'Filter Coffee',
            quantity: 50,
            price: 45,
          }
        ],
        totalAmount: 2250,
        status: 'processing',
      },
      {
        manufacturerId: manufacturer2,
        retailerId: retailer2,
        manufacturerName: 'Thanjavur Rice Mills',
        retailerName: 'City Mart',
        items: [
          {
            productId: savedProducts[1]._id,
            name: 'Idli Rice',
            quantity: 30,
            price: 120,
          }
        ],
        totalAmount: 3600,
        status: 'shipped',
      },
      {
        manufacturerId: manufacturer3,
        retailerId: retailer3,
        manufacturerName: 'Kerala-TN Oil Company',
        retailerName: 'Super Shop',
        items: [
          {
            productId: savedProducts[2]._id,
            name: 'Coconut Oil',
            quantity: 25,
            price: 180,
          }
        ],
        totalAmount: 4500,
        status: 'delivered',
      },
    ];

    await Order.insertMany(orders);
    console.log('✓ Created 3 sample orders');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Login Credentials:');
    console.log('------------------------');
    console.log('Manufacturer: coffee-works@example.com / password123');
    console.log('Retailer: best-retail@example.com / password123');
    console.log('------------------------\n');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();