import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './context/AuthContext';

// Chốt bảo vệ quyền hạn & Xử lý Google OAuth2
import AdminRoute from './components/AdminRoute';
import GuideRoute from './components/GuideRoute';
import GuideLayout from './components/GuideLayout';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';

// Layout & Trang Client (Khách hàng)
import ClientLayout from './components/ClientLayout';
import HomePage from './pages/client/HomePage';
import TourDetailPage from './pages/client/TourDetailPage';
import MyBookingsPage from './pages/client/MyBookingsPage';
import CustomTourRequestPage from './pages/client/CustomTourRequestPage';
import ProfilePage from './pages/client/ProfilePage';
import PaymentCallbackPage from './pages/client/PaymentCallbackPage';

// Trang Hướng dẫn viên (Guide)
import GuideDashboardPage from './pages/client/GuideDashboardPage';

// Layout & Trang Admin (Quản trị viên)
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import TourManagement from './pages/TourManagement';
import CategoryManagement from './pages/CategoryManagement';
import TourDepartureManagement from './pages/TourDepartureManagement';
import TourItineraryManagement from './pages/TourItineraryManagement';
import PromotionManagement from './pages/PromotionManagement';
import BookingManagement from './pages/BookingManagement';
import CancellationManagement from './pages/CancellationManagement';
import PaymentManagement from './pages/PaymentManagement';
import UserManagement from './pages/UserManagement';
import ReviewManagement from './pages/ReviewManagement';
import CustomTourManagement from './pages/CustomTourManagement';
import EmailLogManagement from './pages/EmailLogManagement';

const travelHubTheme = {
  token: {
    colorPrimary: '#0d6e6e',
    colorInfo: '#0d6e6e',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorTextBase: '#0f172a',
    colorBgLayout: '#f6f8fb',
    borderRadius: 10,
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 46,
      fontWeight: 600,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 46,
    },
    Select: {
      controlHeight: 40,
      controlHeightLG: 46,
    },
  },
};

function App() {
  return (
    <ConfigProvider theme={travelHubTheme} locale={viVN}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* ================= XỬ LÝ REDIRECT GOOGLE OAUTH2 ================= */}
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* ================= 1. KHU VỰC KHÁCH HÀNG (CLIENT CÔNG KHAI) ================= */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="custom-tour" element={<CustomTourRequestPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="payment-callback" element={<PaymentCallbackPage />} />
          </Route>

          {/* ================= 2. KHU VỰC HƯỚNG DẪN VIÊN (BỊ KHÓA BỞI GuideRoute) ================= */}
          <Route element={<GuideRoute />}>
            <Route element={<GuideLayout />}>
              <Route path="/guide" element={<GuideDashboardPage />} />
            </Route>
          </Route>

          {/* ================= 3. KHU VỰC ADMIN (BỊ KHÓA BỞI AdminRoute) ================= */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="tours" element={<TourManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="departures" element={<TourDepartureManagement />} />
              <Route path="itineraries" element={<TourItineraryManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="cancellations" element={<CancellationManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="custom-tours" element={<CustomTourManagement />} />
              <Route path="email-logs" element={<EmailLogManagement />} />
            </Route>
          </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
