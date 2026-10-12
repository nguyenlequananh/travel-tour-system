import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Chốt bảo vệ quyền Admin
import AdminRoute from './components/AdminRoute';

// Layout & Trang Client (Khách hàng)
import ClientLayout from './components/ClientLayout';
import HomePage from './pages/client/HomePage';
import TourDetailPage from './pages/client/TourDetailPage';
import MyBookingsPage from './pages/client/MyBookingsPage';
import CustomTourRequestPage from './pages/client/CustomTourRequestPage';

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= 1. KHU VỰC KHÁCH HÀNG (CÔNG KHAI) ================= */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tours/:id" element={<TourDetailPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="custom-tour" element={<CustomTourRequestPage />} />

// Trong Admin Route:
        </Route>

        {/* ================= 2. KHU VỰC ADMIN (BỊ KHÓA CHẶT BỞI AdminRoute) ================= */}
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;