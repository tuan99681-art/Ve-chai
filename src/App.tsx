/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Ứng Dụng VeChaiXanh - Nền Tảng Kết Nối Mua Bán Ve Chai Phế Liệu Thông Minh
 * Khung giao diện cơ bản:
 * - HashRouter với các tuyến đường: Bản đồ, Đơn hàng, Bảng giá, Tin nhắn, Hồ sơ cá nhân & Quản trị
 * - Thanh điều hướng dưới cùng (Bottom Navigation Bar)
 * - Vùng hiển thị chính (Main Content Area)
 * - Thanh tiêu đề trên cùng (Top Header) hỗ trợ chuyển vai trò tức thì
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TopHeader } from './components/TopHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { MapPage } from './pages/MapPage';
import { OrdersPage } from './pages/OrdersPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { PricesPage } from './pages/PricesPage';
import { AdminPage } from './pages/AdminPage';
import { CreateOrderModal } from './components/CreateOrderModal';
import { ReviewModal } from './components/ReviewModal';
import { RegistrationModal } from './components/RegistrationModal';
import { ScrapOrder } from './types';
import { useApp } from './context/AppContext';

function AppContent() {
  const { showAuthModal, setShowAuthModal } = useApp();
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [orderForReview, setOrderForReview] = useState<ScrapOrder | null>(null);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Thanh tiêu đề trên cùng */}
      <TopHeader />

      {/* 2. Vùng hiển thị nội dung chính (Main Content Area) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 pb-24 md:pb-20">
        <Routes>
          {/* Mục 1: Bản đồ định vị & người mua/bán gần nhất */}
          <Route 
            path="/" 
            element={<MapPage onOpenCreateOrder={() => setShowCreateOrder(true)} />} 
          />
          <Route path="/map" element={<Navigate to="/" replace />} />

          {/* Mục 2: Danh sách & Lịch sử đơn hàng thu gom */}
          <Route 
            path="/orders" 
            element={
              <OrdersPage 
                onOpenCreateOrder={() => setShowCreateOrder(true)} 
                onOpenReviewModal={(order) => setOrderForReview(order)}
              />
            } 
          />

          {/* Mục 3: Tin nhắn trực tiếp & đàm phán giá */}
          <Route path="/chat" element={<ChatPage />} />

          {/* Mục 4: Hồ sơ cá nhân, định danh CCCD & Ví điện tử VeChaiPay */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Mục mở rộng: Bảng giá phế liệu thị trường */}
          <Route path="/prices" element={<PricesPage />} />

          {/* Mục mở rộng: Trung tâm quản trị viên & kiểm soát gian lận */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Thanh điều hướng dưới cùng (Bottom Navigation Bar) */}
      <BottomNavigation />

      {/* 4. Hộp thoại tạo đơn thu gom ve chai */}
      <CreateOrderModal 
        isOpen={showCreateOrder} 
        onClose={() => setShowCreateOrder(false)} 
      />

      {/* 5. Hộp thoại đánh giá uy tín */}
      <ReviewModal 
        order={orderForReview} 
        onClose={() => setOrderForReview(null)} 
      />

      {/* 6. Hộp thoại đăng ký xác thực SĐT và vị trí cho người mới vào app */}
      <RegistrationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
}
