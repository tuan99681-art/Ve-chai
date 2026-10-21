/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Trang Bảng Giá & Phân Loại Ve Chai Thị Trường (Scrap Prices & Categories)
 * - Hiển thị giá thị trường các mặt hàng thu mua: Nhựa, Nhôm, Đồng, Sắt, Giấy...
 * - Mục con phân loại chi tiết từng loại và mẹo phân loại sạch để bán giá cao
 * - Quản trị viên có thể tự thêm danh mục chính, thêm mục con và điều chỉnh giá
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ScrapCategory, ScrapSubItem } from '../types';
import { formatCurrencyVND } from '../utils/geo';
import { 
  BadgePercent, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Lightbulb, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Flame,
  Wrench,
  FileText,
  Zap,
  Cpu
} from 'lucide-react';

export const PricesPage: React.FC = () => {
  const { 
    currentUser, 
    categories, 
    addCategory, 
    updateSubItem, 
    addSubItem, 
    deleteSubItem 
  } = useApp();

  const [expandedCatId, setExpandedCatId] = useState<string>('cat-plastic');
  const [showAddSubModal, setShowAddSubModal] = useState<string | null>(null);
  const [showEditPriceModal, setShowEditPriceModal] = useState<{ categoryId: string; item: ScrapSubItem } | null>(null);

  // Form states cho thêm mục con
  const [newSubName, setNewSubName] = useState('');
  const [newSubUnit, setNewSubUnit] = useState('kg');
  const [newSubPrice, setNewSubPrice] = useState(10000);
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubTips, setNewSubTips] = useState('');

  // Form state cho chỉnh sửa giá
  const [editPriceVal, setEditPriceVal] = useState(0);

  const getTrendIcon = (trend: ScrapSubItem['priceChange']) => {
    switch (trend) {
      case 'up':
        return <span className="flex items-center text-emerald-600 font-bold text-xs"><TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Tăng</span>;
      case 'down':
        return <span className="flex items-center text-rose-500 font-bold text-xs"><TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Giảm</span>;
      default:
        return <span className="flex items-center text-slate-500 font-bold text-xs"><Minus className="w-3.5 h-3.5 mr-0.5" /> Ổn định</span>;
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return <Package className="w-5 h-5 text-emerald-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-sky-600" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-600" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-slate-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-purple-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-600" />;
      default: return <Package className="w-5 h-5 text-emerald-600" />;
    }
  };

  const handleAddSubItemSubmit = () => {
    if (!showAddSubModal || !newSubName.trim()) return;
    addSubItem(showAddSubModal, {
      name: newSubName.trim(),
      unit: newSubUnit,
      currentPrice: newSubPrice,
      priceMin: Math.round(newSubPrice * 0.9),
      priceMax: Math.round(newSubPrice * 1.1),
      priceChange: 'stable',
      description: newSubDesc,
      tips: newSubTips
    });

    setShowAddSubModal(null);
    setNewSubName('');
    setNewSubPrice(10000);
    setNewSubDesc('');
    setNewSubTips('');
  };

  const handleUpdatePriceSubmit = () => {
    if (!showEditPriceModal) return;
    updateSubItem(showEditPriceModal.categoryId, showEditPriceModal.item.id, {
      currentPrice: editPriceVal,
      priceChange: editPriceVal > showEditPriceModal.item.currentPrice ? 'up' : editPriceVal < showEditPriceModal.item.currentPrice ? 'down' : 'stable'
    });
    setShowEditPriceModal(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Tiêu đề & Thông báo thị trường */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-emerald-600" />
            <h1 className="text-lg font-bold text-slate-900">Bảng Giá Thu Mua Phế Liệu Hôm Nay</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật thời gian thực theo giá vựa và thị trường tái chế TP. Hồ Chí Minh
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Quyền Quản Trị: Được cập nhật giá & thêm vật phẩm
          </span>
        )}
      </div>

      {/* DANH SÁCH DANH MỤC PHẾ LIỆU (EXPANDABLE CATEGORIES) */}
      <div className="space-y-3">
        {categories.map(cat => {
          const isExpanded = expandedCatId === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Category Header */}
              <div
                onClick={() => setExpandedCatId(isExpanded ? '' : cat.id)}
                className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                    <p className="text-xs text-slate-500">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono text-slate-400">
                    {cat.subItems.length} mục con
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Sub Items List */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/40 animate-in fade-in">
                  
                  {/* Nút thêm mục con cho Admin */}
                  {currentUser.role === 'admin' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setShowAddSubModal(cat.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm loại con cho {cat.name}</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cat.subItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                            <span className="text-[10px] text-slate-400">Đơn vị: {item.unit}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-emerald-700 font-mono text-sm block">
                              {formatCurrencyVND(item.currentPrice)} / {item.unit}
                            </span>
                            {getTrendIcon(item.priceChange)}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500">{item.description}</p>

                        {/* Mẹo phân loại để bán giá cao */}
                        {item.tips && (
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Mẹo giá cao:</strong> {item.tips}</span>
                          </div>
                        )}

                        {/* Admin Action Controls */}
                        {currentUser.role === 'admin' && (
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setShowEditPriceModal({ categoryId: cat.id, item });
                                setEditPriceVal(item.currentPrice);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa giá</span>
                            </button>

                            <button
                              onClick={() => deleteSubItem(cat.id, item.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* POPUP SỬA GIÁ (ADMIN) */}
      {showEditPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">
              Cập Nhật Giá: {showEditPriceModal.item.name}
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Giá thu mua mới (VNĐ / {showEditPriceModal.item.unit}):
              </label>
              <input
                type="number"
                step="500"
                value={editPriceVal}
                onChange={(e) => setEditPriceVal(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl font-mono text-base font-bold text-emerald-700"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => setShowEditPriceModal(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdatePriceSubmit}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP THÊM MỤC CON (ADMIN) */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-3 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">Thêm Mặt Hàng Phân Loại Con</h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên mặt hàng:</label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="VD: Dây điện đồng trần, Thùng carton xốp..."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Đơn vị:</label>
                <input
                  type="text"
                  value={newSubUnit}
                  onChange={(e) => setNewSubUnit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Giá thu mua (VNĐ):</label>
                <input
                  type="number"
                  step="500"
                  value={newSubPrice}
                  onChange={(e) => setNewSubPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả đặc điểm:</label>
              <input
                type="text"
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                placeholder="Dấu hiệu nhận biết loại phế liệu này..."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mẹo để bán giá cao hơn:</label>
              <input
                type="text"
                value={newSubTips}
                onChange={(e) => setNewSubTips(e.target.value)}
                placeholder="VD: Rửa sạch chai, gỡ bỏ nắp..."
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddSubModal(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSubItemSubmit}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Thêm Mục
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
