/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Định nghĩa toàn bộ kiểu dữ liệu (Types & Interfaces) cho ứng dụng VeChaiXanh
 * Bao gồm: Người dùng, Danh mục ve chai, Đơn thu gom, Tin nhắn, Đánh giá, Ví điện tử và Quản trị
 */

// 1. Vai trò người dùng trong hệ thống
export type UserRole = 'seller' | 'buyer' | 'admin';

// 2. Tọa độ địa lý GPS
export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  district?: string;
  city?: string;
}

// 3. Trạng thái xác thực định danh (KYC)
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// 4. Thông tin người dùng (Người bán, Người thu mua, Quản trị viên)
export interface UserProfile {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  avatar: string;
  location: GeoLocation;
  isPhoneVerified: boolean; // Chỉ cần xác thực số điện thoại qua mã OTP khi đăng ký
  reputationScore: number; // Điểm uy tín (1.0 - 5.0)
  totalTransactions: number; // Tổng số giao dịch
  completionRate: number; // Tỉ lệ hoàn thành giao dịch (%)
  badges: string[]; // Huy hiệu uy tín: "Vựa phế liệu uy tín", "Gia đình xanh", "Cân đúng giá tốt"
  vehicleType?: string; // Phương tiện (xe máy, xe ba gác, xe tải nhỏ)
  isOnline: boolean;
  isFlagged?: boolean; // Cảnh báo hoạt động bất thường
  flagReason?: string;
  createdAt: string;
}

// 5. Mục con phân loại phế liệu (Ví dụ: Nhựa PET chai nước, Nhựa HDPE, Nhựa PP...)
export interface ScrapSubItem {
  id: string;
  name: string; // Tên phân loại (vd: Chai nhựa PET trong suốt)
  unit: string; // Đơn vị tính: 'kg', 'lon', 'cái'
  currentPrice: number; // Giá thu mua thị trường (VNĐ)
  priceMin: number; // Khoảng giá thấp nhất
  priceMax: number; // Khoảng giá cao nhất
  priceChange: 'up' | 'down' | 'stable'; // Xu hướng giá
  description: string; // Mô tả & cách nhận biết
  tips?: string; // Mẹo phân loại để bán giá cao
}

// 6. Danh mục phế liệu chính (Nhựa, Nhôm, Đồng, Sắt, Giấy...)
export interface ScrapCategory {
  id: string;
  code: string; // plastic, aluminum, copper, iron, paper, electronics, battery
  name: string; // Nhựa, Nhôm, Đồng, Sắt Thép, Giấy, Bo Mạch, Pin & Acquy
  iconName: string; // Tên icon Lucide
  color: string; // Màu sắc đại diện
  description: string;
  subItems: ScrapSubItem[]; // Danh mục con chi tiết
  updatedAt: string;
}

// 7. Mặt hàng ve chai trong đơn thu gom
export interface OrderItem {
  categoryId: string;
  categoryName: string;
  subItemId: string;
  subItemName: string;
  estimatedWeight: number; // Khối lượng ước tính (kg)
  unitPrice: number; // Giá thỏa thuận (VNĐ/kg)
  totalPrice: number;
}

// 8. Trạng thái đơn thu gom
export type OrderStatus = 
  | 'pending'    // Người bán vừa tạo đơn, đang chờ người mua tiếp nhận
  | 'accepted'   // Người mua đã nhận đơn, đang trên đường đến
  | 'arrived'    // Người mua đã đến nơi, đang phân loại và cân
  | 'completed'  // Đã thanh toán và hoàn tất giao dịch
  | 'cancelled'  // Bị hủy
  | 'disputed';  // Đang có tranh chấp khiếu nại

// 9. Đơn yêu cầu thu gom ve chai
export interface ScrapOrder {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerAvatar: string;
  sellerLocation: GeoLocation;
  
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAvatar?: string;
  buyerLocation?: GeoLocation;

  items: OrderItem[];
  totalEstimatedWeight: number; // Tổng kg ước tính
  totalActualWeight?: number;   // Tổng kg cân thực tế
  estimatedValue: number;       // Tổng tiền ước tính (VNĐ)
  finalAmount?: number;         // Tổng tiền thực tế sau khi cân (VNĐ)
  
  images: string[];             // Ảnh chụp phế liệu thực tế
  notes: string;                // Ghi chú của người bán
  pickupScheduledAt: string;    // Thời gian hẹn thu gom
  status: OrderStatus;
  paymentMethod: 'cash' | 'direct_bank'; // Hai bên tự thanh toán trực tiếp với nhau (tiền mặt hoặc chuyển khoản)
  paymentStatus: 'unpaid' | 'paid';
  
  createdAt: string;
  completedAt?: string;
}

// 10. Tin nhắn trò chuyện trực tiếp (Live Chat)
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  image?: string;
  timestamp: string;
  isOffer?: boolean; // Đề xuất giá hoặc lịch hẹn đặc biệt
  offerData?: {
    suggestedPrice?: number;
    pickupTime?: string;
    accepted?: boolean;
  };
}

// 11. Cuộc hội thoại giữa 2 người dùng
export interface Conversation {
  id: string;
  orderId?: string;
  participantIds: [string, string];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: { [userId: string]: number };
  messages: ChatMessage[];
}

// 12. Đánh giá uy tín sau giao dịch
export interface Review {
  id: string;
  orderId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserRole: UserRole;
  toUserId: string;
  toUserName: string;
  rating: number; // 1 - 5 sao
  criteria: {
    accurateWeight: boolean; // Cân đúng khối lượng
    punctual: boolean;      // Đúng giờ hẹn
    fairPrice: boolean;     // Giá cả công bằng, đúng thỏa thuận
    polite: boolean;        // Lịch sự, vui vẻ
  };
  comment: string;
  createdAt: string;
}

// 13. Giao dịch ví điện tử
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'payment_in' | 'payment_out';
  amount: number;
  description: string;
  orderId?: string;
  method: 'momo' | 'zalopay' | 'vietqr' | 'bank' | 'wallet_internal';
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

// 14. Tranh chấp khiếu nại (Admin xử lý)
export interface Dispute {
  id: string;
  orderId: string;
  reporterId: string;
  reporterName: string;
  reporterRole: UserRole;
  accusedId: string;
  accusedName: string;
  accusedRole: UserRole;
  reason: 'wrong_weight' | 'no_show' | 'price_cheat' | 'attitude' | 'other';
  reasonText: string;
  evidenceImages: string[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolutionNote?: string;
  createdAt: string;
}

// 15. Cảnh báo hoạt động bất thường (Hệ thống AI / Giám sát gian lận)
export interface AbnormalActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  severity: 'low' | 'medium' | 'high';
  type: 'frequent_cancellation' | 'price_anomaly' | 'suspicious_location' | 'multiple_disputes';
  description: string;
  timestamp: string;
  resolved: boolean;
}

// 16. Thông báo đẩy / Thông báo nội bộ
export interface SystemNotification {
  id: string;
  userId?: string; // Nếu undefined thì là thông báo toàn hệ thống
  title: string;
  message: string;
  type: 'order' | 'chat' | 'wallet' | 'kyc' | 'system';
  linkTarget?: string;
  isRead: boolean;
  createdAt: string;
}

// 17. Thông báo thu mua phế liệu lưu động theo Tỉnh / Thành Phố (Ban Quản Trị phát hành)
export interface CityAnnouncement {
  id: string;
  title: string;              // Tiêu đề chạy chữ ngắn gọn trên trang chính
  content: string;            // Nội dung chi tiết (địa bàn, chính sách, hướng dẫn)
  city: string;               // Tên Tỉnh / Thành phố ('TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Toàn quốc'...)
  district?: string;          // Quận / Huyện trọng điểm
  pickupDate: string;         // Ngày đoàn thu gom đến (vd: 25/10/2026)
  contactPhone: string;       // Hotline đoàn xe / ban quản trị
  scrapTypes: string[];       // Loại phế liệu ưu tiên (vd: ['Nhôm lon', 'Đồng', 'Nhựa PET', 'Ắc quy'])
  priceBonus?: string;        // Chính sách ưu đãi (vd: "Thu mua giá cao hơn 10% - Cân điện tử chuẩn tại chỗ")
  authorName: string;         // Người đăng (Ban Quản Trị VeChaiXanh)
  isActive: boolean;          // Bật / tắt dải chạy chữ trên trang chính
  sendDirectMessage?: boolean;// Tự động gửi tin nhắn đến cư dân thành phố
  recipientCount?: number;    // Số thành viên thuộc thành phố đã nhận được thông báo
  createdAt: string;
}

// 18. Thông báo đẩy thời gian thực (Push Notification)
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  targetRole?: 'all' | 'seller' | 'buyer';
  targetCity?: string;
  urgency?: 'normal' | 'high';
  url?: string;
  timestamp: string;
  icon?: string;
}

