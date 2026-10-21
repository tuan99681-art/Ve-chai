/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Tin Nhắn & Trò Chuyện Trực Tiếp (Live Chat & Đàm Phán)
 * - Trao đổi giá cả và khối lượng ve chai
 * - Thỏa thuận và chốt lịch hẹn thu gom cụ thể
 * - Gửi tin nhắn nhanh (quick replies) và thông báo nội bộ
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Conversation, ChatMessage } from '../types';
import { 
  MessageSquare, 
  Send, 
  Calendar, 
  DollarSign, 
  Clock, 
  Check, 
  Truck, 
  ShoppingBag, 
  User, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { 
    currentUser, 
    users, 
    conversations, 
    activeConversation, 
    setActiveConversation, 
    sendMessage 
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [showOfferBox, setShowOfferBox] = useState(false);

  // Lọc danh sách hội thoại của người dùng hiện tại
  const myConversations = conversations.filter(c => 
    c.participantIds.includes(currentUser.id)
  );

  // Chọn hội thoại đầu tiên nếu chưa có activeConversation
  const currentConv = activeConversation || myConversations[0] || null;

  // Tìm thông tin đối tác trò chuyện
  const otherUserId = currentConv?.participantIds.find(id => id !== currentUser.id);
  const otherUser = users.find(u => u.id === otherUserId);

  const handleSend = () => {
    if (!messageInput.trim() || !currentConv) return;
    sendMessage(currentConv.id, messageInput.trim());
    setMessageInput('');
  };

  const handleSendOffer = () => {
    if (!offerPriceInput || !currentConv) return;
    const priceNum = parseInt(offerPriceInput.replace(/\D/g, ''), 10);
    sendMessage(
      currentConv.id,
      `Đề xuất mức giá thu gom trọn gói: ${priceNum.toLocaleString('vi-VN')} VNĐ. Bạn thấy thế nào?`,
      {
        suggestedPrice: priceNum,
        accepted: false
      }
    );
    setOfferPriceInput('');
    setShowOfferBox(false);
  };

  // Các câu thoại mẫu nhanh
  const quickReplies = [
    'Chào bạn, bên bạn có thu gom tận nhà không?',
    'Mình có khoảng 20kg giấy carton và vỏ lon bia',
    'Khoảng 17h30 chiều nay bạn ghé được không?',
    'Đã đồng ý mức giá, bạn qua lấy giúp mình nhé!'
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden h-[calc(100vh-195px)] min-h-[520px] flex flex-col md:flex-row">
      
      {/* CỘT DANH SÁCH HỘI THOẠI (BÊN TRÁI) */}
      <div className={`w-full md:w-80 border-r border-slate-200/80 flex flex-col ${currentConv && 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-800 text-sm">Hội thoại ({myConversations.length})</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {myConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có cuộc trò chuyện nào. Hãy chọn người mua/người bán trên bản đồ để bắt đầu!
            </div>
          ) : (
            myConversations.map(conv => {
              const partnerId = conv.participantIds.find(id => id !== currentUser.id);
              const partner = users.find(u => u.id === partnerId);
              const isSelected = currentConv?.id === conv.id;
              const unread = conv.unreadCount[currentUser.id] || 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={partner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={partner?.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {partner?.fullName || 'Người dùng'}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CỘT CỬA SỔ CHAT CHI TIẾT (BÊN PHẢI) */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 ${!currentConv && 'hidden md:flex'}`}>
        {currentConv && otherUser ? (
          <>
            {/* Header chat */}
            <div className="px-4 py-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden text-slate-400 hover:text-slate-600 font-bold text-sm mr-1"
                >
                  ←
                </button>
                <img
                  src={otherUser.avatar}
                  alt={otherUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">{otherUser.fullName}</h3>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      otherUser.role === 'buyer' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {otherUser.role === 'buyer' ? 'Người Thu Mua' : 'Người Bán'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Đang trực tuyến • {otherUser.location.address}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${otherUser.phone}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Gọi điện trực tiếp"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">{otherUser.phone}</span>
                </a>
              </div>
            </div>

            {/* Danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentConv.messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                      <span>{isMe ? 'Bạn' : msg.senderName}</span>
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Khối đề xuất giá đặc biệt */}
                      {msg.isOffer && msg.offerData && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-[11px]">
                          {msg.offerData.suggestedPrice && (
                            <div className="font-bold flex items-center gap-1">
                              <span>Mức giá đề xuất:</span>
                              <span className="bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-mono font-extrabold">
                                {msg.offerData.suggestedPrice.toLocaleString('vi-VN')} VNĐ
                              </span>
                            </div>
                          )}
                          {msg.offerData.pickupTime && (
                            <div className="mt-1 font-semibold">
                              Lịch hẹn: {msg.offerData.pickupTime}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Câu trả lời nhanh (Quick Suggestions) */}
            <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Gợi ý nhanh:
              </span>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(currentConv.id, reply)}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg border border-slate-200 whitespace-nowrap transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Khung nhập tin nhắn & nút đề xuất giá */}
            <div className="p-3 bg-white border-t border-slate-200/80 space-y-2">
              {showOfferBox && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs animate-in fade-in">
                  <DollarSign className="w-4 h-4 text-emerald-700 shrink-0" />
                  <input
                    type="number"
                    value={offerPriceInput}
                    onChange={(e) => setOfferPriceInput(e.target.value)}
                    placeholder="Nhập giá đề xuất trọn gói (VNĐ)..."
                    className="flex-1 px-2.5 py-1.5 bg-white border rounded-lg text-xs font-mono font-bold"
                  />
                  <button
                    onClick={handleSendOffer}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Gửi đề xuất
                  </button>
                  <button
                    onClick={() => setShowOfferBox(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOfferBox(!showOfferBox)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors"
                  title="Đề xuất giá thỏa thuận"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Báo giá</span>
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập tin nhắn thỏa thuận giá, hẹn giờ..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Chọn cuộc trò chuyện để bắt đầu</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Thỏa thuận giá cả, gửi hình ảnh ve chai và xác nhận giờ thu gom với người mua hoặc người bán gần bạn nhất.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
