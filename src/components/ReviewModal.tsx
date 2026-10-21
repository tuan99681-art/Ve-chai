/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Hộp Thoại Đánh Giá Uy Tín Sau Giao Dịch (Reputation Review Modal)
 * Giúp người mua và người bán đánh giá lẫn nhau sau khi hoàn tất đơn:
 * - Chấm điểm số sao (1 đến 5 sao)
 * - Tích chọn các tiêu chí: Cân đúng khối lượng, Đúng giờ hẹn, Giá công bằng, Thái độ lịch sự
 * - Nhập nhận xét phản hồi chi tiết
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrapOrder } from '../types';
import { Star, Check, X, ShieldCheck } from 'lucide-react';

export const ReviewModal: React.FC<{
  order: ScrapOrder | null;
  onClose: () => void;
}> = ({ order, onClose }) => {
  const { currentUser, submitReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [accurateWeight, setAccurateWeight] = useState(true);
  const [punctual, setPunctual] = useState(true);
  const [fairPrice, setFairPrice] = useState(true);
  const [polite, setPolite] = useState(true);
  const [comment, setComment] = useState('Giao dịch rất thuận lợi, đúng giờ và chuẩn xác. Chắc chắn sẽ tiếp tục ủng hộ!');

  if (!order) return null;

  const isSeller = currentUser.role === 'seller';
  const targetUserId = isSeller ? (order.buyerId || 'usr-buyer-bay') : order.sellerId;
  const targetUserName = isSeller ? (order.buyerName || 'Người thu mua') : order.sellerName;

  const handleSubmit = () => {
    submitReview({
      orderId: order.id,
      toUserId: targetUserId,
      toUserName: targetUserName,
      rating,
      criteria: {
        accurateWeight,
        punctual,
        fairPrice,
        polite
      },
      comment: comment.trim() || 'Rất hài lòng với giao dịch này.'
    });
    alert('Cảm ơn bạn đã gửi đánh giá uy tín! Điểm số đã được cộng vào hồ sơ đối tác.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Đánh Giá Uy Tín Giao Dịch</h2>
              <p className="text-xs text-slate-500">Đối tác: {targetUserName} (Đơn #{order.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chấm sao (Star rating) */}
        <div className="text-center py-2 space-y-2">
          <span className="text-xs text-slate-500 block">Mức độ hài lòng của bạn:</span>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-600 block">
            {rating === 5 ? 'Tuyệt vời (5/5 sao)' : rating === 4 ? 'Tốt (4/5 sao)' : rating === 3 ? 'Bình thường (3/5 sao)' : 'Chưa hài lòng'}
          </span>
        </div>

        {/* Các tiêu chí đánh giá cụ thể */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-700 block">Tiêu chí thực hiện giao dịch:</span>
          
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={accurateWeight}
              onChange={(e) => setAccurateWeight(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span className="font-medium text-slate-700">⚖️ Cân đúng khối lượng, không gian lận</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={punctual}
              onChange={(e) => setPunctual(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span className="font-medium text-slate-700">⏰ Đúng giờ hẹn thu gom</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={fairPrice}
              onChange={(e) => setFairPrice(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span className="font-medium text-slate-700">💵 Giá cả thỏa thuận minh bạch, trả đủ tiền</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
            <input
              type="checkbox"
              checked={polite}
              onChange={(e) => setPolite(e.target.checked)}
              className="rounded text-emerald-600"
            />
            <span className="font-medium text-slate-700">😊 Thái độ thân thiện, lịch sự, văn minh</span>
          </label>
        </div>

        {/* Nhận xét phản hồi */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Nhận xét phản hồi chi tiết:
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            Gửi Đánh Giá Uy Tín
          </button>
        </div>
      </div>
    </div>
  );
};
