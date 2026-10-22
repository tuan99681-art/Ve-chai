/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Cổng Quản Trị Viên (Admin Portal)
 * - Quản lý thành viên: Xóa người bán và người mua, duyệt SĐT, gắn cờ cảnh báo
 * - Mục tạo thông báo thu gom phế liệu theo từng Tỉnh / Thành Phố cho Quản Trị Viên
 * - Cơ chế tự động gửi tin nhắn trực tiếp vào ChatPage của tất cả thành viên thuộc tỉnh thành đó
 * - Trung tâm phát Thông báo đẩy (Push Notifications) tức thì tới thiết bị người dùng
 * - Giám sát vị trí toàn bộ người mua & người bán trên toàn thành phố
 * - Giải quyết tranh chấp, khiếu nại & cảnh báo bất thường
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyVND, POPULAR_CITIES, isUserInCity } from '../utils/geo';
import { UserProfile, CityAnnouncement } from '../types';
import { 
  ShieldAlert, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Send, 
  Truck, 
  ShoppingBag, 
  Search, 
  Flag,
  Trash2,
  Megaphone,
  Bell,
  PlusCircle,
  Calendar,
  Phone,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Radio,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { 
    currentUser, 
    users, 
    deleteUser,
    orders, 
    disputes, 
    resolveDispute, 
    anomalies, 
    flagUser, 
    verifyUserPhone, 
    broadcastNotification,
    cityAnnouncements,
    addCityAnnouncement,
    updateCityAnnouncement,
    deleteCityAnnouncement,
    toggleCityAnnouncementStatus,
    sendAnnouncementMessagesToCity,
    adminPreviewCity,
    setAdminPreviewCity,
    pushPermission,
    requestPushPermission,
    triggerPushNotification,
    isPushSoundEnabled,
    setIsPushSoundEnabled
  } = useApp();

  const navigate = useNavigate();

  // Tab điều hướng
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'city_announcements' | 'push_notifications' | 'disputes' | 'anomalies'>('users');

  // Bộ lọc Quản lý Thành viên
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'seller' | 'buyer'>('all');
  const [userCityFilter, setUserCityFilter] = useState<string>('all');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Form tạo thông báo Tỉnh / Thành Phố mới
  const [targetCity, setTargetCity] = useState<string>('Hà Nội');
  const [customCity, setCustomCity] = useState<string>('');
  const [annomTitle, setAnnomTitle] = useState<string>('');
  const [annomDistrict, setAnnomDistrict] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('28/10/2026');
  const [contactPhone, setContactPhone] = useState<string>('0909000999');
  const [priceBonus, setPriceBonus] = useState<string>('Cân điện tử chuẩn xác tại chỗ, thu mua giá cao hơn 10%');
  const [annomContent, setAnnomContent] = useState<string>('');
  const [selectedScrapTypes, setSelectedScrapTypes] = useState<string[]>([
    'Nhôm Lon Bia', 'Đồng Cáp Đỏ', 'Nhựa PET/HDPE', 'Sắt Thép', 'Giấy Carton'
  ]);
  const [autoSendChat, setAutoSendChat] = useState<boolean>(true);
  const [autoSendPush, setAutoSendPush] = useState<boolean>(true);

  // Form phát Thông Báo Đẩy tức thì (Push Notification Center)
  const [pushTitle, setPushTitle] = useState<string>('📢 Tin Nóng Từ Ban Quản Trị VeChaiXanh');
  const [pushBody, setPushBody] = useState<string>('Giá thu mua ve chai hôm nay tăng vọt! Hãy mở app để xem người mua gần bạn nhất.');
  const [pushTargetRole, setPushTargetRole] = useState<'all' | 'seller' | 'buyer'>('all');
  const [pushTargetCity, setPushTargetCity] = useState<string>('all');
  const [pushUrgency, setPushUrgency] = useState<'normal' | 'high'>('normal');
  const [pushTargetUrl, setPushTargetUrl] = useState<string>('/chat');

  // Danh mục phế liệu gợi ý
  const availableScrapTypes = [
    'Nhôm Lon Bia', 'Nhôm Xingfa', 'Đồng Cáp Đỏ', 'Đồng Vàng Thau', 
    'Nhựa PET/HDPE', 'Nhựa Gia Dụng', 'Sắt Thép Công Trình', 'Inox 304', 
    'Giấy Carton', 'Giấy Văn Phòng A4', 'Pin & Ắc Quy', 'Bo Mạch Vi Tính'
  ];

  // Thống kê tổng quan
  const totalWeight = orders.reduce((sum, o) => sum + (o.totalActualWeight || o.totalEstimatedWeight), 0);
  const totalVolumeVND = orders.reduce((sum, o) => sum + (o.finalAmount || o.estimatedValue), 0);

  // Lọc danh sách thành viên
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Bỏ qua tài khoản admin chính nếu muốn
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userCityFilter !== 'all' && !isUserInCity(u.location?.city, u.location?.address, userCityFilter)) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          (u.location?.address && u.location.address.toLowerCase().includes(q)) ||
          (u.location?.city && u.location.city.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, userRoleFilter, userCityFilter, userSearch]);

  // Đếm số thành viên tại tỉnh thành đang chọn trong form tạo thông báo
  const effectiveCity = targetCity === 'Khác' ? customCity.trim() : targetCity;
  const targetCityUsersCount = useMemo(() => {
    if (!effectiveCity || effectiveCity === 'Toàn quốc') {
      return users.filter(u => u.role !== 'admin').length;
    }
    return users.filter(u => 
      u.role !== 'admin' && 
      isUserInCity(u.location?.city, u.location?.address, effectiveCity)
    ).length;
  }, [users, effectiveCity]);

  // Xử lý Xóa thành viên
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id);
    if (res.success) {
      setActionSuccessMessage(res.message);
      setTimeout(() => setActionSuccessMessage(null), 4500);
    } else {
      alert(res.message);
    }
    setUserToDelete(null);
  };

  // Xử lý Tạo thông báo tỉnh thành
  const handleCreateCityAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const city = targetCity === 'Khác' ? customCity.trim() : targetCity;
    if (!city) {
      alert('Vui lòng chọn hoặc nhập Tỉnh / Thành Phố mục tiêu.');
      return;
    }
    if (!annomTitle.trim()) {
      alert('Vui lòng nhập tiêu đề thông báo.');
      return;
    }

    const defaultContent = annomContent.trim() || 
      `Ban quản trị thông báo: Đoàn xe thu mua lưu động VeChaiXanh sẽ đến thu mua tận nơi tại ${city} vào ngày ${pickupDate}. Ưu tiên thu gom các loại phế liệu: ${selectedScrapTypes.join(', ')}. ${priceBonus}. Thanh toán tiền mặt trực tiếp dứt điểm tại nhà!`;

    const newAnnom = addCityAnnouncement({
      title: annomTitle.trim(),
      content: defaultContent,
      city,
      district: annomDistrict.trim() || undefined,
      pickupDate: pickupDate.trim(),
      contactPhone: contactPhone.trim(),
      scrapTypes: selectedScrapTypes,
      priceBonus: priceBonus.trim() || undefined,
      authorName: 'Ban Quản Trị VeChaiXanh',
      isActive: true,
      sendDirectMessage: autoSendChat
    });

    setActionSuccessMessage(
      `🎉 Đã xuất bản thông báo cho "${city}" thành công! ${autoSendChat ? `Đã tự động gửi tin nhắn trực tiếp vào ChatPage của các thành viên tại ${city}.` : ''}`
    );
    setTimeout(() => setActionSuccessMessage(null), 5000);

    // Reset form
    setAnnomTitle('');
    setAnnomDistrict('');
    setAnnomContent('');
  };

  // Xử lý gửi lại tin nhắn cho thông báo tỉnh thành
  const handleResendChat = (annom: CityAnnouncement) => {
    const count = sendAnnouncementMessagesToCity(annom.id);
    setActionSuccessMessage(`Đã gửi lại tin nhắn thông báo đến ${count} thành viên tại ${annom.city}!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Xử lý Phát Thông Báo Đẩy tức thì
  const handleSendInstantPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo đẩy.');
      return;
    }

    triggerPushNotification(
      pushTitle.trim(),
      pushBody.trim(),
      pushTargetUrl,
      pushTargetCity === 'all' ? undefined : pushTargetCity,
      pushTargetRole,
      pushUrgency
    );

    setActionSuccessMessage('🚀 Đã phát thông báo đẩy tức thì đến toàn bộ thành viên kết nối!');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-4">
      
      {/* Header Quản Trị */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-purple-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20 shadow-md">
            <ShieldAlert className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Trung Tâm Điều Hành Quản Trị Viên</h1>
              <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full text-[10px] font-mono font-bold">
                Trung Tâm Quản Trị
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Xóa người bán/mua, phát thông báo thu mua tỉnh thành, tự động gửi tin nhắn Chat & thông báo đẩy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pushPermission !== 'granted' && pushPermission !== 'unsupported' && (
            <button
              onClick={requestPushPermission}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Bật Push Trình Duyệt</span>
            </button>
          )}

          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-semibold text-purple-200 border border-white/20">
            {users.length} Thành viên
          </span>
        </div>
      </div>

      {/* Thông báo kết quả thao tác thành công */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex-1">{actionSuccessMessage}</span>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs điều hướng Quản Trị */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'users', label: `👥 Quản lý Thành viên (${users.length})` },
          { id: 'city_announcements', label: `📢 Thông báo Tỉnh/Thành & Chat (${cityAnnouncements.length})` },
          { id: 'push_notifications', label: '🔔 Trung tâm Thông báo đẩy' },
          { id: 'overview', label: '📊 Tổng quan thống kê & Radar' },
          { id: 'disputes', label: `⚖️ Tranh chấp (${disputes.filter(d => d.status === 'open').length})` },
          { id: 'anomalies', label: `⚠️ Cảnh báo bất thường (${anomalies.filter(a => !a.resolved).length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUẢN LÝ THÀNH VIÊN (XÓA NGƯỜI BÁN & NGƯỜI MUA) */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-3 animate-in fade-in">
          
          {/* Thanh công cụ tìm kiếm và bộ lọc vai trò / tỉnh thành */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm kiếm theo họ tên, số điện thoại, địa chỉ, tỉnh thành..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              {/* Lọc vai trò: Tất cả, Người Bán, Người Mua */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    userRoleFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({users.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('seller')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    userRoleFilter === 'seller'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Người Bán ({users.filter(u => u.role === 'seller').length})</span>
                </button>
                <button
                  onClick={() => setUserRoleFilter('buyer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    userRoleFilter === 'buyer'
                      ? 'bg-sky-600 text-white'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Người Mua ({users.filter(u => u.role === 'buyer').length})</span>
                </button>
              </div>
            </div>

            {/* Lọc theo Tỉnh / Thành Phố */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                Lọc tỉnh thành:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {['all', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương'].map(city => (
                  <button
                    key={city}
                    onClick={() => setUserCityFilter(city)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                      userCityFilter === city
                        ? 'bg-purple-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {city === 'all' ? 'Tất cả các tỉnh' : city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Danh sách thành viên (Card list với nút Xóa nổi bật) */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                <span>Danh Sách Người Bán & Người Mua ({filteredUsers.length} thành viên)</span>
              </h3>
              <span className="text-slate-400 text-xs">
                Quản trị viên có toàn quyền kiểm duyệt và xóa thành viên vi phạm
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Không tìm thấy thành viên nào phù hợp với bộ lọc hiện tại.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const isAdmin = u.role === 'admin' || u.id === 'usr-admin-01';
                  const isBuyer = u.role === 'buyer';

                  return (
                    <div 
                      key={u.id}
                      className="py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs hover:bg-slate-50/70 p-2 rounded-2xl transition-colors"
                    >
                      {/* Cột thông tin thành viên */}
                      <div className="flex items-start gap-3 min-w-0">
                        <img 
                          src={u.avatar} 
                          alt={u.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                        />

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{u.fullName}</span>
                            
                            {/* Role badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : isBuyer 
                                ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isAdmin ? '🛡️ Quản Trị Viên' : isBuyer ? '🚚 Người Thu Mua' : '🛍️ Người Bán'}
                            </span>

                            {/* Tỉnh thành */}
                            {u.location?.city && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200">
                                📍 {u.location.city}
                              </span>
                            )}

                            {u.isFlagged && (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-0.5">
                                <Flag className="w-2.5 h-2.5" /> Bị gắn cờ: {u.flagReason}
                              </span>
                            )}
                          </div>

                          <div className="text-slate-500 text-[11px] flex items-center gap-2 flex-wrap">
                            <span>SĐT: <strong className="text-slate-800 font-mono">{u.phone}</strong></span>
                            <span>•</span>
                            <span className="truncate max-w-xs">{u.location?.address}</span>
                            <span>•</span>
                            <span>Tham gia: {u.createdAt}</span>
                          </div>

                          {/* Huy hiệu & phương tiện */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold">
                              ⭐ {u.reputationScore.toFixed(1)} ({u.totalTransactions} đơn)
                            </span>
                            {u.vehicleType && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                                🚗 {u.vehicleType}
                              </span>
                            )}
                            {u.isPhoneVerified && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-0.5">
                                <CheckCircle className="w-2.5 h-2.5" /> Đã xác thực SĐT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cột thao tác: Xác thực, Gắn cờ, XÓA THÀNH VIÊN */}
                      <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                        {/* Xác thực SĐT */}
                        {!u.isPhoneVerified ? (
                          <button
                            onClick={() => verifyUserPhone(u.id, true)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Xác thực SĐT
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px] px-2 py-1 bg-emerald-50 rounded-lg">
                            ✓ Đã xác thực
                          </span>
                        )}

                        {/* Gắn cờ */}
                        {!isAdmin && (
                          <button
                            onClick={() => {
                              const reason = prompt(`Nhập lý do gắn cờ cảnh báo cho "${u.fullName}":`);
                              if (reason) flagUser(u.id, reason);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-xl text-xs font-medium transition-colors"
                            title="Cảnh báo hoạt động bất thường"
                          >
                            Gắn cờ
                          </button>
                        )}

                        {/* NÚT XÓA THÀNH VIÊN (NGƯỜI BÁN VÀ NGƯỜI MUA) */}
                        {!isAdmin ? (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200 hover:border-rose-600 transition-all shadow-2xs group"
                            title="Xóa vĩnh viễn thành viên này"
                          >
                            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>Xóa</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono px-2 py-1 bg-slate-100 rounded-lg">
                            Tài Khoản Quản Trị
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MỤC TẠO THÔNG BÁO CHO QUẢN TRỊ VIÊN & GỬI TIN NHẮN TỈNH THÀNH */}
      {/* ============================================================== */}
      {activeTab === 'city_announcements' && (
        <div className="space-y-4 animate-in fade-in">
          
          {/* Form Tạo thông báo tỉnh thành mới */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Megaphone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Mục Tạo Thông Báo Thu Mua Cho Từng Tỉnh / Thành Phố
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phát hành thông báo chạy chữ trên trang chính & Tự động gửi tin nhắn đến ChatPage của cư dân tỉnh đó
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-bold">
                BQT VeChaiXanh
              </span>
            </div>

            <form onSubmit={handleCreateCityAnnouncement} className="space-y-4 text-xs">
              
              {/* Chọn Tỉnh / Thành Phố mục tiêu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    1. Chọn Tỉnh / Thành Phố Thu Mua: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500/20"
                  >
                    {POPULAR_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Khác">Tỉnh thành khác (Tự nhập tay)...</option>
                  </select>
                </div>

                {targetCity === 'Khác' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nhập tên Tỉnh / Thành: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="VD: Huế, Nha Trang, Vĩnh Long..."
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Số thành viên tiếp cận dự kiến:
                    </label>
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-bold flex items-center justify-between">
                      <span>👥 Đã đăng ký tại {effectiveCity}:</span>
                      <span className="font-mono text-sm">{targetCityUsersCount} thành viên</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tiêu đề & Ngày thu mua */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    2. Tiêu đề thông báo chạy chữ (Trang chính): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={annomTitle}
                    onChange={(e) => setAnnomTitle(e.target.value)}
                    placeholder="VD: Đoàn xe thu mua ve chai lưu động sẽ đến Cầu Giấy vào ngày 28/10/2026!"
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    3. Ngày đoàn xe đến thu mua: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    placeholder="VD: 28/10/2026 hoặc Cuối tuần này"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Quận / Huyện & Hotline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    4. Địa bàn / Quận Huyện trọng điểm:
                  </label>
                  <input
                    type="text"
                    value={annomDistrict}
                    onChange={(e) => setAnnomDistrict(e.target.value)}
                    placeholder="VD: Quận Cầu Giấy, Ba Đình, Đống Đa..."
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    5. Hotline điều phối đoàn xe: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0909000999"
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Mặt hàng ve chai ưu tiên */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  6. Các loại phế liệu ưu tiên thu gom đợt này:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableScrapTypes.map(item => {
                    const isChecked = selectedScrapTypes.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedScrapTypes(prev => prev.filter(t => t !== item));
                          } else {
                            setSelectedScrapTypes(prev => [...prev, item]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          isChecked 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chính sách ưu đãi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  7. Chính sách ưu đãi đặc biệt:
                </label>
                <input
                  type="text"
                  value={priceBonus}
                  onChange={(e) => setPriceBonus(e.target.value)}
                  placeholder="VD: Thu mua giá cao hơn thị trường 10% - Cân điện tử chuẩn xác tại chỗ"
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              {/* Nội dung chi tiết tùy chọn */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  8. Nội dung chi tiết thông báo (Gửi vào tin nhắn Chat):
                </label>
                <textarea
                  rows={3}
                  value={annomContent}
                  onChange={(e) => setAnnomContent(e.target.value)}
                  placeholder="Để trống sẽ tự động dùng mẫu tiêu chuẩn của Ban Quản Trị..."
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              {/* CÁC TÙY CHỌN TỰ ĐỘNG HÓA */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
                <span className="font-bold text-purple-950 block text-xs">
                  Cơ Chế Tự Động Hóa Phát Thông Báo:
                </span>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-900">
                  <input
                    type="checkbox"
                    checked={autoSendChat}
                    onChange={(e) => setAutoSendChat(e.target.checked)}
                    className="rounded text-purple-700 w-4 h-4"
                  />
                  <span>
                    ⚡ <strong>Tự động thêm mục tin nhắn vào ChatPage</strong> của tất cả người dùng có hồ sơ đăng ký tại {effectiveCity} ({targetCityUsersCount} thành viên).
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-900">
                  <input
                    type="checkbox"
                    checked={autoSendPush}
                    onChange={(e) => setAutoSendPush(e.target.checked)}
                    className="rounded text-purple-700 w-4 h-4"
                  />
                  <span>
                    🔔 Bắn <strong>Thông Báo Đẩy (Push Notification)</strong> tức thì lên màn hình thiết bị của người dùng.
                  </span>
                </label>
              </div>

              {/* Nút hành động */}
              <button
                type="submit"
                className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Xuất Bản Thông Báo & Gửi Tin Nhắn Hàng Loạt Đến {effectiveCity}</span>
              </button>
            </form>
          </div>

          {/* Danh sách các thông báo Tỉnh / Thành Phố đã tạo */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>Danh Sách Thông Báo Tỉnh/Thành Đã Tạo ({cityAnnouncements.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {cityAnnouncements.map(annom => (
                <div 
                  key={annom.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                    annom.isActive 
                      ? 'bg-slate-50 border-emerald-300' 
                      : 'bg-slate-100/60 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                          📍 {annom.city}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          🗓️ Ngày đến: <strong>{annom.pickupDate}</strong>
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          annom.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}>
                          {annom.isActive ? 'Đang chạy chữ trang chính' : 'Đã tạm tắt'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{annom.title}</h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleCityAnnouncementStatus(annom.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          annom.isActive ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {annom.isActive ? 'Tạm ẩn' : 'Bật lại'}
                      </button>

                      <button
                        onClick={() => deleteCityAnnouncement(annom.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa thông báo này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                    {annom.content}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] flex-wrap">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>Hotline: <strong className="font-mono text-slate-700">{annom.contactPhone}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">
                        📨 Đã gửi tin nhắn đến: {annom.recipientCount || 0} thành viên
                      </span>
                    </div>

                    <button
                      onClick={() => handleResendChat(annom)}
                      className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3 text-purple-700" />
                      <span>Gửi lại tin nhắn vào Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRUNG TÂM PHÁT THÔNG BÁO ĐẨY TỨC THÌ (PUSH NOTIFICATIONS) */}
      {/* ============================================================== */}
      {activeTab === 'push_notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in">
          
          {/* Cột Trái: Form tạo thông báo đẩy */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 text-purple-600 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Trung Tâm Phát Thông Báo Đẩy</h3>
                  <p className="text-xs text-slate-500">Gửi thông báo nổi thời gian thực kèm chuông âm thanh</p>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-mono">
                Thông Báo Đẩy Trực Tiếp
              </span>
            </div>

            <form onSubmit={handleSendInstantPush} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đối tượng nhận thông báo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Tất cả mọi người' },
                    { id: 'seller', label: 'Chỉ Người Bán' },
                    { id: 'buyer', label: 'Chỉ Người Mua' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPushTargetRole(item.id as any)}
                      className={`p-2 rounded-xl text-center font-semibold transition-all border ${
                        pushTargetRole === item.id 
                          ? 'bg-purple-900 text-white border-purple-900 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Khu vực Tỉnh / Thành Phố áp dụng:
                </label>
                <select
                  value={pushTargetCity}
                  onChange={(e) => setPushTargetCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold"
                >
                  <option value="all">Toàn quốc (Tất cả tỉnh thành)</option>
                  {POPULAR_CITIES.filter(c => c !== 'Toàn quốc').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tiêu đề thông báo đẩy: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="VD: Cập nhật giá thu mua phế liệu hôm nay..."
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nội dung thông báo: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  placeholder="Nội dung sẽ hiện trên banner đẩy và thanh thông báo của thiết bị..."
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức độ ưu tiên:</label>
                  <select
                    value={pushUrgency}
                    onChange={(e) => setPushUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs"
                  >
                    <option value="normal">Thông thường (Xanh lá)</option>
                    <option value="high">Khẩn cấp / Đặc biệt (Đỏ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đường dẫn khi nhấn:</label>
                  <select
                    value={pushTargetUrl}
                    onChange={(e) => setPushTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-mono"
                  >
                    <option value="/chat">Hộp thư Chat (/chat)</option>
                    <option value="/prices">Bảng giá phế liệu (/prices)</option>
                    <option value="/orders">Đơn hàng thu gom (/orders)</option>
                    <option value="/">Trang bản đồ chính (/)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>🚀 Phát Thông Báo Đẩy Tức Thì</span>
              </button>
            </form>
          </div>

          {/* Cột Phải: Xem trước giao diện thông báo đẩy trên điện thoại */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  📱 BẢN XEM TRƯỚC THÔNG BÁO ĐẨY
                </span>
                <span className="text-[10px] text-slate-400">Khung thông báo nổi</span>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 shadow-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300">VeChaiXanh • Vừa xong</span>
                  </div>
                  {pushTargetCity !== 'all' && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-emerald-200 font-mono">
                      📍 {pushTargetCity}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-white">{pushTitle}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2 rounded-xl">
                  {pushBody}
                </p>

                <div className="flex justify-end pt-1">
                  <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold">
                    Nhấn để xem ngay →
                  </span>
                </div>
              </div>
            </div>

            {/* Trạng thái quyền thông báo Web Notification */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Quyền Web Notification trình duyệt:</span>
                <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                  pushPermission === 'granted' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {pushPermission === 'granted' ? 'ĐÃ CẤP QUYỀN' : pushPermission === 'denied' ? 'BỊ TỪ CHỐI' : 'CHƯA CẤP QUYỀN'}
                </span>
              </div>

              {pushPermission !== 'granted' && (
                <button
                  onClick={requestPushPermission}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Yêu Cầu Cấp Quyền Đẩy Trình Duyệt Ngay
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: TỔNG QUAN THỐNG KÊ (OVERVIEW & RADAR TOÀN THÀNH PHỐ) */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block">Tổng thành viên</span>
              <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                {users.length}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {users.filter(u => u.role === 'buyer').length} người mua • {users.filter(u => u.role === 'seller').length} người bán
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block">Phế liệu đã thu hồi</span>
              <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1 block">
                {totalWeight.toFixed(1)} kg
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                Tương đương ~{(totalWeight * 1.5).toFixed(0)} kg CO2 giảm phát thải
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block">Doanh số giao dịch</span>
              <span className="text-xl font-extrabold text-sky-700 font-mono mt-1 block">
                {formatCurrencyVND(totalVolumeVND)}
              </span>
              <span className="text-[11px] text-sky-600 font-semibold mt-1 block">
                Tiền mặt & Chuyển khoản trực tiếp
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block">Đơn thu gom</span>
              <span className="text-2xl font-extrabold text-purple-700 font-mono mt-1 block">
                {orders.length}
              </span>
              <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
                {orders.filter(o => o.status === 'completed').length} đơn hoàn tất 100%
              </span>
            </div>
          </div>

          {/* Bản đồ radar giám sát GPS */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Bản Đồ Giám Sát Tọa Độ GPS (Tất Cả Người Mua & Người Bán)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Quản trị viên có quyền truy cập toàn bộ tọa độ GPS thời gian thực để chống gian lận
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-4 text-white min-h-[220px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />

              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800 text-purple-300 font-mono font-bold">
                  RADAR GIÁM SÁT THỜI GIAN THỰC
                </span>
                <span className="text-emerald-400 font-bold">
                  ● Đang trực tuyến: {users.filter(u => u.isOnline).length} / {users.length}
                </span>
              </div>

              <div className="relative z-10 py-6 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Hệ thống đang định vị: <strong>{users.filter(u => u.role === 'buyer').length} Người Thu Mua</strong> và <strong>{users.filter(u => u.role === 'seller').length} Người Bán</strong>.
                </p>
                <div className="flex justify-center gap-2 flex-wrap text-[11px]">
                  {users.map(u => (
                    <span 
                      key={u.id}
                      className={`px-2 py-0.5 rounded-md font-mono ${
                        u.role === 'buyer' ? 'bg-sky-900/80 text-sky-200 border border-sky-700' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      {u.role === 'buyer' ? '🚚' : '🛍️'} {u.fullName.split(' ')[0]} ({u.location?.lat.toFixed(2)}, {u.location?.lng.toFixed(2)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 text-[11px] text-slate-400 text-right">
                Được bảo vệ mã hóa AES-256 GPS
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: GIẢI QUYẾT TRANH CHẤP (DISPUTES) */}
      {/* ============================================================== */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 animate-in fade-in">
          <h3 className="font-bold text-slate-900 text-sm">Danh Sách Tranh Chấp & Khiếu Nại Cần Xử Lý</h3>

          {disputes.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-8">Không có tranh chấp nào</p>
          ) : (
            <div className="space-y-3">
              {disputes.map(d => (
                <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Khiếu nại: #{d.id} (Đơn #{d.orderId})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {d.status === 'open' ? 'Đang chờ xử lý' : 'Đã giải quyết'}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    <strong>Người khiếu nại:</strong> {d.reporterName} ({d.reporterRole === 'seller' ? 'Người bán' : 'Người mua'}) phản ánh đối tác: <strong>{d.accusedName}</strong>.
                  </p>
                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    "{d.reasonText}"
                  </p>

                  {d.status === 'open' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          const note = prompt('Ghi chú kết luận giải quyết tranh chấp:');
                          if (note) resolveDispute(d.id, note, 'resolved');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                      >
                        Xác Nhận Giải Quyết Thỏa Đáng
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CẢNH BÁO BẤT THƯỜNG (ANOMALIES) */}
      {/* ============================================================== */}
      {activeTab === 'anomalies' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 animate-in fade-in">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Phát Hiện Hoạt Động Bất Thường (Giám Sát Gian Lận AI)</span>
          </h3>

          <div className="space-y-2.5">
            {anomalies.map(anom => (
              <div key={anom.id} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">{anom.userName}</span>
                  <span className="text-[10px] text-amber-700 font-mono">{anom.timestamp}</span>
                </div>
                <p className="text-slate-700">{anom.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-bold">
                    Mức độ: {anom.severity === 'high' ? 'CAO' : anom.severity === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL XÁC NHẬN XÓA THÀNH VIÊN (NGƯỜI BÁN / NGƯỜI MUA) */}
      {/* ============================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Xác Nhận Xóa Tài Khoản?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p>
                <strong>Họ tên:</strong> {userToDelete.fullName}
              </p>
              <p>
                <strong>Vai trò:</strong> {userToDelete.role === 'buyer' ? 'Người Thu Mua' : 'Người Bán'}
              </p>
              <p>
                <strong>Số điện thoại:</strong> {userToDelete.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {userToDelete.location?.address}
              </p>
              <p className="text-rose-600 pt-1 text-[11px] font-medium">
                ⚠️ Tất cả các đơn thu gom đang chờ của thành viên này sẽ được tự động hủy bỏ.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Xác Nhận Xóa Vĩnh Viễn
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
