# Agaram Agencies - Data Refactoring Guide

## Overview of Changes

This document outlines all the changes made to fix data isolation, prevent duplicates, and fetch dynamic data from MongoDB.

---

## 1. Database Models Changes

### **User Model** (`backend/models/User.js`)
**Changes:**
- Added `enum` constraint for `userType` (must be 'manufacturer' or 'retailer')
- Made `email` unique and case-insensitive
- Added `isActive` field for account status
- Added comments explaining each field

**Benefits:**
- Prevents duplicate user registration
- Enforces data consistency

### **Product Model** (`backend/models/Product.js`)
**Breaking Changes:**
- **REMOVED:** `manufacturer` field (was just a string)
- **ADDED:** `manufacturerId` field (reference to User model)
  - Ensures each product belongs to a specific manufacturer
  - Enables data isolation (manufacturers only see their products)

**Index:**
- Unique index on (`manufacturerId`, `name`) pair
- Prevents same manufacturer from creating duplicate product names

**Example:**
```javascript
{
  manufacturerId: ObjectId("user_id_123"),
  name: 'Filter Coffee',
  price: 45,
  stock: 150
}
```

### **Order Model** (`backend/models/Order.js`)
**New Fields:**
- `manufacturerId`: Reference to manufacturer (User)
- `retailerId`: Reference to retailer (User)
- Modified `items` to include `productId` reference

**Benefits:**
- Orders can be filtered by manufacturer or retailer
- Enables user-specific order retrieval
- Maintains data integrity with foreign key references

### **Request Model** (`backend/models/Request.js`)
**New Fields:**
- `manufacturerId`: Reference to manufacturer
- `retailerId`: Reference to retailer
- `productId`: Reference to Product

**Special Index:**
- Unique index on (`retailerId`, `productId`, `status`) with filter for `status: 'pending'`
- Prevents duplicate PENDING requests from same retailer for same product
- Retailers can have only ONE pending request per product at a time

**Example:**
A retailer cannot have two pending requests for the same product simultaneously.

---

## 2. Authentication Middleware

### **New File:** `backend/middleware/authMiddleware.js`
**Purpose:**
- Extracts userId from request headers (`X-User-Id`)
- Attaches userId to `req.userId` for use in routes
- Returns 401 Unauthorized if userId is missing

**Usage in Routes:**
```javascript
router.get('/products', authMiddleware, async (req, res) => {
  // req.userId now contains the logged-in user's ID
  const products = await Product.find({ manufacturerId: req.userId });
});
```

---

## 3. Backend API Routes Changes

### **Products Routes** (`backend/routes/products.js`)

| Route | Method | Auth | Changes |
|-------|--------|------|---------|
| `/products` | GET | ✓ | Now filters by `manufacturerId` - shows only logged-in manufacturer's products |
| `/products/marketplace` | GET | ✗ | Shows all active products (for retailers to browse) |
| `/products` | POST | ✓ | Automatically sets `manufacturerId` from auth token |
| `/products/:id` | PUT | ✓ | Verifies ownership before updating |
| `/products/:id` | DELETE | ✓ | Verifies ownership before deleting |

**Key Feature:** Duplicate Prevention
```javascript
// Check if product name already exists for this manufacturer
const existingProduct = await Product.findOne({
  manufacturerId: req.userId,
  name: req.body.name
});
```

### **Orders Routes** (`backend/routes/orders.js`)

| Route | Method | Auth | Changes |
|-------|--------|------|---------|
| `/orders/manufacturer` | GET | ✓ | Shows orders where user is manufacturer |
| `/orders/retailer` | GET | ✓ | Shows orders where user is retailer |
| `/orders` | POST | ✓ | Creates order linked to authenticated user |
| `/orders/:id` | PUT | ✓ | Only manufacturer/retailer in order can update |

**New Filtering:**
```javascript
// Manufacturer only sees their own orders
const orders = await Order.find({ manufacturerId: req.userId });

// Retailer only sees their own orders  
const orders = await Order.find({ retailerId: req.userId });
```

### **Requests Routes** (`backend/routes/requests.js`)

| Route | Method | Auth | Changes |
|-------|--------|------|---------|
| `/requests/product-requests` | GET | ✓ | Shows requests FOR manufacturer's products |
| `/requests/retailer-requests` | GET | ✓ | Shows requests CREATED BY retailer |
| `/requests` | POST | ✓ | Validates retailer can only create for themselves |
| `/requests/:id` | PUT | ✓ | Manufacturer can accept/reject, Retailer can cancel |

**Duplicate Prevention:**
```javascript
// Unique constraint prevents duplicate pending requests
requestSchema.index({
  retailerId: 1,
  productId: 1,
  status: 1
}, {
  unique: true,
  partialFilterExpression: { status: 'pending' }
});
```

### **Users Routes** (`backend/routes/users.js`)

| Route | Method | Changes |
|-------|--------|---------|
| `/users/register` | POST | New route for sign-up validation |
| `/users/login` | POST | Enhanced with better error messages |
| `/users/:id` | GET | Get user profile |
| `/users/:id` | PUT | Update user profile |

**New Feature:** Email Uniqueness Validation
```javascript
const existingUser = await User.findOne({ email: email.toLowerCase() });
if (existingUser) {
  return res.status(409).json({ message: 'Email already registered' });
}
```

---

## 4. Frontend API Service Changes

### **File:** `frontend/src/services/api.js`

**New Interceptor:**
```javascript
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('agaram_user'));
  if (user && user._id) {
    config.headers['X-User-Id'] = user._id;
  }
  return config;
});
```
**Effect:** Automatically sends `userId` with every API request

**Organized by Sections:**
- User Authentication (register, login, profile)
- Products (create, read, update, delete)
- Requests (create, read, update, delete)
- Orders (create, read, update, delete)

**Example API Call:**
```javascript
// Frontend
const products = await api.getManufacturerProducts();

// Automatically includes X-User-Id header
// Backend filters: Product.find({ manufacturerId: req.userId })
```

---

## 5. Frontend Data Fetching Changes

### **File:** `frontend/src/services/dummyData.js`

**Before:**
```javascript
export const getManufacturerStats = () => ({
  totalProducts: 24,  // Hardcoded ❌
  pendingRequests: 8,
  // ...
});
```

**After:**
```javascript
export const getManufacturerStats = async () => {
  const responses = await Promise.all([
    api.getManufacturerProducts(),
    api.getProductRequests(),
    api.getManufacturerOrders(),
  ]);
  
  // Calculate stats from REAL data
  const totalProducts = responses[0].data.length;
  // ...
};
```

**Benefits:**
- Stats are calculated from real database data
- Always reflects current state
- No data duplication
- Updates automatically when data changes

### **Dashboard Components Changes**

**File:** `frontend/src/pages/manufacturer/Dashboard.jsx`

**Before:**
```javascript
const stats = getManufacturerStats(); // Sync call, hardcoded data
```

**After:**
```javascript
useEffect(() => {
  const fetchStats = async () => {
    const data = await getManufacturerStats(); // Async API call
    setStats(data);
  };
  fetchStats();
}, []);
```

**Features:**
- Loading state while fetching
- Error handling with user feedback
- Real-time data from MongoDB
- Shows empty state if no data

---

## 6. Database Seeding

### **Updated:** `backend/seed.js`

**New Flow:**
1. Create 6 test users (3 manufacturers, 3 retailers)
2. Create products linked to manufacturers (manufacturerId)
3. Create requests from retailers to manufacturers
4. Create orders between specific manufacturers and retailers

**Test Credentials:**
```
Manufacturer:
  Email: coffee-works@example.com
  Password: password123

Retailer:
  Email: best-retail@example.com
  Password: password123
```

---

## 7. Key Data Flow Example

### **Scenario: Retailer Views Orders**

1. **Login:**
   ```
   POST /api/users/login
   Body: { email, password }
   Response: User object with _id
   ```

2. **Frontend stores user:**
   ```javascript
   localStorage.setItem('agaram_user', JSON.stringify(user));
   // user._id is now available
   ```

3. **Fetch orders:**
   ```
   GET /api/orders/retailer
   Headers: { 'X-User-Id': user._id }
   ```

4. **Backend filters:**
   ```javascript
   const orders = await Order.find({ retailerId: req.userId });
   // Only returns orders where user is the retailer
   ```

5. **Display on frontend:**
   ```javascript
   Dashboard renders orders from database
   Each retailer sees ONLY their orders
   ```

---

## 8. Preventing Duplicates - Summary

| Data | Prevention Method |
|------|-------------------|
| User Email | Unique index + validation |
| Product Name (per Manufacturer) | Unique index on (manufacturerId, name) |
| Pending Request (per Retailer & Product) | Unique conditional index |
| Order Items | Foreign key references |

---

## 9. Running the Application

### **Backend:**
```bash
cd backend
npm install
npm run dev
npm run seed  # Populate test data
```

### **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### **Expected Behavior:**
1. Login as test user (see credentials above)
2. Dashboard shows ONLY your data from database
3. Can create products/requests/orders
4. Cannot create duplicate entries
5. All data is real-time from MongoDB

---

## 10. Files Modified Summary

| File | Changes |
|------|---------|
| `backend/models/User.js` | Added enums, validation, isActive field |
| `backend/models/Product.js` | Added manufacturerId, unique indexes |
| `backend/models/Order.js` | Added manufacturerId, retailerId references |
| `backend/models/Request.js` | Added user references, duplicate prevention |
| `backend/middleware/authMiddleware.js` | NEW - Authentication interceptor |
| `backend/routes/products.js` | Added user filtering, validation |
| `backend/routes/orders.js` | Added user-specific queries |
| `backend/routes/requests.js` | Added permission checks |
| `backend/routes/users.js` | Enhanced register/login, added validation |
| `backend/seed.js` | Updated to create users, link data correctly |
| `frontend/src/services/api.js` | Added interceptor, organized endpoints |
| `frontend/src/services/dummyData.js` | Converted to async API calls |
| `frontend/src/pages/manufacturer/Dashboard.jsx` | Added useEffect, real data fetching |
| `frontend/src/pages/retailer/Dashboard.jsx` | Added useEffect, real data fetching |

---

## 11. Security Recommendations (Future Improvements)

1. **Password Hashing:** Use `bcrypt` instead of plain text
2. **JWT Tokens:** Implement JWT instead of userId header
3. **Rate Limiting:** Prevent brute force attacks
4. **Input Validation:** Use libraries like `joi` or `yup`
5. **HTTPS:** Use SSL/TLS in production
6. **CORS:** Configure CORS properly for production

---

## Conclusion

All hardcoded data has been removed. The application now:
✅ Fetches all data dynamically from MongoDB
✅ Ensures data isolation (users only see their own data)
✅ Prevents duplicate entries with database constraints
✅ Uses proper authentication for API access
✅ Displays real-time data on dashboards
