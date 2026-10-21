/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Hồ Sơ Cá Nhân & Xác Thực Số Điện Thoại (Profile Page)
 * - Quản lý thông tin tài khoản & xác thực số điện thoại (Không cần CCCD)
 * - Cơ chế bảo mật vị trí: Vị trí người bán chỉ hiện khi có món hàng đăng bán, bán xong tự động ẩn
 * - Nguyên tắc: Người mua và Người bán TỰ THANH TOÁN TRỰC TIẾP với nhau (Tiền mặt / Chuyển khoản)
 * - Theo dõi ý thức thực hiện giao dịch, điểm uy tín & đánh giá từ đối tác
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Truck, 
  Award,
  HandCoins,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShoppingBag
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    reviews, 
    hasActiveScrapListing,
    setShowAuthModal
  } = useApp();

  const isSeller = currentUser.role === 'seller';
  const hasListing = isSeller ? hasActiveScrapListing(currentUser.id) : false;

  // Lọc đánh giá nhận được
  const receivedReviews = reviews.filter(r => r.toUserId === currentUser.id);

  return (
    <div className="space-y-4">
      
      {/* 1. THẺ HỒ SƠ CHÍNH (USER PROFILE CARD) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{currentUser.fullName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  currentUser.role === 'buyer' 
                    ? 'bg-sky-100 text-sky-800' 
                    : currentUser.role === 'seller'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {currentUser.role === 'buyer' ? 'Người Thu Mua Ve Chai' : currentUser.role === 'seller' ? 'Người Bán Ve Chai' : 'Quản Trị Viên'}
                </span>
              </div>

              {/* Xác thực SĐT & không cần CCCD */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã xác thực SĐT: {currentUser.phone}
                </span>
                <span className="text-[11px] text-slate-400">
                  (Xác thực OTP tức thì • Không cần CCCD)
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentUser.location.address}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors self-end sm:self-auto shadow-2xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Đăng ký tài khoản khác</span>
          </button>
        </div>

        {/* Chỉ số Uy tín & Ý thức giao dịch */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-2xl text-center">
            <span className="text-slate-400 text-[11px] block">Điểm uy tín</span>
            <span className="font-extrabold text-amber-600 text-base flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              {currentUser.reputationScore.toFixed(1)} / 5.0
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-center">
            <span className="text-slate-400 text-[11px] block">Tổng giao dịch</span>
            <span className="font-extrabold text-slate-800 text-base font-mono mt-0.5">
              {currentUser.totalTransactions} đơn
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-center">
            <span className="text-slate-400 text-[11px] block">Tỉ lệ hoàn thành</span>
            <span className="font-extrabold text-emerald-700 text-base font-mono mt-0.5">
              {currentUser.completionRate}%
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl text-center">
            <span className="text-slate-400 text-[11px] block">Ý thức giao dịch</span>
            <span className="font-extrabold text-sky-700 text-base mt-0.5 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" />
              Tốt 100%
            </span>
          </div>
        </div>

        {/* Danh sách huy hiệu uy tín */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1">Huy hiệu:</span>
          {currentUser.badges.map((b, i) => (
            <span 
              key={i}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* 2. CHÍNH SÁCH BẢO MẬT VỊ TRÍ MINH BẠCH (PRIVACY & LOCATION VISIBILITY STATUS) */}
      <div className={`rounded-3xl p-5 border shadow-xs space-y-3 ${
        isSeller
          ? hasListing
            ? 'bg-emerald-50/70 border-emerald-300'
            : 'bg-slate-50 border-slate-200'
          : 'bg-sky-50/70 border-sky-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSeller ? (
              hasListing ? (
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
              )
            ) : (
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Trạng Thái Hiển Thị Vị Trí Trên Bản Đồ
              </h3>
              <p className="text-xs text-slate-600">
                {isSeller
                  ? (hasListing 
                      ? '🟢 Đang HIỆN vị trí: Bạn có món hàng ve chai đang đăng bán.'
                      : '🔒 Đang ẨN vị trí: Không có món hàng nào đang đăng bán.')
                  : '🚚 Người thu mua: Bạn thấy các người bán đang có món hàng cần bán.'}
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
            isSeller
              ? hasListing ? 'bg-emerald-200 text-emerald-950' : 'bg-slate-200 text-slate-700'
              : 'bg-sky-200 text-sky-950'
          }`}>
            {isSeller ? (hasListing ? 'ĐANG HIỂN THỊ' : 'ĐANG ẨN') : 'TÌM QUANH BẠN'}
          </span>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-slate-200/60 space-y-1.5">
          <p className="font-semibold text-slate-900">
            🛡️ Quy định hiển thị vị trí của VeChaiXanh:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
            <li>
              <strong>Khi bạn đăng bán món hàng:</strong> Vị trí của bạn mới hiển thị trên bản đồ cho người mua thấy để họ đến thu gom.
            </li>
            <li>
              <strong>Khi mua bán xong (hoàn tất giao dịch):</strong> Hệ thống lập tức <strong>tự động ẩn vị trí của bạn</strong> để đảm bảo an toàn tuyệt đối cho người bán!
            </li>
            <li>
              <strong>Người bán trên bản đồ:</strong> Chỉ thấy <strong>1 người thu mua duy nhất gần bạn nhất</strong> để kết nối nhanh, không bị phân tâm hoặc làm phiền.
            </li>
          </ul>
        </div>
      </div>

      {/* 3. NGUYÊN TẮC TỰ THANH TOÁN TRỰC TIẾP (NO E-WALLET) */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-300 font-bold">
            <HandCoins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Thanh Toán Trực Tiếp Giữa Hai Bên</h3>
            <p className="text-xs text-emerald-200/90">Không dùng ví điện tử trung gian • Hai bên tự thỏa thuận & thanh toán trực tiếp</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Tiền mặt trao tay
            </span>
            <p className="text-slate-300 text-[11px]">
              Người mua đến cân ve chai, hai bên đồng ý giá và người mua trả tiền mặt trực tiếp cho người bán tại chỗ.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Chuyển khoản trực tiếp
            </span>
            <p className="text-slate-300 text-[11px]">
              Có thể quét mã QR tài khoản ngân hàng của nhau để chuyển khoản nhận tiền ngay lập tức không mất phí trung gian.
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đánh giá uy tín sau bán
            </span>
            <p className="text-slate-300 text-[11px]">
              Giao dịch xong, cả 2 bên chấm điểm sao và nhận xét ý thức giao dịch (cân đúng, đúng hẹn, lịch sự) để xây dựng uy tín lâu dài.
            </p>
          </div>
        </div>
      </div>

      {/* 4. ĐÁNH GIÁ TỪ ĐỐI TÁC GIAO DỊCH */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Nhận xét và đánh giá uy tín từ đối tác ({receivedReviews.length})</span>
          </h3>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {receivedReviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Chưa có nhận xét nào từ giao dịch trước</p>
          ) : (
            receivedReviews.map(rev => (
              <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{rev.fromUserName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      rev.fromUserRole === 'buyer' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rev.fromUserRole === 'buyer' ? 'Người Thu Mua' : 'Người Bán'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-500" />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 block">{rev.createdAt}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
