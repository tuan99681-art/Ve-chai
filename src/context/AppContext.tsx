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
  disputes: Dispute[];
  resolveDispute: (disputeId: string, resolutionNote: string, status: 'resolved' | 'dismissed') => void;
  anomalies: AbnormalActivityLog[];
  flagUser: (userId: string, reason: string) => void;
  broadcastNotification: (title: string, message: string, type?: SystemNotification['type']) => void;

  // Thông báo chạy chữ theo Tỉnh / Thành Phố (City Announcements & Direct Messages)
  cityAnnouncements: CityAnnouncement[];
  addCityAnnouncement: (announcement: Omit<CityAnnouncement, 'id' | 'createdAt' | 'recipientCount'>) => CityAnnouncement;
  updateCityAnnouncement: (id: string, data: Partial<CityAnnouncement>) => void;
  deleteCityAnnouncement: (id: string) => void;
  toggleCityAnnouncementStatus: (id: string) => void;
  sendAnnouncementMessagesToCity: (announcementId: string) => number;
  adminPreviewCity: string;
  setAdminPreviewCity: (city: string) => void;

  // Thông báo
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
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh'
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

        disputes,
        resolveDispute,
        anomalies,
        flagUser,
        broadcastNotification,

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
