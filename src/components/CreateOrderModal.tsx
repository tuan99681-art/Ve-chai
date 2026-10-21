/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Hộp Thoại Tạo Yêu Cầu Thu Gom Ve Chai Mới (Create Scrap Order Modal)
 * Cho phép Người Bán:
 * - Chọn phân loại ve chai và khối lượng ước tính (kg)
 * - Tự động tính toán số tiền ước tính theo đơn giá thị trường
 * - Định vị địa chỉ thu gom và chọn lịch hẹn cụ thể
 * - Gửi ảnh và ghi chú cho người thu gom
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyVND } from '../utils/geo';
import { 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Scale, 
  X, 
  Plus, 
  Trash2, 
  Camera, 
  Clock,
  Sparkles
} from 'lucide-react';

export const CreateOrderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, categories, createOrder } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || 'cat-plastic');
  const [selectedSubId, setSelectedSubId] = useState<string>(categories[0]?.subItems[0]?.id || '');
  const [estimatedKg, setEstimatedKg] = useState<number>(15);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const [pickupDate, setPickupDate] = useState('2026-10-21 16:30');
  const [pickupAddress, setPickupAddress] = useState(currentUser.location.address);
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'direct_bank'>('cash');

  if (!isOpen) return null;

  const currentCategory = categories.find(c => c.id === selectedCatId) || categories[0];
  const currentSubItem = currentCategory?.subItems.find(s => s.id === selectedSubId) || currentCategory?.subItems[0];

  // Thêm mặt hàng vào danh sách gom
  const handleAddItem = () => {
    if (!currentSubItem || estimatedKg <= 0) return;

    const unitPrice = currentSubItem.currentPrice;
    const totalPrice = Math.round(unitPrice * estimatedKg);

    setOrderItems(prev => [
      ...prev,
      {
        categoryId: currentCategory.id,
        categoryName: currentCategory.name,
        subItemId: currentSubItem.id,
        subItemName: currentSubItem.name,
        estimatedWeight: estimatedKg,
        unitPrice,
        totalPrice
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  // Tính tổng
  const totalWeight = orderItems.reduce((sum, item) => sum + item.estimatedWeight, 0);
  const totalValue = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng ve chai vào đơn!');
      return;
    }

    createOrder({
      items: orderItems,
      totalEstimatedWeight: totalWeight,
      estimatedValue: totalValue,
      images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500'],
      notes: orderNotes.trim() || 'Ve chai đã gom sẵn trong bao, ghé thu gom nhé!',
      pickupScheduledAt: pickupDate,
      paymentMethod,
      address: pickupAddress
    });

    onClose();
    setOrderItems([]);
    setOrderNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Tạo Yêu Cầu Thu Gom Ve Chai</h2>
              <p className="text-xs text-slate-500">Người mua gần nhất sẽ nhận đơn và đến thu gom</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHẦN 1: CHỌN MẶT HÀNG VE CHAI */}
        <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-700 block flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chọn loại ve chai & ước tính khối lượng:</span>
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Danh mục chính:</label>
              <select
                value={selectedCatId}
                onChange={(e) => {
                  setSelectedCatId(e.target.value);
                  const cat = categories.find(c => c.id === e.target.value);
                  if (cat && cat.subItems.length > 0) {
                    setSelectedSubId(cat.subItems[0].id);
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Phân loại chi tiết:</label>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {currentCategory?.subItems.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[11px] text-slate-500 block mb-1">Khối lượng ước tính (kg):</label>
              <input
                type="number"
                step="1"
                min="1"
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div className="flex-1 text-right">
              <span className="text-[11px] text-slate-500 block mb-1">Giá thu mua thị trường:</span>
              <span className="font-mono text-xs font-bold text-emerald-700">
                {formatCurrencyVND(currentSubItem?.currentPrice || 0)} / kg
              </span>
            </div>

            <button
              onClick={handleAddItem}
              className="mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs self-end"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </div>
        </div>

        {/* DANH SÁCH MẶT HÀNG ĐÃ THÊM VÀO ĐƠN */}
        {orderItems.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">Các loại ve chai trong đơn:</span>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-800">{item.subItemName}</span>
                    <span className="text-slate-400 block text-[10px]">
                      {item.estimatedWeight} kg × {item.unitPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-emerald-700">
                      {formatCurrencyVND(item.totalPrice)}
                    </span>
                    <button onClick={() => handleRemoveItem(idx)} className="text-slate-400 hover:text-rose-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tổng cộng */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900">
                Tổng cộng: {totalWeight} kg
              </span>
              <span className="font-extrabold text-emerald-800 font-mono text-sm">
                Ước tính: {formatCurrencyVND(totalValue)}
              </span>
            </div>
          </div>
        )}

        {/* THỜI GIAN & ĐỊA ĐIỂM HẸN THU GOM */}
        <div className="space-y-2 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Địa chỉ lấy hàng tận nơi:
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lịch hẹn thu gom:</label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phương thức thanh toán:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              >
                <option value="cash">Tiền mặt trực tiếp tại chỗ</option>
                <option value="direct_bank">Chuyển khoản trực tiếp (VietQR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú cho người thu mua:</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="VD: Nhà trong hẻm xe ba gác vào được, ve chai để ở sân trước..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmitOrder}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            Đăng Tin Thu Gom Ngay
          </button>
        </div>
      </div>
    </div>
  );
};
