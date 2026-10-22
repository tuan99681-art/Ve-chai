/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Quản lý trạng thái toàn cục (Application Context) cho nền tảng VeChaiXanh
 * Bao gồm quản lý người dùng (Người bán, Người mua, Quản trị viên),
 * Đơn hàng thu gom, Bảng giá & Danh mục phế liệu, Tin nhắn, Đánh giá, và Ví điện tử.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  ScrapCategory,
  ScrapSubItem,
  ScrapOrder,
  Conversation,
  ChatMessage,
  Review,
  WalletTransaction,
  Dispute,
  AbnormalActivityLog,
  SystemNotification,
  CityAnnouncement,
  PushNotification,
  OrderStatus,
  KYCStatus
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_REVIEWS,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_DISPUTES,
  INITIAL_ANOMALIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_CITY_ANNOUNCEMENTS
} from '../data/mockData';
import { isUserInCity, normalizeCityName } from '../utils/geo';

export interface AppContextType {
  // Người dùng & Vai trò
  currentUser: UserProfile;
  users: UserProfile[];
  switchUser: (userId: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
  registerUser: (data: {
    fullName: string;
    phone: string;
    role: UserRole;
    address: string;
    lat: number;
    lng: number;
    city?: string;
    district?: string;
    vehicleType?: string;
  }) => UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  hasActiveScrapListing: (sellerId: string) => boolean;
  verifyUserPhone: (userId: string, isVerified?: boolean) => void;

  // Danh mục & Bảng giá
  categories: ScrapCategory[];
  addCategory: (category: { name: string; code: string; iconName: string; color: string; description: string }) => void;
  updateCategory: (id: string, data: Partial<ScrapCategory>) => void;
  deleteCategory: (id: string) => void;
  addSubItem: (categoryId: string, subItem: Omit<ScrapSubItem, 'id'>) => void;
  updateSubItem: (categoryId: string, subItemId: string, data: Partial<ScrapSubItem>) => void;
  deleteSubItem: (categoryId: string, subItemId: string) => void;

  // Đơn thu gom ve chai
  orders: ScrapOrder[];
  createOrder: (orderData: {
    items: ScrapOrder['items'];
    totalEstimatedWeight: number;
    estimatedValue: number;
    images: string[];
    notes: string;
    pickupScheduledAt: string;
    paymentMethod: 'cash' | 'direct_bank';
    address?: string;
    lat?: number;
    lng?: number;
  }) => ScrapOrder;
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, actualWeight?: number, finalAmount?: number) => void;
  cancelOrder: (orderId: string, reason?: string) => void;

  // Trò chuyện trực tiếp (Live Chat)
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (conversationId: string, text: string, offerData?: ChatMessage['offerData']) => void;
  startOrGetConversation: (otherUserId: string, orderId?: string) => Conversation;

  // Đánh giá uy tín
  reviews: Review[];
  submitReview: (reviewData: {
    orderId: string;
    toUserId: string;
    toUserName: string;
    rating: number;
    criteria: Review['criteria'];
    comment: string;
  }) => void;

  // Thanh toán trực tiếp giữa hai bên (Tiền mặt hoặc Chuyển khoản)
  confirmDirectPayment: (orderId: string, method: 'cash' | 'direct_bank') => void;

  // Quản trị viên
  deleteUser: (userId: string) => { success: boolean; message: string };
  disputes: Dispute[];
  resolveDispute: (disputeId: string, resolutionNote: string, status: 'resolved' | 'dismissed') => void;
  anomalies: AbnormalActivityLog[];
  flagUser: (userId: string, reason: string) => void;
  broadcastNotification: (title: string, message: string, type?: SystemNotification['type']) => void;

  // Hệ thống thông báo đẩy (Push Notifications)
  pushPermission: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<boolean>;
  triggerPushNotification: (
    title: string,
    body: string,
    url?: string,
    targetCity?: string,
    targetRole?: 'all' | 'seller' | 'buyer',
    urgency?: 'normal' | 'high'
  ) => void;
  activePushToast: PushNotification | null;
  dismissPushToast: () => void;
  isPushSoundEnabled: boolean;
  setIsPushSoundEnabled: (enabled: boolean) => void;

  // Thông báo chạy chữ theo Tỉnh / Thành Phố (City Announcements & Direct Messages)
  cityAnnouncements: CityAnnouncement[];
  addCityAnnouncement: (announcement: Omit<CityAnnouncement, 'id' | 'createdAt' | 'recipientCount'>) => CityAnnouncement;
  updateCityAnnouncement: (id: string, data: Partial<CityAnnouncement>) => void;
  deleteCityAnnouncement: (id: string) => void;
  toggleCityAnnouncementStatus: (id: string) => void;
  sendAnnouncementMessagesToCity: (announcementId: string) => number;
  adminPreviewCity: string;
  setAdminPreviewCity: (city: string) => void;

  // Thông báo nội bộ & chuông
  notifications: SystemNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationCount: number;

  // Bộ lọc tìm kiếm
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  selectedRadiusKm: number;
  setSelectedRadiusKm: (radius: number) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (catId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'vechaixanh_users_v3',
  CURRENT_USER_ID: 'vechaixanh_current_user_id_v3',
  CATEGORIES: 'vechaixanh_categories_v3',
  ORDERS: 'vechaixanh_orders_v3',
  CONVERSATIONS: 'vechaixanh_conversations_v3',
  REVIEWS: 'vechaixanh_reviews_v3',
  TRANSACTIONS: 'vechaixanh_transactions_v3',
  DISPUTES: 'vechaixanh_disputes_v3',
  ANOMALIES: 'vechaixanh_anomalies_v3',
  NOTIFICATIONS: 'vechaixanh_notifications_v3',
  CITY_ANNOUNCEMENTS: 'vechaixanh_city_announcements_v3'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Người dùng
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr-seller-lan';
  });

  // Danh mục phế liệu
  const [categories, setCategories] = useState<ScrapCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Đơn hàng
  const [orders, setOrders] = useState<ScrapOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Tin nhắn
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Đánh giá
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Tranh chấp & Cảnh báo
  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISPUTES);
    return saved ? JSON.parse(saved) : INITIAL_DISPUTES;
  });
  const [anomalies, setAnomalies] = useState<AbnormalActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANOMALIES);
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });

  // Thông báo
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Thông báo thu gom theo Tỉnh / Thành Phố (City Announcements)
  const [cityAnnouncements, setCityAnnouncements] = useState<CityAnnouncement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CITY_ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_CITY_ANNOUNCEMENTS;
  });

  const [adminPreviewCity, setAdminPreviewCity] = useState<string>('Toàn quốc');

  // Trạng thái thông báo đẩy (Push Notifications)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [activePushToast, setActivePushToast] = useState<PushNotification | null>(null);
  const [isPushSoundEnabled, setIsPushSoundEnabled] = useState<boolean>(true);

  // Trạng thái hiển thị form đăng ký xác thực SĐT cho người mới vào app
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    // Nếu người dùng chưa từng hoàn tất đăng ký/đăng nhập thì mở modal đăng ký
    return !localStorage.getItem('vechaixanh_onboarded_v2');
  });

  // Kiểm tra Người Bán có đang đăng bán món hàng nào hay không
  // (Khi đăng bán mới hiển thị vị trí cho người mua thấy, mua bán xong thì ẩn đi)
  const hasActiveScrapListing = (sellerId: string): boolean => {
    return orders.some(o => 
      o.sellerId === sellerId && 
      (o.status === 'pending' || o.status === 'accepted' || o.status === 'arrived')
    );
  };

  // Bộ lọc
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(10);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Lưu trữ LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
  }, [reviews]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
  }, [disputes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(anomalies));
  }, [anomalies]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CITY_ANNOUNCEMENTS, JSON.stringify(cityAnnouncements));
  }, [cityAnnouncements]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const registerUser = (data: {
    fullName: string;
    phone: string;
    role: UserRole;
    address: string;
    lat: number;
    lng: number;
    city?: string;
    district?: string;
    idCardNumber?: string;
    vehicleType?: string;
  }): UserProfile => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName,
      phone: data.phone,
      role: data.role,
      avatar: data.role === 'buyer'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      location: {
        lat: data.lat || 10.7769,
        lng: data.lng || 106.7009,
        address: data.address,
        district: data.district || 'Quận 1',
        city: data.city || 'TP. Hồ Chí Minh'
      },
      isPhoneVerified: true,
      reputationScore: 5.0,
      totalTransactions: 0,
      completionRate: 100,
      badges: ['Thành Viên Mới', 'Đã Xác Thực SĐT'],
      vehicleType: data.vehicleType,
      isOnline: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    broadcastNotification(
      'Đăng ký tài khoản thành công',
      `Chào mừng ${newUser.fullName} gia nhập nền tảng VeChaiXanh!`,
      'kyc'
    );
    return newUser;
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...data } : u));
  };

  const verifyUserPhone = (userId: string, isVerified: boolean = true) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const badges = [...u.badges];
        if (isVerified && !badges.includes('Đã Xác Thực SĐT')) {
          badges.push('Đã Xác Thực SĐT');
        }
        return { ...u, isPhoneVerified: isVerified, badges };
      }
      return u;
    }));
  };

  // Quản lý Danh mục & Bảng giá
  const addCategory = (category: { name: string; code: string; iconName: string; color: string; description: string }) => {
    const newCat: ScrapCategory = {
      id: `cat-${Date.now()}`,
      ...category,
      subItems: [],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setCategories(prev => [...prev, newCat]);
    broadcastNotification('Bảng giá mới', `Đã cập nhật danh mục phế liệu: ${newCat.name}`, 'system');
  };

  const updateCategory = (id: string, data: Partial<ScrapCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSubItem = (categoryId: string, subItem: Omit<ScrapSubItem, 'id'>) => {
    const newSubItem: ScrapSubItem = {
      id: `sub-${Date.now()}`,
      ...subItem
    };
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subItems: [...c.subItems, newSubItem],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));
  };

  const updateSubItem = (categoryId: string, subItemId: string, data: Partial<ScrapSubItem>) => {
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subItems: c.subItems.map(s => s.id === subItemId ? { ...s, ...data } : s),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));
  };

  const deleteSubItem = (categoryId: string, subItemId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subItems: c.subItems.filter(s => s.id !== subItemId),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    }));
  };

  // Đơn hàng
  const createOrder = (orderData: {
    items: ScrapOrder['items'];
    totalEstimatedWeight: number;
    estimatedValue: number;
    images: string[];
    notes: string;
    pickupScheduledAt: string;
    paymentMethod: 'cash' | 'direct_bank';
    address?: string;
    lat?: number;
    lng?: number;
  }): ScrapOrder => {
    const newOrder: ScrapOrder = {
      id: `ORD-2026-${Math.floor(100 + Math.random() * 900)}`,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerPhone: currentUser.phone,
      sellerAvatar: currentUser.avatar,
      sellerLocation: {
        lat: orderData.lat || currentUser.location.lat,
        lng: orderData.lng || currentUser.location.lng,
        address: orderData.address || currentUser.location.address,
        district: currentUser.location.district,
        city: currentUser.location.city
      },
      items: orderData.items,
      totalEstimatedWeight: orderData.totalEstimatedWeight,
      estimatedValue: orderData.estimatedValue,
      images: orderData.images.length > 0 ? orderData.images : ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop&q=80'],
      notes: orderData.notes,
      pickupScheduledAt: orderData.pickupScheduledAt,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'unpaid',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setOrders(prev => [newOrder, ...prev]);
    broadcastNotification(
      'Có đơn thu gom mới gần bạn!',
      `${newOrder.sellerName} vừa tạo đơn ${newOrder.totalEstimatedWeight}kg ve chai.`,
      'order'
    );
    return newOrder;
  };

  const acceptOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          buyerId: currentUser.id,
          buyerName: currentUser.fullName,
          buyerPhone: currentUser.phone,
          buyerAvatar: currentUser.avatar,
          buyerLocation: currentUser.location,
          status: 'accepted'
        };
      }
      return o;
    }));

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      startOrGetConversation(targetOrder.sellerId, orderId);
      broadcastNotification('Người mua đã nhận đơn!', `${currentUser.fullName} đang đến thu gom.`, 'order');
    }
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    actualWeight?: number,
    finalAmount?: number
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          totalActualWeight: actualWeight !== undefined ? actualWeight : o.totalActualWeight,
          finalAmount: finalAmount !== undefined ? finalAmount : o.finalAmount,
          completedAt: status === 'completed' ? new Date().toLocaleString('vi-VN') : o.completedAt
        };
      }
      return o;
    }));
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    broadcastNotification('Đã hủy đơn hàng', `Đơn #${orderId} đã hủy: ${reason || 'Người dùng hủy'}`, 'order');
  };

  // Chat
  const startOrGetConversation = (otherUserId: string, orderId?: string): Conversation => {
    const existing = conversations.find(c =>
      c.participantIds.includes(currentUser.id) && c.participantIds.includes(otherUserId)
    );

    if (existing) {
      setActiveConversation(existing);
      return existing;
    }

    const otherUser = users.find(u => u.id === otherUserId);
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      orderId,
      participantIds: [currentUser.id, otherUserId],
      lastMessage: 'Bắt đầu cuộc trò chuyện.',
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: {
        [currentUser.id]: 0,
        [otherUserId]: 1
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          senderRole: currentUser.role,
          text: `Xin chào ${otherUser?.fullName || 'bạn'}! Tôi muốn trao đổi về lịch hẹn và giá thu gom ve chai.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv);
    return newConv;
  };

  const sendMessage = (conversationId: string, text: string, offerData?: ChatMessage['offerData']) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOffer: Boolean(offerData),
      offerData
    };

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: newMsg.timestamp,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    if (activeConversation && activeConversation.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        lastMessage: text,
        messages: [...prev.messages, newMsg]
      } : null);
    }
  };

  // Đánh giá
  const submitReview = (data: {
    orderId: string;
    toUserId: string;
    toUserName: string;
    rating: number;
    criteria: Review['criteria'];
    comment: string;
  }) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      orderId: data.orderId,
      fromUserId: currentUser.id,
      fromUserName: currentUser.fullName,
      fromUserRole: currentUser.role,
      toUserId: data.toUserId,
      toUserName: data.toUserName,
      rating: data.rating,
      criteria: data.criteria,
      comment: data.comment,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setReviews(prev => [newRev, ...prev]);
    setUsers(prev => prev.map(u => {
      if (u.id === data.toUserId) {
        const uReviews = [...reviews.filter(r => r.toUserId === data.toUserId), newRev];
        const avg = uReviews.reduce((sum, r) => sum + r.rating, 0) / uReviews.length;
        return {
          ...u,
          reputationScore: Math.round(avg * 10) / 10,
          totalTransactions: u.totalTransactions + 1
        };
      }
      return u;
    }));
    broadcastNotification('Đánh giá mới', `${currentUser.fullName} đã gửi đánh giá ${data.rating}⭐`, 'system');
  };

  // Thanh toán trực tiếp giữa hai bên (Người mua và Người bán tự thanh toán)
  const confirmDirectPayment = (orderId: string, method: 'cash' | 'direct_bank' = 'cash') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentMethod: method,
          paymentStatus: 'paid',
          status: 'completed',
          completedAt: new Date().toLocaleString('vi-VN')
        };
      }
      return o;
    }));

    broadcastNotification(
      'Giao dịch thanh toán hoàn tất! 🤝',
      `Đơn #${orderId} đã được hai bên xác nhận thanh toán trực tiếp (${method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản trực tiếp'}). Hãy đánh giá đối tác để xây dựng uy tín!`,
      'order'
    );
  };

  // Quản trị
  const resolveDispute = (disputeId: string, resolutionNote: string, status: 'resolved' | 'dismissed') => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status, resolutionNote } : d));
  };

  const flagUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFlagged: true, flagReason: reason } : u));
    setAnomalies(prev => [
      {
        id: `ANOM-${Date.now()}`,
        userId,
        userName: users.find(u => u.id === userId)?.fullName || 'Thành viên',
        userRole: users.find(u => u.id === userId)?.role || 'seller',
        severity: 'high',
        type: 'multiple_disputes',
        description: `Bị gắn cờ: ${reason}`,
        timestamp: new Date().toLocaleString('vi-VN'),
        resolved: false
      },
      ...prev
    ]);
  };

  // 1. Âm thanh chuông báo đẩy (Web Audio API Synthesizer)
  const playNotificationChime = () => {
    if (!isPushSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.32);
    } catch {
      // Ignored if autoplay limitation
    }
  };

  // 2. Yêu cầu cấp quyền Web Notification của trình duyệt
  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      broadcastNotification('Thông báo đẩy', 'Trình duyệt này không hỗ trợ Web Notification API.', 'system');
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === 'granted') {
        triggerPushNotification(
          '🔔 Đã Bật Thông Báo Đẩy Thành Công!',
          'Bạn sẽ nhận thông báo tức thì khi có người mua gần bạn, đơn hàng mới và lịch thu gom của Ban quản trị.'
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Lỗi yêu cầu quyền thông báo đẩy:', err);
      return false;
    }
  };

  // 3. Phát thông báo đẩy thời gian thực (Push Notification Banner + Web Notification)
  const triggerPushNotification = (
    title: string,
    body: string,
    url: string = '/chat',
    targetCity?: string,
    targetRole: 'all' | 'seller' | 'buyer' = 'all',
    urgency: 'normal' | 'high' = 'normal'
  ) => {
    playNotificationChime();

    const newPush: PushNotification = {
      id: `push-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      targetRole,
      targetCity,
      urgency,
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setActivePushToast(newPush);

    // Tự động tắt sau 6.5s
    setTimeout(() => {
      setActivePushToast(prev => (prev?.id === newPush.id ? null : prev));
    }, 6500);

    // Nếu đã cấp quyền trình duyệt, bắn ra native Web Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=100&auto=format&fit=crop&q=80',
          tag: newPush.id
        });
      } catch {
        // Ignored
      }
    }

    // Đồng bộ vào chuông thông báo nội bộ
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message: body,
      type: 'system',
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissPushToast = () => setActivePushToast(null);

  // 4. Xóa người bán và người mua (Admin capability)
  const deleteUser = (userId: string): { success: boolean; message: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { success: false, message: 'Không tìm thấy người dùng cần xóa.' };
    }
    if (target.role === 'admin' || target.id === 'usr-admin-01') {
      return { success: false, message: 'Không được phép xóa tài khoản Ban Quản Trị Hệ Thống.' };
    }

    // 1. Xóa người dùng khỏi danh sách
    setUsers(prev => prev.filter(u => u.id !== userId));

    // 2. Cập nhật các đơn hàng liên quan: hủy đơn chưa hoàn tất
    setOrders(prev => prev.map(o => {
      if ((o.sellerId === userId || o.buyerId === userId) && o.status !== 'completed' && o.status !== 'cancelled') {
        return {
          ...o,
          status: 'cancelled',
          notes: `${o.notes || ''} [Hệ thống hủy tự động: Tài khoản ${target.fullName} đã bị Quản Trị Viên xóa]`
        };
      }
      return o;
    }));

    // 3. Nếu đang switch vào tài khoản này, đổi về tài khoản Admin
    if (currentUserId === userId) {
      const admin = users.find(u => u.role === 'admin') || users[0];
      setCurrentUserId(admin.id);
    }

    // 4. Phát thông báo
    broadcastNotification(
      'Quản trị viên đã xóa thành viên',
      `Tài khoản "${target.fullName}" (${target.role === 'buyer' ? 'Người Thu Mua' : 'Người Bán'}, SĐT: ${target.phone}) đã bị xóa khỏi hệ thống.`,
      'system'
    );

    triggerPushNotification(
      '🗑️ Đã Xóa Thành Viên Thành Công',
      `Đã xóa tài khoản "${target.fullName}" (${target.phone}) khỏi hệ thống VeChaiXanh.`,
      '/admin'
    );

    return {
      success: true,
      message: `Đã xóa thành công tài khoản "${target.fullName}" (${target.phone}).`
    };
  };

  // 5. Quản lý thông báo thu gom theo Tỉnh / Thành phố & Tự động gửi tin nhắn Chat
  const sendAnnouncementMessagesToCity = (announcementId: string): number => {
    const annom = cityAnnouncements.find(a => a.id === announcementId);
    if (!annom) return 0;

    // Tìm tất cả người dùng thuộc thành phố này (trừ admin)
    const targetUsers = users.filter(u => 
      u.role !== 'admin' && 
      u.id !== 'usr-admin-01' && 
      isUserInCity(u.location?.city, u.location?.address, annom.city)
    );

    if (targetUsers.length === 0) {
      return 0;
    }

    const adminUser = users.find(u => u.role === 'admin') || users[0];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formattedMessage = `📢 [THÔNG BÁO TỪ BAN QUẢN TRỊ VECHAIXANH - ĐOÀN THU GOM TẠI ${annom.city.toUpperCase()}]\n\nKính gửi Quý thành viên!\n\n${annom.content}\n\n🗓️ Thời gian đoàn xe đến: ${annom.pickupDate}\n📍 Địa bàn trọng điểm: ${annom.district || annom.city}\n📦 Mặt hàng ưu tiên thu mua: ${annom.scrapTypes.join(', ')}\n🎁 Chính sách ưu đãi: ${annom.priceBonus || 'Cân điện tử chuẩn xác, giá thu mua cao'}\n📞 Hotline điều phối lưu động: ${annom.contactPhone}\n\n👉 Quý thành viên có ve chai cần bán hãy đăng đơn trên ứng dụng hoặc phản hồi trực tiếp vào tin nhắn này để đoàn xe ghé tận nơi!`;

    setConversations(prev => {
      let updated = [...prev];
      targetUsers.forEach(u => {
        const existingIdx = updated.findIndex(c =>
          (c.participantIds.includes(adminUser.id) && c.participantIds.includes(u.id)) ||
          (c.participantIds.includes('usr-admin-01') && c.participantIds.includes(u.id))
        );

        const newMsg: ChatMessage = {
          id: `msg-annom-${Date.now()}-${u.id}`,
          senderId: adminUser.id,
          senderName: 'Ban Quản Trị VeChaiXanh',
          senderRole: 'admin',
          text: formattedMessage,
          timestamp: nowTime
        };

        if (existingIdx >= 0) {
          const conv = updated[existingIdx];
          updated[existingIdx] = {
            ...conv,
            lastMessage: `📢 [Thông báo]: Đoàn thu gom tại ${annom.city} ngày ${annom.pickupDate}`,
            lastMessageTime: nowTime,
            unreadCount: {
              ...conv.unreadCount,
              [u.id]: (conv.unreadCount[u.id] || 0) + 1
            },
            messages: [...conv.messages, newMsg]
          };
        } else {
          const newConv: Conversation = {
            id: `conv-admin-${u.id}-${Date.now()}`,
            participantIds: [adminUser.id, u.id],
            lastMessage: `📢 [Thông báo]: Đoàn thu gom tại ${annom.city} ngày ${annom.pickupDate}`,
            lastMessageTime: nowTime,
            unreadCount: {
              [adminUser.id]: 0,
              [u.id]: 1
            },
            messages: [newMsg]
          };
          updated = [newConv, ...updated];
        }
      });
      return updated;
    });

    // Cập nhật số lượng người đã nhận được tin nhắn
    setCityAnnouncements(prev => prev.map(a => 
      a.id === announcementId ? { ...a, recipientCount: targetUsers.length } : a
    ));

    // Kích hoạt thông báo đẩy
    triggerPushNotification(
      `📢 Ban Quản Trị: Thu Gom Tại ${annom.city}`,
      `Đoàn xe thu mua đến ${annom.city} ngày ${annom.pickupDate}. Đã tự động gửi tin nhắn chi tiết vào Chat của ${targetUsers.length} thành viên!`,
      '/chat',
      annom.city
    );

    return targetUsers.length;
  };

  const addCityAnnouncement = (
    announcement: Omit<CityAnnouncement, 'id' | 'createdAt' | 'recipientCount'>
  ): CityAnnouncement => {
    const newId = `annom-${Date.now()}`;
    const newAnnom: CityAnnouncement = {
      ...announcement,
      id: newId,
      recipientCount: 0,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    setCityAnnouncements(prev => [newAnnom, ...prev]);

    // Tự động gửi tin nhắn đến hộp thư Chat nếu được bật
    if (announcement.sendDirectMessage !== false) {
      setTimeout(() => {
        sendAnnouncementMessagesToCity(newId);
      }, 100);
    } else {
      triggerPushNotification(
        `📢 Thông Báo Mới: Thu Gom Tại ${announcement.city}`,
        announcement.title,
        '/',
        announcement.city
      );
    }

    return newAnnom;
  };

  const updateCityAnnouncement = (id: string, data: Partial<CityAnnouncement>) => {
    setCityAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteCityAnnouncement = (id: string) => {
    setCityAnnouncements(prev => prev.filter(a => a.id !== id));
    broadcastNotification('Thông báo', 'Đã xóa thông báo thu gom của tỉnh/thành phố.', 'system');
  };

  const toggleCityAnnouncementStatus = (id: string) => {
    setCityAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const broadcastNotification = (title: string, message: string, type: SystemNotification['type'] = 'system') => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        showAuthModal,
        setShowAuthModal,
        registerUser,
        updateUserProfile,
        hasActiveScrapListing,
        verifyUserPhone,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubItem,
        updateSubItem,
        deleteSubItem,

        orders,
        createOrder,
        acceptOrder,
        updateOrderStatus,
        cancelOrder,

        conversations,
        activeConversation,
        setActiveConversation,
        sendMessage,
        startOrGetConversation,

        reviews,
        submitReview,

        confirmDirectPayment,

        deleteUser,
        disputes,
        resolveDispute,
        anomalies,
        flagUser,
        broadcastNotification,

        pushPermission,
        requestPushPermission,
        triggerPushNotification,
        activePushToast,
        dismissPushToast,
        isPushSoundEnabled,
        setIsPushSoundEnabled,

        cityAnnouncements,
        addCityAnnouncement,
        updateCityAnnouncement,
        deleteCityAnnouncement,
        toggleCityAnnouncementStatus,
        sendAnnouncementMessagesToCity,
        adminPreviewCity,
        setAdminPreviewCity,

        notifications,
        markNotificationRead,
        clearAllNotifications,
        unreadNotificationCount,

        searchKeyword,
        setSearchKeyword,
        selectedRadiusKm,
        setSelectedRadiusKm,
        selectedCategoryFilter,
        setSelectedCategoryFilter
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
