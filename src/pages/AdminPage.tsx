/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Cổng Quản Trị Viên (Admin Portal)
 * - Giám sát vị trí toàn bộ người mua và người bán trên toàn thành phố
 * - Báo cáo hoạt động bất thường & phát hiện gian lận
 * - Phê duyệt định danh KYC thành viên mới
 * - Giải quyết tranh chấp và khiếu nại giữa các bên
 * - Gửi thông báo đẩy toàn hệ thống
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyVND } from '../utils/geo';
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
  FileCheck, 
  TrendingUp,
  Search,
  Flag
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { 
    currentUser, 
    users, 
    orders, 
    disputes, 
    resolveDispute, 
    anomalies, 
    flagUser, 
    verifyUserPhone, 
    broadcastNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'disputes' | 'anomalies' | 'broadcast'>('overview');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Thống kê tổng quan
  const totalWeight = orders.reduce((sum, o) => sum + (o.totalActualWeight || o.totalEstimatedWeight), 0);
  const totalVolumeVND = orders.reduce((sum, o) => sum + (o.finalAmount || o.estimatedValue), 0);

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone.includes(userSearch) ||
    u.location.address.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    broadcastNotification(broadcastTitle.trim(), broadcastMessage.trim(), 'system');
    alert('Đã gửi thông báo đẩy đến toàn bộ người dùng hệ thống!');
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <div className="space-y-4">
      
      {/* Header Quản Trị */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white">
            <ShieldAlert className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Trung Tâm Điều Hành Quản Trị Viên</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Giám sát toàn bộ người mua, người bán, giải quyết tranh chấp và kiểm duyệt
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-semibold text-purple-200 border border-white/20">
          Admin Portal v2.0
        </span>
      </div>

      {/* Tabs điều hướng Quản Trị */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: '📊 Tổng quan thống kê' },
          { id: 'users', label: `👥 Thành viên & Duyệt KYC (${users.length})` },
          { id: 'disputes', label: `⚖️ Giải quyết tranh chấp (${disputes.filter(d => d.status === 'open').length})` },
          { id: 'anomalies', label: `⚠️ Cảnh báo bất thường (${anomalies.filter(a => !a.resolved).length})` },
          { id: 'broadcast', label: '📢 Phát thông báo tự động' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TỔNG QUAN THỐNG KÊ (OVERVIEW) */}
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
                Qua Ví & Tiền mặt an toàn
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

          {/* Bản đồ giám sát tất cả người mua & người bán */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>Bản Đồ Giám Sát Tọa Độ Thành Phố (Tất Cả Người Mua & Người Bán)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Quản trị viên có quyền truy cập toàn bộ tọa độ GPS thời gian thực để ngăn chặn các vị trí ảo
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
                  RADAR GIÁM SÁT TOÀN THÀNH PHỐ HCM
                </span>
                <span className="text-emerald-400 font-bold">
                  ● Đang trực tuyến: {users.filter(u => u.isOnline).length} / {users.length}
                </span>
              </div>

              <div className="relative z-10 py-6 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Hệ thống đang định vị: <strong>{users.filter(u => u.role === 'buyer').length} Người Thu Mua</strong> (Xe ba gác, Vựa phế liệu) và <strong>{users.filter(u => u.role === 'seller').length} Người Bán</strong> (Hộ gia đình, Văn phòng).
                </p>
                <div className="flex justify-center gap-2 flex-wrap text-[11px]">
                  {users.map(u => (
                    <span 
                      key={u.id}
                      className={`px-2 py-0.5 rounded-md font-mono ${
                        u.role === 'buyer' ? 'bg-sky-900/80 text-sky-200 border border-sky-700' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                      }`}
                    >
                      {u.role === 'buyer' ? '🚚' : '🛍️'} {u.fullName.split(' ')[0]} ({u.location.lat.toFixed(3)}, {u.location.lng.toFixed(3)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative z-10 text-[11px] text-slate-400 text-right">
                Bảo mật định vị theo chuẩn GPS AES-256
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THÀNH VIÊN & DUYỆT KYC */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm thành viên theo tên, SĐT, địa chỉ..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredUsers.map(u => (
              <div key={u.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.fullName} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{u.fullName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        u.role === 'buyer' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role === 'buyer' ? 'Người Thu Mua' : 'Người Bán'}
                      </span>
                      {u.isFlagged && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-0.5">
                          <Flag className="w-2.5 h-2.5" /> Bị gắn cờ
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      <span>SĐT: {u.phone}</span> • <span>{u.location.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {u.isPhoneVerified ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">
                      <CheckCircle className="w-3.5 h-3.5" /> Đã Xác Thực SĐT
                    </span>
                  ) : (
                    <button
                      onClick={() => verifyUserPhone(u.id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Xác thực SĐT
                    </button>
                  )}

                  {!u.isFlagged ? (
                    <button
                      onClick={() => {
                        const reason = prompt('Nhập lý do gắn cờ cảnh báo thành viên này:');
                        if (reason) flagUser(u.id, reason);
                      }}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold"
                    >
                      Gắn cờ
                    </button>
                  ) : (
                    <span className="text-rose-600 text-[10px] font-bold">Đã cảnh báo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GIẢI QUYẾT TRANH CHẤP (DISPUTES) */}
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

      {/* TAB 4: CẢNH BÁO BẤT THƯỜNG (ANOMALIES) */}
      {activeTab === 'anomalies' && (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3 animate-in fade-in">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Phát Hiện Hoạt Động Bất Thường (AI Fraud Monitoring)</span>
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
                    Mức độ: {anom.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PHÁT THÔNG BÁO TỰ ĐỘNG */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 max-w-lg animate-in fade-in">
          <h3 className="font-bold text-slate-900 text-sm">Gửi Thông Báo Tự Động / Toàn Hệ Thống</h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tiêu đề thông báo:</label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="VD: Cập nhật giá nhôm lon tuần này..."
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nội dung chi tiết:</label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Nội dung sẽ hiển thị ngay lập tức trên chuông thông báo của tất cả người dùng..."
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <button
            onClick={handleBroadcast}
            disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
            className="w-full py-2.5 bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Phát Thông Báo Toàn Mạng Lưới</span>
          </button>
        </div>
      )}

    </div>
  );
};
