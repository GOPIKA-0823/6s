import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';

// Main Pages
import LandingPage from '../pages/LandingPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';

// Auth Pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Manufacturer Pages
import ManufacturerDashboard from '../pages/manufacturer/Dashboard';
import ManufacturerProducts from '../pages/manufacturer/Products';
import ManufacturerRequests from '../pages/manufacturer/Requests';
import ManufacturerOrders from '../pages/manufacturer/Orders';
import ManufacturerProfile from '../pages/manufacturer/Profile';

// Retailer Pages
import RetailerDashboard from '../pages/retailer/Dashboard';
import RetailerMarketplace from '../pages/retailer/Marketplace';
import RetailerSendRequest from '../pages/retailer/SendRequest';
import RetailerMyRequests from '../pages/retailer/MyRequests';
import RetailerOrders from '../pages/retailer/Orders';
import RetailerBills from '../pages/retailer/Bills';
import RetailerProfile from '../pages/retailer/Profile';
import PaymentPage from '../pages/retailer/PaymentPage';
import AddressPage from '../pages/retailer/AddressPage';
import CancelOrderPage from '../pages/retailer/CancelOrderPage';
import ReturnOrderPage from '../pages/retailer/ReturnOrderPage';
import ReturnSuccessPage from '../pages/retailer/ReturnSuccessPage';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminRequests from '../pages/admin/AdminRequests';
import AdminMessages from '../pages/admin/AdminMessages';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="login/:userType" element={<LoginPage />} />
          <Route path="register/:userType" element={<RegisterPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="manufacturers" element={<AdminUsers />} />
          <Route path="retailers" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        {/* Manufacturer Dashboard Routes */}
        <Route path="/manufacturer/*" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<ManufacturerDashboard />} />
          <Route path="products" element={<ManufacturerProducts />} />
          <Route path="requests" element={<ManufacturerRequests />} />
          <Route path="orders" element={<ManufacturerOrders />} />
          <Route path="profile" element={<ManufacturerProfile />} />
        </Route>

        {/* Retailer Dashboard Routes */}
        <Route path="/retailer/*" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<RetailerDashboard />} />
          <Route path="marketplace" element={<RetailerMarketplace />} />
          <Route path="send-request" element={<RetailerSendRequest />} />
          <Route path="my-requests" element={<RetailerMyRequests />} />
          <Route path="orders" element={<RetailerOrders />} />
          <Route path="bills" element={<RetailerBills />} />
          <Route path="profile" element={<RetailerProfile />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="address" element={<AddressPage />} />
          <Route path="cancel-order/:orderId" element={<CancelOrderPage />} />
          <Route path="return-order/:orderId" element={<ReturnOrderPage />} />
          <Route path="return-success" element={<ReturnSuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;