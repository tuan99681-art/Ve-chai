/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Thanh tiêu đề trên cùng (Top Header)
 * Bao gồm Logo VeChaiXanh, Bộ chuyển đổi nhanh vai trò (Người bán / Người mua / Quản trị),
 * Số dư ví điện tử, Chuông thông báo đẩy, và Nút tạo đơn nhanh.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyVND } from '../utils/geo';
import { 
  Recycle, 
  Bell, 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  Truck, 
  ShoppingBag, 
  Check, 
  X, 
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopHeader: React.FC = () => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead, 
    clearAllNotifications,
    setShowAuthModal
  } = useApp();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Role info helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'seller':
        return { label: 'Người Bán', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: ShoppingBag };
      case 'buyer':
        return { label: 'Người Thu Mua', bg: 'bg-sky-100 text-sky-800 border-sky-300', icon: Truck };
      case 'admin':
        return { label: 'Quản Trị Viên', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: ShieldCheck };
      default:
        return { label: 'Thành Viên', bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: UserCheck };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const RoleIcon = badge.icon;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Logo & Slogan */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Recycle className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-green-600 bg-clip-text text-transparent">
                VeChaiXanh
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Thu gom phế liệu thông minh & tái chế xanh</p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Nút chuyển đổi vai trò nhanh để test trải nghiệm */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs transition-all hover:shadow-sm ${badge.bg}`}
              title="Nhấn để đổi vai trò thử nghiệm"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{badge.label}:</span>
              <span className="max-w-[100px] truncate">{currentUser.fullName.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Menu chọn tài khoản */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chọn vai trò demo</span>
                  <button 
                    onClick={() => setShowRoleSwitcher(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                  {users.map(u => {
                    const uBadge = getRoleBadge(u.role);
                    const UIcon = uBadge.icon;
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowRoleSwitcher(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-emerald-50/70' : ''}`}
                      >
                        <img 
                          src={u.avatar} 
                          alt={u.fullName} 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 truncate">{u.fullName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${uBadge.bg}`}>
                              <UIcon className="w-2.5 h-2.5" />
                              {uBadge.label}
                            </span>
                            <span>• {u.phone}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/70">
                  <button
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Đăng ký thành viên mới</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Nút Đăng ký nhanh ngoài thanh header */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs"
            title="Đăng ký tài khoản người bán / người mua mới"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đăng ký mới</span>
          </button>

          {/* Chuông Thông Báo */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Hộp thoại thông báo */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800">Thông báo</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-slate-600"
                    >
                      Xóa tất cả
                    </button>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Không có thông báo mới nào
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${!notif.isRead ? 'bg-emerald-50/50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${!notif.isRead ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.createdAt}</span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
