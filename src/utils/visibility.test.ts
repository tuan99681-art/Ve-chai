/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests cho các quy tắc hiển thị bản đồ & quyền riêng tư của VeChaiXanh:
 * 1. Người bán chỉ thấy 1 người mua duy nhất gần nhất
 * 2. Người mua chỉ thấy người bán đang đăng bán món hàng (mua bán xong thì ẩn đi)
 * 3. Quản trị viên thấy toàn bộ người mua và người bán
 */
import test from 'node:test';
import assert from 'node:assert/strict';

interface User {
  id: string;
  name: string;
  role: 'seller' | 'buyer' | 'admin';
  distanceKm: number;
}

interface Order {
  id: string;
  sellerId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

function hasActiveScrapListing(sellerId: string, orders: Order[]): boolean {
  return orders.some(o => o.sellerId === sellerId && (o.status === 'pending' || o.status === 'accepted'));
}

function getVisibleUsers(currentUser: User, allUsers: User[], orders: Order[]) {
  const others = allUsers.filter(u => u.id !== currentUser.id);

  // 1. NGƯỜI BÁN: Chỉ hiển thị ĐÚNG 1 người mua duy nhất gần nhất!
  if (currentUser.role === 'seller') {
    const buyers = others.filter(u => u.role === 'buyer').sort((a, b) => a.distanceKm - b.distanceKm);
    return buyers.length > 0 ? [buyers[0]] : [];
  }

  // 2. QUẢN TRỊ VIÊN: Nhìn thấy HẾT tất cả người mua và người bán
  if (currentUser.role === 'admin') {
    return others;
  }

  // 3. NGƯỜI THU MUA: Chỉ nhìn thấy người bán ĐANG CÓ MÓN HÀNG ĐĂNG BÁN
  if (currentUser.role === 'buyer') {
    return others.filter(u => u.role === 'seller' && hasActiveScrapListing(u.id, orders));
  }

  return [];
}

test('Seller sees only 1 single nearest buyer', () => {
  const seller: User = { id: 's1', name: 'Chị Lan', role: 'seller', distanceKm: 0 };
  const allUsers: User[] = [
    seller,
    { id: 'b1', name: 'Chú Bảy (1.2km)', role: 'buyer', distanceKm: 1.2 },
    { id: 'b2', name: 'Anh Tuấn (3.5km)', role: 'buyer', distanceKm: 3.5 },
    { id: 'b3', name: 'Vựa Hòa Bình (5.0km)', role: 'buyer', distanceKm: 5.0 },
    { id: 's2', name: 'Cô Hoa', role: 'seller', distanceKm: 0.5 }
  ];
  const orders: Order[] = [];

  const visible = getVisibleUsers(seller, allUsers, orders);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, 'b1');
  assert.equal(visible[0].name, 'Chú Bảy (1.2km)');
});

test('Buyer only sees sellers who have active scrap listings', () => {
  const buyer: User = { id: 'b1', name: 'Chú Bảy', role: 'buyer', distanceKm: 0 };
  const allUsers: User[] = [
    buyer,
    { id: 's1', name: 'Chị Lan (có ve chai đăng bán)', role: 'seller', distanceKm: 1.2 },
    { id: 's2', name: 'Anh Tuấn (đã bán xong)', role: 'seller', distanceKm: 2.0 },
    { id: 's3', name: 'Cô Hoa (chưa đăng bán gì)', role: 'seller', distanceKm: 0.8 },
  ];

  const orders: Order[] = [
    { id: 'ord-1', sellerId: 's1', status: 'pending' },    // s1 đang có hàng bán
    { id: 'ord-2', sellerId: 's2', status: 'completed' },  // s2 đã bán xong
  ];

  const visible = getVisibleUsers(buyer, allUsers, orders);
  // Chỉ s1 được hiển thị, s2 và s3 bị ẩn!
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, 's1');
});

test('When transaction completes, seller location is automatically hidden from buyers', () => {
  const buyer: User = { id: 'b1', name: 'Chú Bảy', role: 'buyer', distanceKm: 0 };
  const allUsers: User[] = [
    buyer,
    { id: 's1', name: 'Chị Lan', role: 'seller', distanceKm: 1.2 },
  ];

  // Trước khi bán xong: đơn đang pending
  let orders: Order[] = [{ id: 'ord-1', sellerId: 's1', status: 'pending' }];
  let visible = getVisibleUsers(buyer, allUsers, orders);
  assert.equal(visible.length, 1);

  // Sau khi người mua đến cân và thanh toán xong: đơn chuyển sang completed
  orders = [{ id: 'ord-1', sellerId: 's1', status: 'completed' }];
  visible = getVisibleUsers(buyer, allUsers, orders);
  // Vị trí người bán lập tức bị ẩn!
  assert.equal(visible.length, 0);
});

test('Admin sees all members (both buyers and sellers)', () => {
  const admin: User = { id: 'admin', name: 'Ban Quản Trị', role: 'admin', distanceKm: 0 };
  const allUsers: User[] = [
    admin,
    { id: 's1', name: 'Chị Lan', role: 'seller', distanceKm: 1.2 },
    { id: 's2', name: 'Anh Tuấn', role: 'seller', distanceKm: 2.0 },
    { id: 'b1', name: 'Chú Bảy', role: 'buyer', distanceKm: 3.0 },
    { id: 'b2', name: 'Vựa Hòa Bình', role: 'buyer', distanceKm: 5.0 },
  ];
  const orders: Order[] = [];

  const visible = getVisibleUsers(admin, allUsers, orders);
  assert.equal(visible.length, 4);
});
