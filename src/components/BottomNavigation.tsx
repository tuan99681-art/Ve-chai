/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Thanh điều hướng dưới cùng (Bottom Navigation Bar)
 * Dành cho giao diện di động & màn hình chính:
 * 1. Bản đồ (Map)
 * 2. Danh sách đơn hàng (Orders)
 * 3. Bảng giá ve chai (Prices)
 * 4. Tin nhắn trực tiếp (Chat)
 * 5. Hồ sơ cá nhân (Profile)
 * & Phím tắt Quản trị (Admin) nếu đang ở vai trò Admin
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  ClipboardList, 
  MessageSquare, 
  User, 
  BadgePercent,
  ShieldAlert
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentUser, orders, conversations, unreadNotificationCount } = useApp();

  // Đếm số đơn hàng đang hoạt động liên quan đến người dùng
  const activeOrdersCount = orders.filter(o => {
    if (currentUser.role === 'seller') {
      return o.sellerId === currentUser.id && (o.status === 'pending' || o.status === 'accepted');
    }
    if (currentUser.role === 'buyer') {
      return (o.buyerId === currentUser.id && o.status === 'accepted') || (o.status === 'pending');
    }
    return o.status === 'pending';
  }).length;

  // Đếm tin nhắn chưa đọc
  const totalUnreadChat = conversations.reduce((acc, conv) => {
    return acc + (conv.unreadCount[currentUser.id] || 0);
  }, 0);

  const navItems = [
    {
      to: '/',
      label: 'Bản đồ',
      icon: MapPin,
      badge: null
    },
    {
      to: '/orders',
      label: 'Đơn hàng',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null
    },
    {
      to: '/prices',
      label: 'Bảng giá',
      icon: BadgePercent,
      badge: null
    },
    {
      to: '/chat',
      label: 'Tin nhắn',
      icon: MessageSquare,
      badge: totalUnreadChat > 0 ? totalUnreadChat : null
    },
    {
      to: '/profile',
      label: 'Cá nhân',
      icon: User,
      badge: unreadNotificationCount > 0 ? '•' : null
    }
  ];

  // Nếu là admin, thêm tùy chọn điều hướng Admin
  if (currentUser.role === 'admin') {
    navItems.push({
      to: '/admin',
      label: 'Quản trị',
      icon: ShieldAlert,
      badge: null
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg">
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'text-emerald-600 font-bold scale-105' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    
                    {/* Huy hiệu số lượng */}
                    {item.badge !== null && (
                      <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] mt-1 tracking-tight">
                    {item.label}
                  </span>

                  {/* Thanh chỉ báo active */}
                  {isActive && (
                    <span className="absolute bottom-0.5 w-5 h-1 bg-emerald-600 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
