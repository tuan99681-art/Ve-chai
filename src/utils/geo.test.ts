/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit test cho các hàm tính toán khoảng cách và định dạng vị trí (Geo & Currency)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  formatDistance,
  estimateTravelTimeMinutes,
  isWithinRadius,
  formatCurrencyVND
} from './geo';

test('calculateHaversineDistance returns 0 for identical coordinates', () => {
  const coord = { lat: 10.7769, lng: 106.7009 };
  const dist = calculateHaversineDistance(coord, coord);
  assert.equal(dist, 0);
});

test('calculateHaversineDistance accurately computes distance between two known points in Ho Chi Minh City', () => {
  // Điểm 1: Nhà Thờ Đức Bà (Q.1) - 10.7798, 106.6990
  // Điểm 2: Chợ Bến Thành (Q.1) - 10.7725, 106.6980
  const cathedral = { lat: 10.7798, lng: 106.6990 };
  const benThanh = { lat: 10.7725, lng: 106.6980 };
  const dist = calculateHaversineDistance(cathedral, benThanh);
  // Khoảng cách thực tế xấp xỉ ~0.8 km
  assert.ok(dist > 0.6 && dist < 1.0, `Distance should be ~0.8km, got: ${dist}`);
});

test('formatDistance formats meters and kilometers cleanly', () => {
  assert.equal(formatDistance(0.45), '450 m');
  assert.equal(formatDistance(2.34), '2.3 km');
  assert.equal(formatDistance(10.0), '10.0 km');
});

test('estimateTravelTimeMinutes provides realistic travel time', () => {
  assert.equal(estimateTravelTimeMinutes(0.5), 5); // Minimum 5 mins
  assert.equal(estimateTravelTimeMinutes(12.5), 30); // 12.5 km at 25km/h = 30 mins
});

test('isWithinRadius filters points correctly', () => {
  const origin = { lat: 10.7769, lng: 106.7009 };
  const nearPoint = { lat: 10.7780, lng: 106.7015 };
  const farPoint = { lat: 10.9000, lng: 106.8500 };

  assert.equal(isWithinRadius(origin, nearPoint, 1.0), true);
  assert.equal(isWithinRadius(origin, farPoint, 5.0), false);
});

test('formatCurrencyVND formats numbers to Vietnamese currency standard', () => {
  const formatted = formatCurrencyVND(50000);
  assert.ok(formatted.includes('50.000'), 'Formatted value should contain 50.000');
});
