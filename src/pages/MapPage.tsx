/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Bản Đồ Tương Tác & Định Vị (Map Explorer)
 * Hiển thị vị trí trực quan của Người Bán và Người Thu Mua ve chai
 * - Tìm kiếm người mua / người bán gần nhất theo khoảng cách thực tế (Haversine km)
 * - Bộ lọc bán kính linh hoạt (1km, 3km, 5km, 10km, 25km)
 * - Bộ lọc chủng loại phế liệu & vai trò
 * - Chế độ Quản trị viên: quan sát toàn bộ người mua & người bán trên bản đồ thành phố
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateHaversineDistance, formatDistance, estimateTravelTimeMinutes } from '../utils/geo';
import { UserProfile } from '../types';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  Star, 
  Phone, 
  MessageSquare, 
  Truck, 
  ShoppingBag, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  SlidersHorizontal,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type UserWithDistance = UserProfile & {
  distanceKm: number;
  travelMinutes: number;
};

export const MapPage: React.FC<{ onOpenCreateOrder?: () => void }> = ({ onOpenCreateOrder }) => {
  const { 
    currentUser, 
    users, 
    selectedRadiusKm, 
    setSelectedRadiusKm, 
    startOrGetConversation,
    hasActiveScrapListing,
    categories 
  } = useApp();

  const navigate = useNavigate();

  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithDistance | null>(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [showAdminHeatmap, setShowAdminHeatmap] = useState(false);

  // Tính khoảng cách từ vị trí người dùng hiện tại đến mọi thành viên khác
  const usersWithDistance = useMemo(() => {
    return users
      .filter(u => u.id !== currentUser.id)
      .map(u => {
        const distanceKm = calculateHaversineDistance(currentUser.location, u.location);
        const travelMinutes = estimateTravelTimeMinutes(distanceKm);
        return {
          ...u,
          distanceKm,
          travelMinutes
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [users, currentUser]);

  // Áp dụng bộ lọc và quy tắc hệ thống:
  // - Người bán (Seller): CHỈ HIỂN THỊ ĐÚNG 1 NGƯỜI MUA DUY NHẤT GẦN ĐÓ NHẤT!
  // - Ban quản trị (Admin): ĐƯỢC NHÌN HẾT VỊ TRÍ tất cả người mua và người bán toàn thành phố.
  // - Người thu mua (Buyer): CHỈ HIỂN THỊ NGƯỜI BÁN ĐANG ĐĂNG BÁN MÓN HÀNG! Mua bán xong thì lại ẩn vị trí!
  const filteredUsers = useMemo(() => {
    // 1. NGƯỜI BÁN: Chỉ hiển thị 1 người mua duy nhất gần đó nhất
    if (currentUser.role === 'seller') {
      const allBuyers = usersWithDistance.filter(u => u.role === 'buyer');
      if (allBuyers.length === 0) return [];
      // Lấy đúng 1 người mua gần nhất (đã sort theo distanceKm tăng dần)
      return [allBuyers[0]];
    }

    // 2. QUẢN TRỊ VIÊN: Nhìn thấy HẾT vị trí của mọi người mua và người bán
    if (currentUser.role === 'admin') {
      return usersWithDistance.filter(u => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (!showAdminHeatmap && u.distanceKm > selectedRadiusKm) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return u.fullName.toLowerCase().includes(q) || u.location.address.toLowerCase().includes(q) || u.phone.includes(q);
        }
        return true;
      });
    }

    // 3. NGƯỜI THU MUA: Xem danh sách người bán xung quanh ĐANG CÓ MÓN HÀNG ĐĂNG BÁN
    return usersWithDistance.filter(u => {
      if (u.role !== 'seller') return false;
      // QUY TẮC BẢO MẬT: Chỉ khi đăng bán món hàng nào đó mới hiển thị vị trí cho người mua thấy. Mua bán xong thì ẩn vị trí!
      if (!hasActiveScrapListing(u.id)) return false;
      if (u.distanceKm > selectedRadiusKm) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return u.fullName.toLowerCase().includes(q) || u.location.address.toLowerCase().includes(q) || u.phone.includes(q);
      }
      return true;
    });
  }, [usersWithDistance, currentUser.role, roleFilter, selectedRadiusKm, searchQuery, showAdminHeatmap, hasActiveScrapListing]);

  // Xử lý bắt đầu nhắn tin với người được chọn
  const handleChatWithUser = (user: UserProfile) => {
    startOrGetConversation(user.id);
    navigate('/chat');
  };

  return (
    <div className="space-y-4">
      
      {/* THÔNG BÁO DÀNH CHO NGƯỜI BÁN: CHỈ HIỂN THỊ 1 NGƯỜI MUA DUY NHẤT GẦN NHẤT */}
      {currentUser.role === 'seller' && (
        <div className="space-y-2.5">
          {filteredUsers[0] ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wide">
                      1 Người Thu Mua Duy Nhất Gần Bạn Nhất
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold font-mono">
                      {formatDistance(filteredUsers[0].distanceKm)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    <strong>{filteredUsers[0].fullName}</strong> ({filteredUsers[0].vehicleType || 'Thu mua lưu động'}). Kích vào người này để trò chuyện, thỏa thuận giá và tự thanh toán trực tiếp!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setSelectedUser(filteredUsers[0])}
                  className="px-3 py-2 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => handleChatWithUser(filteredUsers[0])}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Kích để chat & Bán ngay</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Chưa tìm thấy người thu mua trong bán kính này. Hãy tăng bán kính quét hoặc tạo yêu cầu để người mua tìm bạn.</span>
            </div>
          )}

          {/* Trạng thái bảo mật vị trí của Người Bán */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              {hasActiveScrapListing(currentUser.id) ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-emerald-900 font-semibold">
                    Vị trí của bạn đang <strong>HIỂN THỊ</strong> cho người thu mua vì bạn có ve chai đang đăng bán.
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-slate-600">
                    Vị trí của bạn đang <strong>ẨN</strong>. Khi bạn đăng bán món hàng nào đó mới hiển thị vị trí cho người mua thấy, mua bán xong lại tự động ẩn.
                  </span>
                </>
              )}
            </div>

            {onOpenCreateOrder && (
              <button
                onClick={onOpenCreateOrder}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-[11px] flex items-center gap-1 shrink-0 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đăng bán ve chai ngay</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* THÔNG BÁO DÀNH CHO NGƯỜI THU MUA: CHỈ HIỆN NGƯỜI BÁN ĐANG ĐĂNG BÁN */}
      {currentUser.role === 'buyer' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-xs text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              <strong>Bản đồ người thu mua:</strong> Chỉ hiển thị những người bán đang <strong>CÓ ĐĂNG BÁN</strong> ve chai cần thu gom ({filteredUsers.length} người bán quanh bạn). Khi giao dịch xong, vị trí sẽ tự động ẩn đi để bảo vệ sự riêng tư.
            </span>
          </div>
        </div>
      )}

      {/* THÔNG BÁO DÀNH CHO QUẢN TRỊ VIÊN: TOÀN BỘ NGƯỜI BÁN VÀ NGƯỜI MUA */}
      {currentUser.role === 'admin' && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 text-xs text-purple-900 flex items-center gap-2 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            <strong>Chế độ Quản Trị Viên:</strong> Bạn được nhìn thấy hết vị trí toàn bộ {filteredUsers.length} thành viên (người bán và người mua) trên toàn thành phố để giám sát và xử lý vi phạm.
          </span>
        </div>
      )}

      {/* Thanh tìm kiếm & Bộ lọc nhanh */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm người mua, vựa phế liệu, địa chỉ, số ĐT..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Chọn vai trò lọc */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({usersWithDistance.length})
            </button>
            <button
              onClick={() => setRoleFilter('buyer')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === 'buyer'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Người Mua ({usersWithDistance.filter(u => u.role === 'buyer').length})
            </button>
            <button
              onClick={() => setRoleFilter('seller')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === 'seller'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Người Bán ({usersWithDistance.filter(u => u.role === 'seller').length})
            </button>
          </div>
        </div>

        {/* Thanh trượt điều chỉnh bán kính tìm kiếm (Radius Slider) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Bán kính quét:</span>
            <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {selectedRadiusKm} km
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 3, 5, 10, 25].map(radius => (
              <button
                key={radius}
                onClick={() => setSelectedRadiusKm(radius)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedRadiusKm === radius
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {radius}km
              </button>
            ))}
          </div>

          {/* Dành riêng cho Quản trị viên */}
          {currentUser.role === 'admin' && (
            <div className="w-full sm:w-auto flex items-center gap-2 mt-1 sm:mt-0">
              <label className="flex items-center gap-1.5 text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-purple-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAdminHeatmap}
                  onChange={(e) => setShowAdminHeatmap(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin: Xem tất cả vị trí toàn thành phố
              </label>
            </div>
          )}
        </div>
      </div>

      {/* KHUNG BẢN ĐỒ TƯƠNG TÁC (INTERACTIVE RADAR & MAP CANVAS) */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-xl min-h-[420px] sm:min-h-[480px] flex flex-col justify-between p-4">
        
        {/* Bản đồ nền với lưới Grid, sóng Radar và các điểm đánh dấu (GPS Pins) */}
        <div className="absolute inset-0 bg-radial from-slate-800/80 via-slate-900 to-slate-950 pointer-events-none">
          {/* Lưới tọa độ bản đồ */}
          <div 
            className="w-full h-full opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Vòng quét Radar hiệu ứng */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-emerald-500/20 pointer-events-none">
            <div className="w-full h-full rounded-full border border-dashed border-emerald-500/10 animate-spin-slow" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-emerald-500/10 pointer-events-none" />
        </div>

        {/* Thanh công cụ phụ trên góc bản đồ */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-emerald-400">Trực tiếp:</span>
            <span>{filteredUsers.length} đối tác đang kết nối</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setMapZoom(prev => Math.min(prev + 0.2, 1.6))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
              title="Phóng to"
            >
              +
            </button>
            <button
              onClick={() => setMapZoom(prev => Math.max(prev - 0.2, 0.8))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
              title="Thu nhỏ"
            >
              -
            </button>
            <button
              onClick={() => {
                setMapZoom(1);
                setSelectedUser(null);
              }}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-medium transition-colors"
              title="Tâm vị trí của tôi"
            >
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>Gốc</span>
            </button>
          </div>
        </div>

        {/* VÙNG HIỂN THỊ CÁC ĐIỂM MARKERS TRÊN TỌA ĐỘ MẪU */}
        <div 
          className="relative flex-1 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${mapZoom})` }}
        >
          {/* Điểm của TÔI (Current User GPS) */}
          <div className="relative z-20 flex flex-col items-center cursor-pointer group">
            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="relative w-10 h-10 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Navigation className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/40 shadow-sm whitespace-nowrap">
              Vị trí của bạn ({currentUser.fullName.split(' ')[0]})
            </div>
          </div>

          {/* Render các người dùng xung quanh dưới dạng các Marker tương tác */}
          {filteredUsers.map((user, index) => {
            // Tính toán vị trí tương đối trên Canvas dựa theo lat/lng offset với độ giãn tự nhiên
            const latDiff = (user.location.lat - currentUser.location.lat) * 3200;
            const lngDiff = (user.location.lng - currentUser.location.lng) * 3200;
            const isSelected = selectedUser?.id === user.id;

            const isBuyer = user.role === 'buyer';
            const Icon = isBuyer ? Truck : ShoppingBag;

            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                style={{
                  transform: `translate(${lngDiff}px, ${-latDiff}px)`,
                }}
                className={`absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-125 ${
                  isSelected ? 'scale-125 z-30' : ''
                }`}
              >
                {/* Marker Pin */}
                <div 
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white transition-all ${
                    isBuyer 
                      ? 'bg-sky-600 shadow-sky-500/50' 
                      : 'bg-emerald-600 shadow-emerald-500/50'
                  } ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Nhãn tên & khoảng cách */}
                <div className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md whitespace-nowrap transition-all border ${
                  isSelected 
                    ? 'bg-yellow-400 text-slate-900 border-yellow-500' 
                    : 'bg-slate-900/90 text-white border-slate-700'
                }`}>
                  {user.fullName.split(' ')[0]} • {formatDistance(user.distanceKm)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chú giải bản đồ (Legend) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
              <span>Người Bán</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-sky-600 inline-block" />
              <span>Người Thu Mua (Xe ba gác/Vựa)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Bạn</span>
            </div>
          </div>

          <div className="text-slate-400">
            Nhấn vào điểm trên bản đồ để xem chi tiết & liên hệ
          </div>
        </div>
      </div>

      {/* CHI TIẾT THÀNH VIÊN ĐƯỢC CHỌN (BOTTOM CARD POPUP) */}
      {selectedUser && (
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.fullName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/30"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-base">{selectedUser.fullName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedUser.role === 'buyer' 
                      ? 'bg-sky-100 text-sky-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedUser.role === 'buyer' ? 'Người Thu Mua' : 'Người Bán Ve Chai'}
                  </span>
                  {selectedUser.isPhoneVerified && (
                    <span className="flex items-center gap-0.5 text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Đã xác thực SĐT
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedUser.location.address}</span>
                </p>

                {selectedUser.vehicleType && (
                  <p className="text-xs text-sky-700 mt-1 flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Phương tiện: {selectedUser.vehicleType}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          </div>

          {/* Chỉ số uy tín & Khoảng cách */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Khoảng cách</span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                {formatDistance(selectedUser.distanceKm || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Uy tín</span>
              <span className="font-bold text-amber-600 flex items-center justify-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {selectedUser.reputationScore.toFixed(1)} / 5.0
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Tới trong khoảng</span>
              <span className="font-bold text-emerald-700 text-sm">
                ~{selectedUser.travelMinutes || 10} phút
              </span>
            </div>
          </div>

          {/* Huy hiệu uy tín */}
          <div className="flex flex-wrap gap-1.5">
            {selectedUser.badges.map((badge, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {badge}
              </span>
            ))}
          </div>

          {/* Các nút hành động: Nhắn tin trực tiếp / Gọi điện / Đặt lịch thu gom */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => handleChatWithUser(selectedUser)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Trò chuyện trực tiếp & Thỏa thuận giá</span>
            </button>

            <a
              href={`tel:${selectedUser.phone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{selectedUser.phone}</span>
            </a>
          </div>
        </div>
      )}

      {/* DANH SÁCH NGƯỜI THU MUA & NGƯỜI BÁN GẦN NHẤT (CARD LIST) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>
              {currentUser.role === 'seller'
                ? '1 Người Thu Mua Duy Nhất Gần Bạn (Kích vào để nói chuyện & bán)'
                : currentUser.role === 'admin'
                ? `Tất Cả Thành Viên Toàn Thành Phố (${filteredUsers.length} người mua & bán)`
                : `Danh Sách Người Bán Gần Bạn Trong ${selectedRadiusKm}km (${filteredUsers.length})`}
            </span>
          </h2>

          {currentUser.role === 'seller' && onOpenCreateOrder && (
            <button
              onClick={onOpenCreateOrder}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tạo yêu cầu thu gom</span>
            </button>
          )}
        </div>

        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">Không tìm thấy thành viên nào trong bán kính {selectedRadiusKm}km</p>
            <p className="text-slate-400 text-xs mt-1">Hãy thử tăng bán kính quét lên 10km hoặc 25km để tìm thêm đối tác nhé!</p>
            <button
              onClick={() => setSelectedRadiusKm(25)}
              className="mt-3 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200"
            >
              Mở rộng bán kính lên 25km
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredUsers.map(user => {
              const isBuyer = user.role === 'buyer';
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{user.fullName}</h4>
                        <span className="font-mono text-xs font-bold text-emerald-700 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {formatDistance(user.distanceKm)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded font-semibold ${
                          isBuyer ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isBuyer ? 'Người Thu Mua' : 'Người Bán'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {user.reputationScore.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{user.totalTransactions} đơn</span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        📍 {user.location.address}
                      </p>
                    </div>
                  </div>

                  {/* Nút thao tác nhanh */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatWithUser(user);
                      }}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </button>

                    <a
                      href={`tel:${user.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
