import Sidebar from '../components/Sidebar';
import ChatbotComponent from '../components/Chatbot';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  // Determine user type from URL path
  const path = window.location.pathname;
  const userType = path.startsWith('/manufacturer') ? 'manufacturer' : 'retailer';
  const { user } = useAuth();

  // If not logged in or user type mismatch, redirect to login
  if (!user || user.userType !== userType) {
    return <Navigate to={`/login/${userType}`} replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType={userType} />
      <div className="flex-1 ml-0">
        <div className="p-8">
          <Outlet />
        </div>
        {/* <ChatbotComponent userType={userType} /> */}
      </div>
    </div>
  );
};

export default DashboardLayout;