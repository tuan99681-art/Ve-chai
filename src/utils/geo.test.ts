import { test } from 'node:test';
import assert from 'node:assert';
import { 
  normalizeCityName, 
  isUserInCity, 
  calculateHaversineDistance, 
  formatDistance 
} from './geo.js';

test('normalizeCityName correctly identifies major cities', () => {
  assert.strictEqual(normalizeCityName('Hà Nội'), 'Hà Nội');
  assert.strictEqual(normalizeCityName('ha noi'), 'Hà Nội');
  assert.strictEqual(normalizeCityName('tp. hcm'), 'TP. Hồ Chí Minh');
  assert.strictEqual(normalizeCityName('Sài Gòn'), 'TP. Hồ Chí Minh');
  assert.strictEqual(normalizeCityName('Đà Nẵng'), 'Đà Nẵng');
  assert.strictEqual(normalizeCityName('da nang'), 'Đà Nẵng');
  assert.strictEqual(normalizeCityName('Bình Dương'), 'Bình Dương');
});

test('isUserInCity matches target province accurately', () => {
  // Test matching via userCity
  assert.strictEqual(isUserInCity('Hà Nội', '36 Cầu Giấy', 'Hà Nội'), true);
  assert.strictEqual(isUserInCity('TP. Hồ Chí Minh', '72 Nguyễn Đình Chiểu', 'TP. Hồ Chí Minh'), true);
  assert.strictEqual(isUserInCity('Đà Nẵng', 'Hải Châu, Đà Nẵng', 'Đà Nẵng'), true);
  
  // Test matching via address when userCity is not set
  assert.strictEqual(isUserInCity(undefined, 'Số 102 Hoàng Hoa Thám, Ba Đình, Hà Nội', 'Hà Nội'), true);
  assert.strictEqual(isUserInCity(undefined, '456 Hoàng Sa, Quận 3, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh'), true);

  // Test non-matching cities
  assert.strictEqual(isUserInCity('TP. Hồ Chí Minh', '72 Nguyễn Đình Chiểu, Q.1', 'Hà Nội'), false);
  assert.strictEqual(isUserInCity('Đà Nẵng', 'Hải Châu', 'TP. Hồ Chí Minh'), false);

  // Test Toàn quốc matches all
  assert.strictEqual(isUserInCity('Hà Nội', 'Cầu Giấy', 'Toàn quốc'), true);
  assert.strictEqual(isUserInCity('TP. Hồ Chí Minh', 'Quận 1', 'Toàn quốc'), true);
});

test('calculateHaversineDistance and formatDistance return proper values', () => {
  const coord1 = { lat: 10.7769, lng: 106.7009 };
  const coord2 = { lat: 10.7769, lng: 106.7009 };
  assert.strictEqual(calculateHaversineDistance(coord1, coord2), 0);

  const distKm = calculateHaversineDistance(
    { lat: 10.7769, lng: 106.7009 },
    { lat: 10.8035, lng: 106.7088 }
  );
  assert.ok(distKm > 2 && distKm < 4);

  assert.strictEqual(formatDistance(0.45), '450 m');
  assert.strictEqual(formatDistance(2.4), '2.4 km');
});
