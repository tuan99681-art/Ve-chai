/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dải Chạy Chữ Thông Báo Thu Mua Theo Tỉnh / Thành Phố (City Announcement Ticker)
 * Hiển thị nổi bật trên trang chính (MapPage / HomePage)
 * - Tự động nhận diện Tỉnh / Thành phố người dùng đăng ký để hiển thị thông báo phù hợp
 * - Hiệu ứng chạy chữ sinh động, báo ngày đoàn xe thu gom đến
 * - Hộp thoại xem chi tiết chính sách ưu đãi, danh sách phế liệu ưu tiên & hotline
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { isUserInCity } from '../utils/geo';
import { CityAnnouncement } from '../types';
import { 
  Megaphone, 
  MapPin, 
  Calendar, 
  Phone, 
  ChevronRight, 
  Sparkles, 
  X, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CityAnnouncementTicker: React.FC = () => {
  const { 
    currentUser, 
    cityAnnouncements, 
    adminPreviewCity, 
    setAdminPreviewCity,
    startOrGetConversation 
  } = useApp();

  const navigate = useNavigate();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<CityAnnouncement | null>(null);

  // Lọc thông báo phù hợp với Tỉnh / Thành phố của người dùng
  const relevantAnnouncements = useMemo(() => {
    const active = cityAnnouncements.filter(a => a.isActive);
    if (active.length === 0) return [];

    // Nếu là Admin và đang chọn preview thành phố cụ thể
    if (currentUser.role === 'admin' && adminPreviewCity && adminPreviewCity !== 'Toàn quốc') {
      const cityFiltered = active.filter(a => isUserInCity(adminPreviewCity, '', a.city));
      if (cityFiltered.length > 0) return cityFiltered;
    }

    // Người dùng thông thường: Tìm thông báo cho tỉnh của họ
    const userCity = currentUser.location?.city || '';
    const userAddr = currentUser.location?.address || '';

    const matched = active.filter(a => isUserInCity(userCity, userAddr, a.city));
    if (matched.length > 0) return matched;

    // Nếu không khớp tỉnh cụ thể, hiển thị thông báo toàn quốc hoặc thông báo mới nhất
    return active.filter(a => a.city === 'Toàn quốc' || a.city === 'Tất cả các tỉnh thành');
  }, [cityAnnouncements, currentUser, adminPreviewCity]);

  // Nếu không có thông báo nào thì không hiển thị
  if (relevantAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = relevantAnnouncements[0];

  const handleOpenChatWithAdmin = () => {
    // usr-admin-01
    startOrGetConversation('usr-admin-01');
    setSelectedAnnouncement(null);
    navigate('/chat');
  };

  return (
    <>
      {/* THANH CHẠY CHỮ TRÊN TRANG CHÍNH */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-emerald-500/30 flex items-center justify-between gap-3 overflow-hidden animate-in fade-in">
        
        {/* Huy hiệu loa thông báo & Tên tỉnh thành */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
            <Megaphone className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] sm:text-xs font-bold font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-300" />
              <span>{currentAnnouncement.city}</span>
            </span>
            <span className="hidden md:inline-block text-[11px] text-amber-300 font-semibold font-mono">
              [Ngày {currentAnnouncement.pickupDate}]
            </span>
          </div>
        </div>

        {/* Đoạn text chạy chữ (Marquee Ticker) */}
        <div className="flex-1 overflow-hidden relative cursor-pointer" onClick={() => setSelectedAnnouncement(currentAnnouncement)}>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm font-medium text-slate-100 hover:text-amber-300 transition-colors">
            <span className="text-amber-400 font-bold mr-1.5">📢 BQT THÔNG BÁO:</span>
            <span>{currentAnnouncement.title}</span>
            {currentAnnouncement.priceBonus && (
              <span className="ml-2 text-emerald-300 font-bold text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600/50">
                ✨ {currentAnnouncement.priceBonus}
              </span>
            )}
          </div>
        </div>

        {/* Nút xem chi tiết */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSelectedAnnouncement(currentAnnouncement)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all border border-white/20"
          >
            <span>Chi tiết</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>

      </div>

      {/* POPUP CHI TIẾT THÔNG BÁO TỈNH THÀNH */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <Megaphone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                      📍 {selectedAnnouncement.city}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Đoàn xe lưu động
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedAnnouncement.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.content}
            </div>

            {/* Thông tin lịch hẹn & khu vực */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-slate-500 text-[11px] block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Ngày đến thu mua:
                </span>
                <span className="font-extrabold text-emerald-900 text-sm mt-0.5 block font-mono">
                  {selectedAnnouncement.pickupDate}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                <span className="text-slate-500 text-[11px] block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  Địa bàn trọng điểm:
                </span>
                <span className="font-bold text-sky-950 text-xs mt-0.5 block">
                  {selectedAnnouncement.district || selectedAnnouncement.city}
                </span>
              </div>
            </div>

            {/* Danh mục ve chai ưu tiên */}
            {selectedAnnouncement.scrapTypes && selectedAnnouncement.scrapTypes.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Mặt hàng ve chai ưu tiên thu mua đợt này:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAnnouncement.scrapTypes.map((type, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chính sách ưu đãi */}
            {selectedAnnouncement.priceBonus && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Chính sách ưu đãi đặc biệt:</strong>
                  <span>{selectedAnnouncement.priceBonus}</span>
                </div>
              </div>
            )}

            {/* Hotline & Nút hành động */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <a
                href={`tel:${selectedAnnouncement.contactPhone}`}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Hotline: {selectedAnnouncement.contactPhone}</span>
              </a>

              <button
                onClick={handleOpenChatWithAdmin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin với Ban Quản Trị</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
