/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dữ liệu khởi tạo (Seed Data) cho nền tảng VeChaiXanh
 * Bao gồm: Danh mục phế liệu chi tiết (Mục chính & mục con),
 * Người bán, Người mua (xe ba gác, vựa phế liệu), Đơn thu gom mẫu,
 * Tin nhắn, Đánh giá uy tín, Lịch sử ví điện tử, Tranh chấp & Cảnh báo bất thường.
 */

import {
  ScrapCategory,
  UserProfile,
  ScrapOrder,
  Conversation,
  Review,
  WalletTransaction,
  Dispute,
  AbnormalActivityLog,
  SystemNotification,
  CityAnnouncement
} from '../types';

// ==========================================
// 1. DANH MỤC VẬT PHẨM VE CHAI & PHÂN LOẠI CON
// ==========================================
export const INITIAL_CATEGORIES: ScrapCategory[] = [
  {
    id: 'cat-plastic',
    code: 'plastic',
    name: 'Nhựa Phế Liệu',
    iconName: 'Package',
    color: '#059669', // Emerald
    description: 'Chai nhựa nước ngọt, bình can nhựa, nhựa gia dụng, nhựa dẻo và nhựa cứng.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-plastic-pet',
        name: 'Chai nhựa PET trong suốt (nước ngọt, nước khoáng)',
        unit: 'kg',
        currentPrice: 8500,
        priceMin: 7500,
        priceMax: 9500,
        priceChange: 'up',
        description: 'Chai PET sạch, tháo nhãn mác và ép xẹp sẽ được giá cao hơn.',
        tips: 'Bỏ nắp và dẫm bẹp để tiết kiệm diện tích và tăng giá trị cân.'
      },
      {
        id: 'sub-plastic-hdpe',
        name: 'Nhựa HDPE bình can (nước giặt, sữa, can dầu)',
        unit: 'kg',
        currentPrice: 11000,
        priceMin: 9500,
        priceMax: 12500,
        priceChange: 'stable',
        description: 'Nhựa đục cứng cáp, ký hiệu số 2 dưới đáy can.',
        tips: 'Tráng sơ qua nước nếu can dính dầu nhớt để tránh bị trừ tạp chất.'
      },
      {
        id: 'sub-plastic-pp',
        name: 'Nhựa PP gia dụng (thau, xô, rổ rá gãy vỡ)',
        unit: 'kg',
        currentPrice: 7000,
        priceMin: 6000,
        priceMax: 8000,
        priceChange: 'stable',
        description: 'Đồ dùng nhựa nhà bếp, thau chậu hư hỏng.',
        tips: 'Tách riêng nhựa dẻo và nhựa cứng để người thu gom tính giá tốt nhất.'
      },
      {
        id: 'sub-plastic-pvc',
        name: 'Ống nhựa PVC / tấm nhựa xây dựng',
        unit: 'kg',
        currentPrice: 5500,
        priceMin: 4500,
        priceMax: 6500,
        priceChange: 'down',
        description: 'Ống dẫn nước cứng, ống luồn dây điện thanh lý.',
        tips: 'Cắt khúc ngắn 1m để dễ vận chuyển bằng xe ba gác.'
      }
    ]
  },
  {
    id: 'cat-aluminum',
    code: 'aluminum',
    name: 'Nhôm Phế Liệu',
    iconName: 'Layers',
    color: '#0284c7', // Sky Blue
    description: 'Lon bia, nhôm đặc Xingfa, nhôm đà, nồi chảo và nhôm dẻo vụn.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-alum-cans',
        name: 'Lon bia, lon nước ngọt nhôm',
        unit: 'kg',
        currentPrice: 28000,
        priceMin: 26000,
        priceMax: 30000,
        priceChange: 'up',
        description: 'Khoảng 65-70 lon bia rỗng được 1kg nhôm lon sạch.',
        tips: 'Dập bẹp lon để dễ đóng bao tải và đạt khối lượng chuẩn.'
      },
      {
        id: 'sub-alum-xingfa',
        name: 'Nhôm thanh đặc Xingfa / nhôm định hình cửa kính',
        unit: 'kg',
        currentPrice: 48000,
        priceMin: 44000,
        priceMax: 52000,
        priceChange: 'up',
        description: 'Khung nhôm cửa sổ, cửa kính loại sạch không lẫn sắt/keo.',
        tips: 'Tách ốc vít thép và gioăng cao su sẽ được giá loại 1 cao nhất.'
      },
      {
        id: 'sub-alum-cast',
        name: 'Nhôm đúc, nồi xoong chảo nhôm cũ',
        unit: 'kg',
        currentPrice: 38000,
        priceMin: 35000,
        priceMax: 42000,
        priceChange: 'stable',
        description: 'Vật dụng nấu nướng nhôm gia đình hư hỏng.',
        tips: 'Tháo quai nhựa chống nóng trước khi bán.'
      },
      {
        id: 'sub-alum-scraps',
        name: 'Nhôm vụn, mạt cưa phoi nhôm gia công',
        unit: 'kg',
        currentPrice: 22000,
        priceMin: 19000,
        priceMax: 25000,
        priceChange: 'down',
        description: 'Phoi nhôm tiện, phay từ xưởng cơ khí.',
        tips: 'Tránh để dính nước hoặc bùn đất.'
      }
    ]
  },
  {
    id: 'cat-copper',
    code: 'copper',
    name: 'Đồng Phế Liệu (Giá Cao)',
    iconName: 'Flame',
    color: '#ea580c', // Orange Red
    description: 'Đồng cáp đỏ nguyên chất, đồng vàng thau, đồng motor và ống đồng máy lạnh.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-copper-cable1',
        name: 'Đồng cáp đỏ loại 1 (lõi to, không pha tạp)',
        unit: 'kg',
        currentPrice: 265000,
        priceMin: 255000,
        priceMax: 280000,
        priceChange: 'up',
        description: 'Dây cáp điện lực cỡ lớn, ruột đồng sáng bóng dày >2mm.',
        tips: 'Tuốt sạch vỏ nhựa cách điện để được thu mua với giá đỉnh thị trường.'
      },
      {
        id: 'sub-copper-brass',
        name: 'Đồng vàng / đồng thau (van vòi, phụ kiện máy móc)',
        unit: 'kg',
        currentPrice: 175000,
        priceMin: 165000,
        priceMax: 190000,
        priceChange: 'stable',
        description: 'Van nước đồng, khóa cửa đồng cũ, chân đèn đồng.',
        tips: 'Dùng nam châm thử: đồng thật không hút nam châm.'
      },
      {
        id: 'sub-copper-motor',
        name: 'Đồng motor cuộn biến áp & quạt điện hỏng',
        unit: 'kg',
        currentPrice: 195000,
        priceMin: 185000,
        priceMax: 210000,
        priceChange: 'up',
        description: 'Dây đồng tráng men từ cuộn rotor máy bơm, quạt máy, biến thế.',
        tips: 'Đập rã vỏ thép lấy trọn cuộn dây đồng để người mua không trừ hao.'
      },
      {
        id: 'sub-copper-pipe',
        name: 'Ống đồng dẫn gas máy lạnh điều hòa',
        unit: 'kg',
        currentPrice: 210000,
        priceMin: 200000,
        priceMax: 225000,
        priceChange: 'stable',
        description: 'Ống đồng bảo ôn máy lạnh tháo dỡ sửa nhà.',
        tips: 'Cạo sạch lớp xốp bảo ôn màu đen/trắng bọc ngoài.'
      }
    ]
  },
  {
    id: 'cat-iron',
    code: 'iron',
    name: 'Sắt Thép & Inox',
    iconName: 'Wrench',
    color: '#475569', // Slate
    description: 'Sắt đặc, xà gồ, thép công trình, sắt vụn gia đình và Inox 304/201.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-iron-structural',
        name: 'Sắt đặc cây, thép hình I/U/V, xà gồ',
        unit: 'kg',
        currentPrice: 12500,
        priceMin: 11000,
        priceMax: 13500,
        priceChange: 'stable',
        description: 'Thép xây dựng còn thẳng hoặc đoạn ngắn dày chịu lực.',
        tips: 'Gom lại bó thành từng cuộn/bó gọn gàng.'
      },
      {
        id: 'sub-iron-scraps',
        name: 'Sắt vụn, sắt rỉ sét, vỏ đồ hộp thiếc',
        unit: 'kg',
        currentPrice: 8500,
        priceMin: 7500,
        priceMax: 9500,
        priceChange: 'down',
        description: 'Hàng rào cũ, lưới sắt rỉ sét, thùng phi sắt hỏng.',
        tips: 'Để nơi khô ráo tránh ngâm nước mưa làm giảm trọng lượng.'
      },
      {
        id: 'sub-iron-inox304',
        name: 'Inox 304 không gỉ cao cấp (bồn rửa, lan can)',
        unit: 'kg',
        currentPrice: 46000,
        priceMin: 42000,
        priceMax: 50000,
        priceChange: 'up',
        description: 'Inox không hút nam châm, sáng bóng, không hoen rỉ.',
        tips: 'Thử bằng nam châm để phân biệt rõ với Inox 201/hút nhẹ.'
      },
      {
        id: 'sub-iron-inox201',
        name: 'Inox 201 / Inox pha tạp gia dụng',
        unit: 'kg',
        currentPrice: 24000,
        priceMin: 21000,
        priceMax: 27000,
        priceChange: 'stable',
        description: 'Đồ dùng inox mỏng, rổ đũa giá rẻ có hút nhẹ nam châm.',
        tips: 'Tách riêng với Inox 304 để bán đúng giá.'
      }
    ]
  },
  {
    id: 'cat-paper',
    code: 'paper',
    name: 'Giấy & Bìa Carton',
    iconName: 'FileText',
    color: '#d97706', // Amber
    description: 'Thùng carton sóng, giấy trắng văn phòng A4, báo giấy, sách vở cũ.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-paper-carton',
        name: 'Bìa carton sóng dày (thùng đóng hàng, bưu phẩm)',
        unit: 'kg',
        currentPrice: 4200,
        priceMin: 3500,
        priceMax: 5000,
        priceChange: 'up',
        description: 'Thùng carton khô ráo, gấp phẳng.',
        tips: 'Tháo bỏ băng keo dính và dây nilon, không làm ướt giấy.'
      },
      {
        id: 'sub-paper-white',
        name: 'Giấy trắng văn phòng / Giấy A4 in một mặt thanh lý',
        unit: 'kg',
        currentPrice: 6500,
        priceMin: 5500,
        priceMax: 7500,
        priceChange: 'stable',
        description: 'Hồ sơ tài liệu, giấy photo A4 đã hủy, tài liệu công ty.',
        tips: 'Bỏ ghim bấm sắt và bìa kiếng để đạt giá tối đa.'
      },
      {
        id: 'sub-paper-books',
        name: 'Sách giáo khoa, vở học sinh, tạp chí',
        unit: 'kg',
        currentPrice: 4500,
        priceMin: 3800,
        priceMax: 5200,
        priceChange: 'stable',
        description: 'Sách báo tạp chí cũ không còn sử dụng.',
        tips: 'Xếp thành từng cọc buộc dây nilon chắc chắn.'
      },
      {
        id: 'sub-paper-newspaper',
        name: 'Báo giấy cũ các loại',
        unit: 'kg',
        currentPrice: 5000,
        priceMin: 4200,
        priceMax: 5800,
        priceChange: 'down',
        description: 'Báo giấy nhật báo, tuần báo sạch đẹp.',
        tips: 'Báo giấy trắng sạch được các vựa thu mua gói hàng chuộng.'
      }
    ]
  },
  {
    id: 'cat-battery',
    code: 'battery',
    name: 'Pin & Ắc Quy Cũ (Xử Lý An Toàn)',
    iconName: 'Zap',
    color: '#7c3aed', // Purple
    description: 'Bình ắc quy xe máy, ô tô hỏng, pin lithium xe điện, pin lưu điện UPS.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-bat-motor',
        name: 'Bình ắc quy xe máy hỏng (12V 4Ah - 7Ah)',
        unit: 'cái',
        currentPrice: 45000,
        priceMin: 40000,
        priceMax: 55000,
        priceChange: 'up',
        description: 'Bình khô hoặc bình nước xe máy Vision, Lead, Wave, Exciter.',
        tips: 'Giữ nguyên vỏ bình không làm nứt vỡ rò rỉ axit ra môi trường.'
      },
      {
        id: 'sub-bat-car',
        name: 'Bình ắc quy ô tô, xe tải, trạm viễn thông',
        unit: 'kg',
        currentPrice: 24000,
        priceMin: 22000,
        priceMax: 26000,
        priceChange: 'stable',
        description: 'Tính theo kg, chứa hàm lượng chì tái chế cao.',
        tips: 'Vận chuyển cẩn thận, không lật úp bình.'
      }
    ]
  },
  {
    id: 'cat-ewaste',
    code: 'ewaste',
    name: 'Rác Thải Điện Tử (Bo Mạch & Đồ Hỏng)',
    iconName: 'Cpu',
    color: '#0891b2', // Cyan
    description: 'Bo mạch máy tính mainboard, ram, quạt, tivi màn hình, máy lạnh cũ hỏng.',
    updatedAt: '2026-10-20',
    subItems: [
      {
        id: 'sub-ewaste-mainboard',
        name: 'Bo mạch máy tính, laptop, mainboard hỏng',
        unit: 'kg',
        currentPrice: 120000,
        priceMin: 90000,
        priceMax: 150000,
        priceChange: 'up',
        description: 'Chứa vi mạch mạ vàng, chip và linh kiện điện tử quý hiếm.',
        tips: 'Không cạy tháo linh kiện làm gãy gập bo.'
      },
      {
        id: 'sub-ewaste-appliance',
        name: 'Tủ lạnh, máy giặt, điều hòa cũ hỏng nguyên chiếc',
        unit: 'cái',
        currentPrice: 280000,
        priceMin: 200000,
        priceMax: 450000,
        priceChange: 'stable',
        description: 'Thiết bị gia dụng hỏng không sửa được bán thanh lý.',
        tips: 'Chụp hình đầy đủ nhãn mác để thợ thu mua định giá nhanh.'
      }
    ]
  }
];

// ==========================================
// 2. NGƯỜI DÙNG MẪU (BÁN, MUA, ADMIN)
// ==========================================
// Tọa độ trung tâm TP. Hồ Chí Minh
// Q.1: 10.7769, 106.7009
// Bình Thạnh: 10.8035, 106.7088
// Q.3: 10.7844, 106.6842
// Tân Bình: 10.8015, 106.6548
// Q. Phú Nhuận: 10.7992, 106.6800

export const INITIAL_USERS: UserProfile[] = [
  // 1. Quản trị viên
  {
    id: 'usr-admin-01',
    phone: '0909000999',
    fullName: 'Ban Quản Trị VeChaiXanh',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7769,
      lng: 106.7009,
      address: 'Trụ sở chính: Tòa nhà GreenHub, 45 Lê Duẩn, P. Bến Nghé, Quận 1, TP. HCM',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 5.0,
    totalTransactions: 9999,
    completionRate: 100,
    badges: ['Hệ Thống Trực Tuyến', 'Kiểm Duyệt Viên'],
    isOnline: true,
    createdAt: '2026-01-01'
  },

  // 2. Người Bán (Hộ gia đình, Văn phòng)
  {
    id: 'usr-seller-lan',
    phone: '0918123456',
    fullName: 'Chị Mai Lan (Hộ gia đình)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7885,
      lng: 106.6980,
      address: 'Số 72 Nguyễn Đình Chiểu, P. Đa Kao, Quận 1, TP. HCM',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.9,
    totalTransactions: 28,
    completionRate: 98,
    badges: ['Gia Đình Xanh', 'Phân Loại Chuẩn', 'Ý Thức Tốt 100%'],
    isOnline: true,
    createdAt: '2026-03-15'
  },
  {
    id: 'usr-seller-tuan',
    phone: '0987654321',
    fullName: 'Anh Quốc Tuấn (Văn phòng TechHub)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7745,
      lng: 106.7052,
      address: 'Lầu 6, Tòa nhà Bitexco, 2 Hải Triều, P. Bến Nghé, Quận 1, TP. HCM',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.8,
    totalTransactions: 15,
    completionRate: 95,
    badges: ['Doanh Nghiệp Tái Chế', 'Khối Lượng Lớn'],
    isOnline: true,
    createdAt: '2026-04-10'
  },
  {
    id: 'usr-seller-hoa',
    phone: '0933456789',
    fullName: 'Cô Kim Hoa (Chủ Quán Cơm Bình Dân)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.8010,
      lng: 106.7112,
      address: '218 Bạch Đằng, P. 24, Quận Bình Thạnh, TP. HCM',
      district: 'Bình Thạnh',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.7,
    totalTransactions: 42,
    completionRate: 96,
    badges: ['Gia Đình Xanh', 'Thân Thiện'],
    isOnline: true,
    createdAt: '2026-02-20'
  },

  // 3. Người Thu Mua (Xe ba gác, Vựa phế liệu, Người gom rong)
  {
    id: 'usr-buyer-bay',
    phone: '0903112233',
    fullName: 'Chú Bảy Ve Chai (Xe Ba Gác Lưu Động)',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7812,
      lng: 106.6925,
      address: 'Đang lưu động quanh khu vực Quận 1 & Quận 3 (Gần Chợ Tân Định)',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.95,
    totalTransactions: 312,
    completionRate: 99,
    badges: ['Cân Đúng Giá Tốt', 'Đến Nhanh 15 Phút', 'Thân Thiện Vui Vẻ', '15 Năm Kinh Nghiệm'],
    vehicleType: 'Xe ba gác máy có cân điện tử chuẩn',
    isOnline: true,
    createdAt: '2026-01-10'
  },
  {
    id: 'usr-buyer-thanhdat',
    phone: '0978999888',
    fullName: 'Vựa Phế Liệu Thành Đạt (Thu Mua Lớn)',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7930,
      lng: 106.6850,
      address: '456 Hoàng Sa, P. 8, Quận 3, TP. HCM',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.88,
    totalTransactions: 840,
    completionRate: 99,
    badges: ['Vựa Có Giấy Phép', 'Cân Xe Tải Lớn', 'Tự Thanh Toán Trực Tiếp'],
    vehicleType: 'Xe tải 1.5 tấn & 2.5 tấn',
    isOnline: true,
    createdAt: '2026-01-05'
  },
  {
    id: 'usr-buyer-nam',
    phone: '0938776655',
    fullName: 'Anh Nam Thu Gom Công Nghệ (Xe Bán Tải)',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.8080,
      lng: 106.6990,
      address: '88 Phan Đăng Lưu, P. 5, Quận Phú Nhuận, TP. HCM',
      district: 'Phú Nhuận',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.9,
    totalTransactions: 195,
    completionRate: 97,
    badges: ['Thu Gom Văn Phòng', 'Đúng Giờ Tuyệt Đối', 'Cân Điện Tử Cầm Tay'],
    vehicleType: 'Xe bán tải Ford Ranger chuyên chở văn phòng',
    isOnline: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'usr-buyer-conam',
    phone: '0912334455',
    fullName: 'Cô Năm Ve Chai (Xe Máy Thùng)',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 10.7985,
      lng: 106.6570,
      address: '15 Hoàng Hoa Thám, P. 13, Quận Tân Bình, TP. HCM',
      district: 'Tân Bình',
      city: 'TP. Hồ Chí Minh'
    },
    isPhoneVerified: true,
    reputationScore: 4.75,
    totalTransactions: 160,
    completionRate: 94,
    badges: ['Chăm Chỉ', 'Nhận Mọi Đơn Nhỏ'],
    vehicleType: 'Xe Honda Wave có gắn 2 thùng lớn',
    isOnline: true,
    createdAt: '2026-03-01'
  },

  // 4. Thành viên tại Thủ Đô Hà Nội
  {
    id: 'usr-seller-hn-huong',
    phone: '0988112233',
    fullName: 'Chị Thu Hương (Cầu Giấy, Hà Nội)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 21.0366,
      lng: 105.7942,
      address: 'Số 36 Cầu Giấy, P. Quan Hoa, Quận Cầu Giấy, Hà Nội',
      district: 'Cầu Giấy',
      city: 'Hà Nội'
    },
    isPhoneVerified: true,
    reputationScore: 4.9,
    totalTransactions: 35,
    completionRate: 98,
    badges: ['Gia Đình Xanh', 'Hà Nội Xanh', 'Phân Loại Chuẩn'],
    isOnline: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'usr-buyer-hn-thanglong',
    phone: '0919887766',
    fullName: 'Vựa Phế Liệu Thăng Long (Hà Nội)',
    role: 'buyer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 21.0341,
      lng: 105.8285,
      address: '102 Hoàng Hoa Thám, P. Ngọc Hà, Quận Ba Đình, Hà Nội',
      district: 'Ba Đình',
      city: 'Hà Nội'
    },
    isPhoneVerified: true,
    reputationScore: 4.92,
    totalTransactions: 420,
    completionRate: 99,
    badges: ['Cân Chuẩn Điện Tử', 'Xe Tải Thu Mua Tận Nhà', 'Thu Mua Giá Cao'],
    vehicleType: 'Xe tải nhẹ Suzuki 750kg',
    isOnline: true,
    createdAt: '2026-01-18'
  },

  // 5. Thành viên tại Đà Nẵng
  {
    id: 'usr-seller-dn-hung',
    phone: '0905334455',
    fullName: 'Anh Quang Hùng (Hải Châu, Đà Nẵng)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    location: {
      lat: 16.0544,
      lng: 108.2022,
      address: '78 Nguyễn Văn Linh, P. Nam Dương, Quận Hải Châu, Đà Nẵng',
      district: 'Hải Châu',
      city: 'Đà Nẵng'
    },
    isPhoneVerified: true,
    reputationScore: 4.85,
    totalTransactions: 19,
    completionRate: 96,
    badges: ['Gia Đình Xanh', 'Đà Nẵng Đáng Sống'],
    isOnline: true,
    createdAt: '2026-03-05'
  }
];

// ==========================================
// 3. ĐƠN THU GOM MẪU (SCRAP ORDERS)
// ==========================================
export const INITIAL_ORDERS: ScrapOrder[] = [
  {
    id: 'ORD-2026-001',
    sellerId: 'usr-seller-lan',
    sellerName: 'Chị Mai Lan (Hộ gia đình)',
    sellerPhone: '0918123456',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    sellerLocation: {
      lat: 10.7885,
      lng: 106.6980,
      address: '72 Nguyễn Đình Chiểu, P. Đa Kao, Quận 1',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    buyerId: 'usr-buyer-bay',
    buyerName: 'Chú Bảy Ve Chai (Xe Ba Gác Lưu Động)',
    buyerPhone: '0903112233',
    buyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    buyerLocation: {
      lat: 10.7812,
      lng: 106.6925,
      address: 'Chợ Tân Định, Quận 3',
      district: 'Quận 3'
    },
    items: [
      {
        categoryId: 'cat-paper',
        categoryName: 'Giấy & Bìa Carton',
        subItemId: 'sub-paper-carton',
        subItemName: 'Bìa carton sóng dày (thùng đóng hàng)',
        estimatedWeight: 25,
        unitPrice: 4200,
        totalPrice: 105000
      },
      {
        categoryId: 'cat-plastic',
        categoryName: 'Nhựa Phế Liệu',
        subItemId: 'sub-plastic-pet',
        subItemName: 'Chai nhựa PET trong suốt (nước ngọt, nước suối)',
        estimatedWeight: 12,
        unitPrice: 8500,
        totalPrice: 102000
      },
      {
        categoryId: 'cat-aluminum',
        categoryName: 'Nhôm Phế Liệu',
        subItemId: 'sub-alum-cans',
        subItemName: 'Lon bia, lon nước ngọt nhôm',
        estimatedWeight: 5,
        unitPrice: 28000,
        totalPrice: 140000
      }
    ],
    totalEstimatedWeight: 42,
    totalActualWeight: 43.5,
    estimatedValue: 347000,
    finalAmount: 360000,
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&auto=format&fit=crop&q=80'
    ],
    notes: 'Ve chai đã gom vào bao gọn gàng ở sân trước, có thể ghé sau 17h00.',
    pickupScheduledAt: '2026-10-21 17:30',
    status: 'completed',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    createdAt: '2026-10-20 09:15',
    completedAt: '2026-10-20 18:00'
  },
  {
    id: 'ORD-2026-002',
    sellerId: 'usr-seller-tuan',
    sellerName: 'Anh Quốc Tuấn (Văn phòng TechHub)',
    sellerPhone: '0987654321',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sellerLocation: {
      lat: 10.7745,
      lng: 106.7052,
      address: 'Lầu 6, Tòa nhà Bitexco, 2 Hải Triều, P. Bến Nghé, Quận 1',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    buyerId: 'usr-buyer-nam',
    buyerName: 'Anh Nam Thu Gom Công Nghệ (Xe Bán Tải)',
    buyerPhone: '0938776655',
    buyerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    buyerLocation: {
      lat: 10.8080,
      lng: 106.6990,
      address: '88 Phan Đăng Lưu, Phú Nhuận'
    },
    items: [
      {
        categoryId: 'cat-paper',
        categoryName: 'Giấy & Bìa Carton',
        subItemId: 'sub-paper-white',
        subItemName: 'Giấy trắng văn phòng / Giấy A4 in một mặt thanh lý',
        estimatedWeight: 150,
        unitPrice: 6500,
        totalPrice: 975000
      },
      {
        categoryId: 'cat-ewaste',
        categoryName: 'Rác Thải Điện Tử',
        subItemId: 'sub-ewaste-mainboard',
        subItemName: 'Bo mạch máy tính, laptop, mainboard hỏng',
        estimatedWeight: 8,
        unitPrice: 120000,
        totalPrice: 960000
      }
    ],
    totalEstimatedWeight: 158,
    estimatedValue: 1935000,
    images: [
      'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=500&auto=format&fit=crop&q=80'
    ],
    notes: 'Có thang máy chở hàng ở hầm B1, bảo vệ đã có danh sách đăng ký vào lấy đồ.',
    pickupScheduledAt: '2026-10-21 14:00',
    status: 'accepted',
    paymentMethod: 'direct_bank',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-20 15:30'
  },
  {
    id: 'ORD-2026-003',
    sellerId: 'usr-seller-hoa',
    sellerName: 'Cô Kim Hoa (Quán Cơm Bình Dân)',
    sellerPhone: '0933456789',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    sellerLocation: {
      lat: 10.8010,
      lng: 106.7112,
      address: '218 Bạch Đằng, P. 24, Quận Bình Thạnh',
      district: 'Bình Thạnh',
      city: 'TP. Hồ Chí Minh'
    },
    items: [
      {
        categoryId: 'cat-aluminum',
        categoryName: 'Nhôm Phế Liệu',
        subItemId: 'sub-alum-cans',
        subItemName: 'Lon bia, lon nước ngọt nhôm',
        estimatedWeight: 18,
        unitPrice: 28000,
        totalPrice: 504000
      },
      {
        categoryId: 'cat-plastic',
        categoryName: 'Nhựa Phế Liệu',
        subItemId: 'sub-plastic-hdpe',
        subItemName: 'Nhựa HDPE bình can (nước giặt, sữa, can dầu)',
        estimatedWeight: 22,
        unitPrice: 11000,
        totalPrice: 242000
      }
    ],
    totalEstimatedWeight: 40,
    estimatedValue: 746000,
    images: [
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=80'
    ],
    notes: 'Lon bia và can dầu đã gom sạch sẽ trong 3 bao tải lớn. Ai gần ghé lấy trong hôm nay giúp cô nhé!',
    pickupScheduledAt: '2026-10-21 10:00',
    status: 'pending', // Chờ người mua gần nhất bấm nhận đơn
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
    createdAt: '2026-10-20 20:00'
  }
];

// ==========================================
// 4. HỘI THOẠI TRÒ CHUYỆN (LIVE CHATS)
// ==========================================
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-01',
    orderId: 'ORD-2026-001',
    participantIds: ['usr-seller-lan', 'usr-buyer-bay'],
    lastMessage: 'Dạ chú Bảy cân chuẩn lắm ạ, cháu đã nhận tiền qua ví VeChaiPay rồi nhé!',
    lastMessageTime: '18:02',
    unreadCount: {
      'usr-seller-lan': 0,
      'usr-buyer-bay': 0
    },
    messages: [
      {
        id: 'msg-1',
        senderId: 'usr-seller-lan',
        senderName: 'Chị Mai Lan',
        senderRole: 'seller',
        text: 'Chào chú Bảy, nhà cháu có khoảng 40kg ve chai lon bia, giấy carton và chai nhựa, chú ghé được lúc 17h30 chiều nay không ạ?',
        timestamp: '16:00'
      },
      {
        id: 'msg-2',
        senderId: 'usr-buyer-bay',
        senderName: 'Chú Bảy Ve Chai',
        senderRole: 'buyer',
        text: 'Chào con gái! Được nha con, chú đang chạy xe ba gác gần chợ Đa Kao, tầm 17h20 chú tạt qua liền. Giá cả chú cân đúng theo niêm yết trên ứng dụng VeChaiXanh cho con an tâm.',
        timestamp: '16:05'
      },
      {
        id: 'msg-3',
        senderId: 'usr-buyer-bay',
        senderName: 'Chú Bảy Ve Chai',
        senderRole: 'buyer',
        text: 'Chú có cân điện tử bỏ túi kiểm định nhà nước đàng hoàng, tới nơi chú gọi con ra xem cân nhé.',
        timestamp: '16:06'
      },
      {
        id: 'msg-4',
        senderId: 'usr-seller-lan',
        senderName: 'Chị Mai Lan',
        senderRole: 'seller',
        text: 'Dạ vâng chú ơi, cháu cảm ơn chú nhiều!',
        timestamp: '16:08'
      },
      {
        id: 'msg-5',
        senderId: 'usr-buyer-bay',
        senderName: 'Chú Bảy Ve Chai',
        senderRole: 'buyer',
        text: 'Tổng đơn 43.5kg tròn 360.000đ chú đã chuyển vào ví ứng dụng cho con rồi nhé.',
        timestamp: '18:00'
      },
      {
        id: 'msg-6',
        senderId: 'usr-seller-lan',
        senderName: 'Chị Mai Lan',
        senderRole: 'seller',
        text: 'Dạ chú Bảy cân chuẩn lắm ạ, cháu đã nhận tiền qua ví VeChaiPay rồi nhé!',
        timestamp: '18:02'
      }
    ]
  },
  {
    id: 'conv-02',
    orderId: 'ORD-2026-002',
    participantIds: ['usr-seller-tuan', 'usr-buyer-nam'],
    lastMessage: 'Đã hẹn: Chiều mai 14h00 xe bán tải sẽ có mặt tại hầm B1 Bitexco.',
    lastMessageTime: '16:15',
    unreadCount: {
      'usr-seller-tuan': 0,
      'usr-buyer-nam': 0
    },
    messages: [
      {
        id: 'msg-21',
        senderId: 'usr-buyer-nam',
        senderName: 'Anh Nam Thu Gom Công Nghệ',
        senderRole: 'buyer',
        text: 'Chào anh Tuấn, bên em chuyên thu gom giấy A4 hủy bảo mật và linh kiện máy tính cũ cho các văn phòng. Chiều mai 14h00 bên em ghé nhé?',
        timestamp: '15:45'
      },
      {
        id: 'msg-22',
        senderId: 'usr-seller-tuan',
        senderName: 'Anh Quốc Tuấn',
        senderRole: 'seller',
        text: 'Ok anh Nam, bên anh có xuất biên nhận thu gom và cam kết tiêu hủy giấy tờ không?',
        timestamp: '15:55'
      },
      {
        id: 'msg-23',
        senderId: 'usr-buyer-nam',
        senderName: 'Anh Nam Thu Gom Công Nghệ',
        senderRole: 'buyer',
        text: 'Có đầy đủ biên bản bàn giao và cam kết nghiền bột giấy đạt chuẩn ISO anh nhé. Em mang sẵn hợp đồng đến luôn ạ.',
        timestamp: '16:05'
      },
      {
        id: 'msg-24',
        senderId: 'usr-seller-tuan',
        senderName: 'Anh Quốc Tuấn',
        senderRole: 'seller',
        text: 'Đã hẹn: Chiều mai 14h00 xe bán tải sẽ có mặt tại hầm B1 Bitexco.',
        timestamp: '16:15',
        isOffer: true,
        offerData: {
          pickupTime: '2026-10-21 14:00',
          accepted: true
        }
      }
    ]
  },
  // Hội thoại thông báo thu gom lưu động từ Ban Quản Trị đến thành viên Hà Nội
  {
    id: 'conv-admin-hn',
    participantIds: ['usr-admin-01', 'usr-seller-hn-huong'],
    lastMessage: '📢 Thông báo: Lịch thu mua phế liệu lưu động tại Hà Nội ngày 28/10/2026',
    lastMessageTime: '08:30',
    unreadCount: {
      'usr-seller-hn-huong': 1,
      'usr-admin-01': 0
    },
    messages: [
      {
        id: 'msg-adm-hn-1',
        senderId: 'usr-admin-01',
        senderName: 'Ban Quản Trị VeChaiXanh',
        senderRole: 'admin',
        text: '📢 [THÔNG BÁO LỊCH THU MUA PHẾ LIỆU LƯU ĐỘNG TẠI HÀ NỘI]\n\nKính gửi Quý thành viên Chị Thu Hương!\nBan Quản Trị VeChaiXanh xin thông báo: Vào ngày 28/10/2026, đoàn xe tải thu mua phế liệu lưu động của VeChaiXanh sẽ đến thu mua tận nơi tại khu vực Cầu Giấy & Ba Đình, Hà Nội.\n\n📦 Thu mua số lượng lớn: Bình ắc quy cũ, bo mạch máy tính, sắt thép, giấy carton và đồ nhựa gia dụng.\n🎁 Ưu đãi: Cân điện tử chuẩn xác, hỗ trợ bốc dỡ miễn phí, thanh toán tiền mặt trực tiếp trao tay!\n📞 Hotline điều phối đoàn xe Hà Nội: 0909000888.\n\nQuý thành viên có nhu cầu vui lòng chuẩn bị phế liệu hoặc đăng bán trên ứng dụng để xe ghé qua sớm nhất!',
        timestamp: '08:30'
      }
    ]
  },
  // Hội thoại thông báo thu gom lưu động từ Ban Quản Trị đến thành viên TP. Hồ Chí Minh
  {
    id: 'conv-admin-hcm',
    participantIds: ['usr-admin-01', 'usr-seller-lan'],
    lastMessage: '📢 Thông báo: Lịch xe thu mua lưu động tại TP. HCM ngày 25/10/2026',
    lastMessageTime: '08:00',
    unreadCount: {
      'usr-seller-lan': 1,
      'usr-admin-01': 0
    },
    messages: [
      {
        id: 'msg-adm-hcm-1',
        senderId: 'usr-admin-01',
        senderName: 'Ban Quản Trị VeChaiXanh',
        senderRole: 'admin',
        text: '📢 [THÔNG BÁO LỊCH THU MUA PHẾ LIỆU TẬN NƠI TẠI TP. HỒ CHÍ MINH]\n\nKính gửi Chị Mai Lan và thành viên khu vực TP. HCM!\nBan Quản Trị xin thông báo: Ngày 25/10/2026, đoàn xe thu gom lưu động VeChaiXanh sẽ đến thu gom tận nhà tại Quận 1, Quận 3 & Bình Thạnh.\n\n📦 Ưu tiên: Vỏ lon nhôm bia, đồ đồng, bình can nhựa và giấy phế liệu.\n🎁 Giá thu mua cao hơn thị trường 10%, cân điện tử chuẩn kiểm định, thanh toán tiền mặt tại chỗ!\n📞 Hotline hỗ trợ: 0909000999.\n\nChị có thể bấm Đăng Đơn trên ứng dụng để người mua đến nhận đơn ngay nhé!',
        timestamp: '08:00'
      }
    ]
  }
];

// ==========================================
// 5. ĐÁNH GIÁ UY TÍN (REVIEWS)
// ==========================================
export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    orderId: 'ORD-2026-001',
    fromUserId: 'usr-seller-lan',
    fromUserName: 'Chị Mai Lan',
    fromUserRole: 'seller',
    toUserId: 'usr-buyer-bay',
    toUserName: 'Chú Bảy Ve Chai',
    rating: 5,
    criteria: {
      accurateWeight: true,
      punctual: true,
      fairPrice: true,
      polite: true
    },
    comment: 'Chú Bảy rất đúng giờ, xe ba gác sạch sẽ, cân điện tử công khai rõ ràng từng ký. Chú còn hướng dẫn cách phân loại chai PET để lần sau bán giá cao hơn. Chắc chắn sẽ tiếp tục ủng hộ chú!',
    createdAt: '2026-10-20 18:10'
  },
  {
    id: 'rev-02',
    orderId: 'ORD-2026-001',
    fromUserId: 'usr-buyer-bay',
    fromUserName: 'Chú Bảy Ve Chai',
    fromUserRole: 'buyer',
    toUserId: 'usr-seller-lan',
    toUserName: 'Chị Mai Lan',
    rating: 5,
    criteria: {
      accurateWeight: true,
      punctual: true,
      fairPrice: true,
      polite: true
    },
    comment: 'Gia đình chị Lan gom phế liệu rất có tâm, giấy carton ép gọn, lon bia khô ráo không đọng nước. Giao dịch rất nhanh chóng và vui vẻ!',
    createdAt: '2026-10-20 18:15'
  }
];

// ==========================================
// 6. GIAO DỊCH VÍ ĐIỆN TỬ (WALLET TRANSACTIONS)
// ==========================================
export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'WT-2026-101',
    userId: 'usr-seller-lan',
    type: 'payment_in',
    amount: 360000,
    description: 'Nhận tiền bán ve chai đơn ORD-2026-001 từ Chú Bảy Ve Chai',
    orderId: 'ORD-2026-001',
    method: 'wallet_internal',
    status: 'success',
    createdAt: '2026-10-20 18:00'
  },
  {
    id: 'WT-2026-102',
    userId: 'usr-buyer-bay',
    type: 'payment_out',
    amount: 360000,
    description: 'Thanh toán tiền thu mua ve chai đơn ORD-2026-001 cho Chị Mai Lan',
    orderId: 'ORD-2026-001',
    method: 'wallet_internal',
    status: 'success',
    createdAt: '2026-10-20 18:00'
  },
  {
    id: 'WT-2026-103',
    userId: 'usr-buyer-bay',
    type: 'deposit',
    amount: 5000000,
    description: 'Nạp tiền vào ví VeChaiPay qua VietQR (Ngân hàng Vietcombank)',
    method: 'vietqr',
    status: 'success',
    createdAt: '2026-10-19 08:30'
  }
];

// ==========================================
// 7. TRANH CHẤP KHIẾU NẠI (ADMIN XỬ LÝ)
// ==========================================
export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'DSP-2026-01',
    orderId: 'ORD-2026-PREV',
    reporterId: 'usr-seller-hoa',
    reporterName: 'Cô Kim Hoa',
    reporterRole: 'seller',
    accusedId: 'usr-buyer-conam',
    accusedName: 'Cô Năm Ve Chai',
    accusedRole: 'buyer',
    reason: 'wrong_weight',
    reasonText: 'Người mua nghi ngờ cân thiếu 3kg so với cân mẫu tại quán ăn, đề nghị ban quản trị kiểm tra chuẩn cân.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=500&auto=format&fit=crop&q=80'
    ],
    status: 'investigating',
    resolutionNote: 'Đã liên hệ cả hai bên kiểm định lại cân điện tử ngày 22/10.',
    createdAt: '2026-10-18 11:20'
  }
];

// ==========================================
// 8. CẢNH BÁO BẤT THƯỜNG (FRAUD / ANOMALIES)
// ==========================================
export const INITIAL_ANOMALIES: AbnormalActivityLog[] = [
  {
    id: 'ANOM-01',
    userId: 'usr-anon-99',
    userName: 'Thành viên mới (0945***123)',
    userRole: 'buyer',
    severity: 'medium',
    type: 'frequent_cancellation',
    description: 'Tài khoản nhận 4 đơn thu gom liên tiếp rồi bấm hủy trong 30 phút mà không đưa ra lý do.',
    timestamp: '2026-10-20 14:10',
    resolved: false
  },
  {
    id: 'ANOM-02',
    userId: 'usr-anon-88',
    userName: 'Người bán khu vực Q.7 (0902***888)',
    userRole: 'seller',
    severity: 'low',
    type: 'suspicious_location',
    description: 'Tọa độ GPS đăng tải đơn thu gom cách xa địa chỉ đăng ký khai báo 18km.',
    timestamp: '2026-10-20 11:45',
    resolved: true
  }
];

// ==========================================
// 9. THÔNG BÁO TỰ ĐỘNG & NỘI BỘ
// ==========================================
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Đơn thu gom hoàn tất!',
    message: 'Bạn đã hoàn tất giao dịch đơn ORD-2026-001. Hãy để lại đánh giá uy tín để nhận thêm 50 điểm xanh nhé!',
    type: 'order',
    isRead: false,
    createdAt: '2026-10-20 18:02'
  },
  {
    id: 'notif-2',
    title: 'Giá nhôm lon hôm nay tăng!',
    message: 'Giá thu mua nhôm lon bia tăng +2.000đ/kg lên mức 28.000đ/kg. Tranh thủ bán ngay hôm nay!',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-20 08:00'
  },
  {
    id: 'notif-3',
    title: 'Xác thực tài khoản thành công',
    message: 'Tài khoản của bạn đã được Admin phê duyệt định danh KYC mức độ 2 (Huy hiệu xanh chính chủ).',
    type: 'kyc',
    isRead: true,
    createdAt: '2026-10-18 10:00'
  }
];

// ==========================================
// 10. THÔNG BÁO THU GOM PHẾ LIỆU THEO TỈNH / THÀNH PHỐ
// (Hiển thị chạy chữ trên trang chính cho đúng tỉnh thành)
// ==========================================
export const INITIAL_CITY_ANNOUNCEMENTS: CityAnnouncement[] = [
  {
    id: 'annom-hcm-01',
    title: 'Đoàn xe thu mua lưu động VeChaiXanh sẽ đến Quận 1, Quận 3 & Bình Thạnh vào ngày 25/10/2026!',
    content: 'Ban quản trị thông báo: Ngày 25/10/2026, đoàn xe thu gom lưu động chuyên dụng của VeChaiXanh sẽ đến thu mua tận nơi tại TP. Hồ Chí Minh. Ưu tiên thu gom vỏ lon nhôm bia, đồ đồng nguyên chất, nhựa cứng gia dụng và bo mạch máy tính cũ với giá cao hơn thị trường 10%. Trang bị cân điện tử tiêu chuẩn, thanh toán tiền mặt trực tiếp dứt điểm tại nhà!',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1, Quận 3, Bình Thạnh, Phú Nhuận',
    pickupDate: '25/10/2026',
    contactPhone: '0909000999',
    scrapTypes: ['Nhôm Lon', 'Đồng', 'Nhựa PET/HDPE', 'Giấy Carton', 'Pin Ắc Quy'],
    priceBonus: 'Cân điện tử chuẩn xác, tặng thêm 10% tổng giá trị đơn hàng',
    authorName: 'Ban Quản Trị VeChaiXanh',
    isActive: true,
    sendDirectMessage: true,
    recipientCount: 6,
    createdAt: '2026-10-21 08:00'
  },
  {
    id: 'annom-hn-01',
    title: 'Chiến dịch thu gom phế liệu tại Ba Đình & Cầu Giấy - Hà Nội vào ngày 28/10/2026!',
    content: 'Thông báo dành riêng cho thành viên tại Thủ Đô Hà Nội: Ban quản trị tổ chức đội xe tải thu mua phế liệu lưu động vào ngày 28/10/2026 tại khu vực Cầu Giấy, Ba Đình, Đống Đa. Thu mua số lượng lớn bình ắc quy cũ, bo mạch máy tính văn phòng, sắt thép và nhựa thanh lý. Hỗ trợ bốc xếp tầng cao miễn phí, cân điện tử tại chỗ!',
    city: 'Hà Nội',
    district: 'Cầu Giấy, Ba Đình, Đống Đa',
    pickupDate: '28/10/2026',
    contactPhone: '0909000888',
    scrapTypes: ['Sắt Thép', 'Bo Mạch', 'Pin Ắc Quy', 'Giấy Văn Phòng', 'Nhựa'],
    priceBonus: 'Hỗ trợ bốc dỡ miễn phí, thanh toán tiền mặt trao tay dứt điểm',
    authorName: 'Ban Quản Trị VeChaiXanh',
    isActive: true,
    sendDirectMessage: true,
    recipientCount: 2,
    createdAt: '2026-10-21 08:30'
  },
  {
    id: 'annom-dn-01',
    title: 'Ngày hội phân loại & thu mua ve chai quận Hải Châu - Đà Nẵng ngày 30/10/2026!',
    content: 'Ban quản trị thông báo thu gom ve chai tại khu vực Hải Châu & Thanh Khê - TP. Đà Nẵng vào ngày 30/10/2026. Nhận thu mua tất cả các loại lon bia, chai nhựa PET và giấy carton gia đình. Cân đúng giá niêm yết, cam kết chuẩn chỉnh.',
    city: 'Đà Nẵng',
    district: 'Hải Châu, Thanh Khê',
    pickupDate: '30/10/2026',
    contactPhone: '0909000777',
    scrapTypes: ['Nhựa PET', 'Lon Nhôm', 'Giấy Carton'],
    priceBonus: 'Tặng túi phân loại rác tái chế thân thiện môi trường',
    authorName: 'Ban Quản Trị VeChaiXanh',
    isActive: true,
    sendDirectMessage: true,
    recipientCount: 1,
    createdAt: '2026-10-21 09:00'
  }
];
