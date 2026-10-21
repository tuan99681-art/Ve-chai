/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Quản Lý & Lịch Sử Đơn Hàng (Orders Page)
 * Dành cho cả Người Bán và Người Thu Mua:
 * - Tạo đơn yêu cầu thu gom phế liệu mới
 * - Tiếp nhận đơn thu gom lưu động
 * - Cập nhật tiến độ: Đang chờ -> Đã nhận -> Đã cân -> Hoàn thành
 * - Tích hợp thanh toán ví điện tử & Đánh giá uy tín
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrapOrder, OrderStatus } from '../types';
import { formatCurrencyVND } from '../utils/geo';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Scale, 
  Wallet, 
  Star, 
  Truck, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC<{ 
  onOpenCreateOrder: () => void;
  onOpenReviewModal: (order: ScrapOrder) => void;
}> = ({ onOpenCreateOrder, onOpenReviewModal }) => {
  const { 
    currentUser, 
    orders, 
    acceptOrder, 
    updateOrderStatus, 
    cancelOrder, 
    confirmDirectPayment,
    startOrGetConversation 
  } = useApp();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [selectedOrderForWeighing, setSelectedOrderForWeighing] = useState<ScrapOrder | null>(null);
  const [actualWeightInput, setActualWeightInput] = useState<string>('');
  const [finalAmountInput, setFinalAmountInput] = useState<string>('');

  // Lọc đơn hàng dựa theo vai trò của người dùng
  const filteredOrders = orders.filter(order => {
    // 1. Phân quyền xem đơn
    if (currentUser.role === 'seller') {
      if (order.sellerId !== currentUser.id) return false;
    } else if (currentUser.role === 'buyer') {
      // Người mua thấy đơn mình đã nhận HOẶC đơn đang chờ (pending) trong khu vực để nhận
      const isMyOrder = order.buyerId === currentUser.id;
      const isAvailablePending = order.status === 'pending';
      if (!isMyOrder && !isAvailablePending) return false;
    }
    // Admin thấy tất cả đơn hàng

    // 2. Lọc theo tab trạng thái
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'accepted') return order.status === 'accepted' || order.status === 'arrived';
    if (activeTab === 'completed') return order.status === 'completed';

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ Thu Gom', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock };
      case 'accepted':
        return { label: 'Đã Tiếp Nhận', bg: 'bg-sky-100 text-sky-800 border-sky-300', icon: Truck };
      case 'arrived':
        return { label: 'Đang Phân Loại Cân', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: Scale };
      case 'completed':
        return { label: 'Đã Hoàn Tất', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Đã Hủy', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: Clock };
    }
  };

  // Mở chat với đối tác của đơn hàng
  const handleChat = (order: ScrapOrder) => {
    const targetUserId = currentUser.role === 'seller' ? order.buyerId : order.sellerId;
    if (targetUserId) {
      startOrGetConversation(targetUserId, order.id);
      navigate('/chat');
    }
  };

  // Xác nhận cân xong và chốt số tiền
  const handleConfirmWeighing = () => {
    if (!selectedOrderForWeighing) return;
    const weight = parseFloat(actualWeightInput) || selectedOrderForWeighing.totalEstimatedWeight;
    const amount = parseFloat(finalAmountInput) || selectedOrderForWeighing.estimatedValue;

    updateOrderStatus(selectedOrderForWeighing.id, 'completed', weight, amount);
    setSelectedOrderForWeighing(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Tiêu đề & Nút Tạo Đơn Mới */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <span>Quản Lý Đơn Thu Gom Ve Chai</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'seller' 
              ? 'Theo dõi lịch hẹn và thanh toán các đơn phế liệu bạn đã tạo'
              : currentUser.role === 'buyer'
              ? 'Nhận đơn thu gom xung quanh và cập nhật cân phế liệu thực tế'
              : 'Toàn bộ đơn hàng trên hệ thống VeChaiXanh'}
          </p>
        </div>

        {/* Nút Tạo Yêu Cầu Thu Gom (chỉ hiển thị cho Người Bán hoặc Admin) */}
        {(currentUser.role === 'seller' || currentUser.role === 'admin') && (
          <button
            onClick={onOpenCreateOrder}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Thu Gom Mới</span>
          </button>
        )}
      </div>

      {/* Bộ Lọc Trạng Thái Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ thu gom' },
          { id: 'accepted', label: 'Đang xử lý' },
          { id: 'completed', label: 'Hoàn thành' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Chưa có đơn hàng nào trong mục này</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {currentUser.role === 'seller' 
              ? 'Bạn chưa tạo đơn phế liệu nào. Hãy bấm "Tạo Đơn Thu Gom Mới" để người mua lân cận đến tận nhà!'
              : 'Hiện chưa có đơn thu gom mới phù hợp. Hãy bật bản đồ để quét khu vực lân cận.'}
          </p>
          {currentUser.role === 'seller' && (
            <button
              onClick={onOpenCreateOrder}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Tạo đơn ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;
            const isSeller = currentUser.role === 'seller';
            const isBuyer = currentUser.role === 'buyer';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-3"
              >
                {/* Header đơn: Mã đơn, Thời gian tạo, Trạng thái */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-slate-800">#{order.id}</span>
                    <span className="text-[11px] text-slate-400">• {order.createdAt}</span>
                  </div>

                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {badge.label}
                  </span>
                </div>

                {/* Danh sách các mặt hàng phế liệu trong đơn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mặt hàng thu gom:</span>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <span className="font-medium text-slate-800 truncate mr-2">
                            • {item.subItemName}
                          </span>
                          <span className="font-mono text-slate-600 shrink-0">
                            {item.estimatedWeight} kg
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100/80">
                        💬 Ghi chú: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Thông tin đối tác & Thời gian hẹn */}
                  <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Địa điểm thu gom:</span>
                      <span className="font-semibold text-slate-800 line-clamp-2">📍 {order.sellerLocation.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Lịch hẹn thu gom:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {order.pickupScheduledAt}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] block">Khối lượng ước tính:</span>
                        <span className="font-bold text-slate-800 font-mono text-sm">
                          {order.totalActualWeight ? `${order.totalActualWeight} kg (Thực tế)` : `${order.totalEstimatedWeight} kg`}
                        </span>
                      </div>
                    </div>

                    {/* Đối tác giao dịch */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={isSeller ? (order.buyerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150') : order.sellerAvatar} 
                          alt="Đối tác" 
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block">
                            {isSeller ? 'Người thu mua:' : 'Người bán:'}
                          </span>
                          <span className="font-bold text-slate-800 truncate block text-[11px]">
                            {isSeller ? (order.buyerName || 'Đang chờ người nhận...') : order.sellerName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Tổng tiền:</span>
                        <span className="font-extrabold text-emerald-700 font-mono text-sm">
                          {formatCurrencyVND(order.finalAmount || order.estimatedValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút hành động theo trạng thái & vai trò */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  
                  {/* NGƯỜI THU MUA: Nút nhận đơn thu gom nếu đơn còn pending */}
                  {isBuyer && order.status === 'pending' && (
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Nhận Thu Gom Đơn Này Ngay</span>
                    </button>
                  )}

                  {/* NGƯỜI THU MUA: Nhập cân thực tế & Hoàn tất */}
                  {isBuyer && order.buyerId === currentUser.id && order.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setSelectedOrderForWeighing(order);
                        setActualWeightInput(order.totalEstimatedWeight.toString());
                        setFinalAmountInput(order.estimatedValue.toString());
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Đã Đến Nơi & Cân Phế Liệu</span>
                    </button>
                  )}

                  {/* Nút Trò chuyện trực tiếp */}
                  {(order.buyerId || currentUser.role === 'admin') && (
                    <button
                      onClick={() => handleChat(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </button>
                  )}

                  {/* Hai bên tự thanh toán trực tiếp với nhau (tiền mặt hoặc chuyển khoản) */}
                  {order.status === 'accepted' && order.paymentStatus === 'unpaid' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => confirmDirectPayment(order.id, 'cash')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Đã Trả Tiền Mặt Xong</span>
                      </button>
                      <button
                        onClick={() => confirmDirectPayment(order.id, 'direct_bank')}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>Đã Chuyển Khoản Trực Tiếp</span>
                      </button>
                    </div>
                  )}

                  {/* Nút Đánh giá Uy Tín (khi đơn hoàn tất) */}
                  {order.status === 'completed' && (
                    <button
                      onClick={() => onOpenReviewModal(order)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Đánh Giá Uy Tín</span>
                    </button>
                  )}

                  {/* Nút Hủy Đơn */}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn hủy đơn thu gom này?')) {
                          cancelOrder(order.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP NHẬP CÂN THỰC TẾ & CHỐT TIỀN (DÀNH CHO NGƯỜI THU MUA) */}
      {selectedOrderForWeighing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Xác Nhận Khối Lượng Cân Thực Tế</h3>
                  <p className="text-xs text-slate-500">Đơn #{selectedOrderForWeighing.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForWeighing(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tổng khối lượng cân thực tế (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={actualWeightInput}
                  onChange={(e) => setActualWeightInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-base font-bold text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tổng số tiền thanh toán (VNĐ):
                </label>
                <input
                  type="number"
                  step="1000"
                  value={finalAmountInput}
                  onChange={(e) => setFinalAmountInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-base font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed space-y-1">
                <p>ℹ️ Hai bên tự thanh toán trực tiếp với nhau dứt điểm bằng tiền mặt hoặc chuyển khoản tại chỗ.</p>
                <p className="text-emerald-700 font-semibold">🔒 Khi hoàn tất giao dịch, hệ thống sẽ tự động ẩn vị trí của người bán trên bản đồ người mua để bảo vệ quyền riêng tư.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setSelectedOrderForWeighing(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmWeighing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
              >
                Hoàn tất & Xuất Biên Nhận
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
