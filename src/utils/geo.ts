/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tiện ích tính toán khoảng cách địa lý (Haversine Formula) & định vị GPS
 * Dành cho người mua và người bán ve chai
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Tính khoảng cách đường chim bay giữa 2 tọa độ GPS theo công thức Haversine
 * @param coord1 Điểm xuất phát { lat, lng }
 * @param coord2 Điểm đến { lat, lng }
 * @returns Khoảng cách theo đơn vị Kilomet (km), làm tròn 2 chữ số thập phân
 */
export function calculateHaversineDistance(coord1: LatLng, coord2: LatLng): number {
  if (coord1.lat === coord2.lat && coord1.lng === coord2.lng) {
    return 0;
  }

  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const lat1Rad = toRad(coord1.lat);
  const lat2Rad = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Định dạng hiển thị khoảng cách thân thiện:
 * Dưới 1km hiển thị mét (VD: "650 m"), trên 1km hiển thị km (VD: "2.4 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Ước tính thời gian di chuyển bằng xe máy hoặc xe ba gác (vận tốc trung bình ~25 km/h trong nội thành)
 */
export function estimateTravelTimeMinutes(distanceKm: number): number {
  const averageSpeedKmH = 25;
  const timeInHours = distanceKm / averageSpeedKmH;
  const minutes = Math.round(timeInHours * 60);
  return Math.max(5, minutes); // Tối thiểu 5 phút
}

/**
 * Lọc danh sách theo bán kính (bán kính tối đa in km)
 */
export function isWithinRadius(userLoc: LatLng, targetLoc: LatLng, radiusKm: number): boolean {
  const dist = calculateHaversineDistance(userLoc, targetLoc);
  return dist <= radiusKm;
}

/**
 * Định dạng tiền tệ Việt Nam Đồng (VNĐ)
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Danh sách các Tỉnh / Thành Phố trọng điểm thu gom phế liệu
 */
export const POPULAR_CITIES = [
  'Toàn quốc',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Bình Dương',
  'Đồng Nai',
  'Bà Rịa - Vũng Tàu',
  'Quảng Ninh'
];

/**
 * Chuẩn hóa tên thành phố để so khớp chính xác
 */
export function normalizeCityName(city?: string): string {
  if (!city) return '';
  const lower = city.toLowerCase().trim();
  if (lower.includes('hồ chí minh') || lower.includes('hcm') || lower.includes('sài gòn') || lower.includes('saigon')) {
    return 'TP. Hồ Chí Minh';
  }
  if (lower.includes('hà nội') || lower.includes('ha noi')) {
    return 'Hà Nội';
  }
  if (lower.includes('đà nẵng') || lower.includes('da nang')) {
    return 'Đà Nẵng';
  }
  if (lower.includes('hải phòng') || lower.includes('hai phong')) {
    return 'Hải Phòng';
  }
  if (lower.includes('cần thơ') || lower.includes('can tho')) {
    return 'Cần Thơ';
  }
  if (lower.includes('bình dương') || lower.includes('binh duong')) {
    return 'Bình Dương';
  }
  if (lower.includes('đồng nai') || lower.includes('dong nai')) {
    return 'Đồng Nai';
  }
  if (lower.includes('vũng tàu') || lower.includes('vung tau')) {
    return 'Bà Rịa - Vũng Tàu';
  }
  if (lower.includes('quảng ninh') || lower.includes('quang ninh')) {
    return 'Quảng Ninh';
  }
  return city.trim();
}

/**
 * Kiểm tra xem người dùng có thuộc Tỉnh/Thành phố mục tiêu hay không
 */
export function isUserInCity(
  userCity: string | undefined,
  userAddress: string | undefined,
  targetCity: string
): boolean {
  if (!targetCity) return false;
  if (targetCity === 'Toàn quốc' || targetCity.toLowerCase() === 'all' || targetCity === 'Tất cả các tỉnh thành') {
    return true;
  }

  const normTarget = normalizeCityName(targetCity).toLowerCase();

  if (userCity) {
    const normUserCity = normalizeCityName(userCity).toLowerCase();
    if (normUserCity === normTarget || normUserCity.includes(normTarget) || normTarget.includes(normUserCity)) {
      return true;
    }
  }

  if (userAddress) {
    const normAddr = userAddress.toLowerCase();
    if (normAddr.includes(normTarget) || normAddr.includes(targetCity.toLowerCase())) {
      return true;
    }
  }

  return false;
}

