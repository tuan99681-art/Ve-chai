/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Biểu ngữ Thông Báo Đẩy Nổi (Push Notification Banner / Toast)
 * Hiển thị tức thì trên màn hình khi:
 * - Ban Quản Trị phát thông báo thu gom lưu động theo Tỉnh / Thành phố
 * - Có đơn hàng ve chai mới hoặc cập nhật thanh toán
 * - Có tin nhắn mới từ Ban Quản Trị hoặc Đối tác
 * Hỗ trợ Web Audio chime, click điều hướng và nút kích hoạt Web Notification trình duyệt.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, Volume2, VolumeX, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PushNotificationToast: React.FC = () => {
  const { 
    activePushToast, 
    dismissPushToast, 
    pushPermission, 
    requestPushPermission, 
    isPushSoundEnabled, 
    setIsPushSoundEnabled 
  } = useApp();

  const navigate = useNavigate();

  if (!activePushToast) {
    return null;
  }

  const handleAction = () => {
    if (activePushToast.url) {
      navigate(activePushToast.url);
    }
    dismissPushToast();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top duration-300">
      <div className={`p-4 rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 transition-all ${
        activePushToast.urgency === 'high' 
          ? 'bg-rose-950/90 border-rose-500/50 text-white shadow-rose-950/40' 
          : 'bg-slate-900/95 border-emerald-500/40 text-white shadow-slate-950/60'
      }`}>
        
        {/* Hàng tiêu đề & nút điều khiển */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              activePushToast.urgency === 'high' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              <Bell className="w-4 h-4 animate-bounce" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 font-mono border border-white/10">
                  Thông Báo Đẩy
                </span>
                {activePushToast.targetCity && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {activePushToast.targetCity}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-mono">
                  {activePushToast.timestamp}
                </span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                {activePushToast.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsPushSoundEnabled(!isPushSoundEnabled)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={isPushSoundEnabled ? 'Tắt âm báo' : 'Bật âm báo'}
            >
              {isPushSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={dismissPushToast}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <p className="text-xs text-slate-200 leading-relaxed line-clamp-3 bg-black/20 p-2.5 rounded-2xl border border-white/5">
          {activePushToast.body}
        </p>

        {/* Nút hành động */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {pushPermission !== 'granted' && pushPermission !== 'unsupported' ? (
            <button
              onClick={requestPushPermission}
              className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-medium flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bật thông báo ngoài màn hình</span>
            </button>
          ) : (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Đã kết nối trực tiếp
            </span>
          )}

          <button
            onClick={handleAction}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
