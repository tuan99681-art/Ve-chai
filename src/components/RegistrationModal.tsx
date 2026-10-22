/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Hộp Thoại Đăng Ký Thành Viên Xác Thực Số Điện Thoại & Vị Trí (Registration Modal)
 * Yêu cầu:
 * - Không cần CCCD phức tạp, chỉ cần xác thực Số Điện Thoại qua mã OTP
 * - Người mới vào app sẽ hiện phần đăng ký: Tên, Vị trí (Địa chỉ & GPS) và Số điện thoại
 * - Người bán: Vị trí được giữ bảo mật ẩn, chỉ hiển thị cho người mua khi đăng bán hàng, bán xong tự động ẩn lại.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Phone, 
  MapPin, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Truck, 
  ShoppingBag, 
  KeyRound, 
  Navigation,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [phone, setPhone] = useState('');
  const [selectedCity, setSelectedCity] = useState('TP. Hồ Chí Minh');
  const [address, setAddress] = useState('120 Hai Bà Trưng, P. Tân Định, Quận 1, TP. Hồ Chí Minh');
  const [lat, setLat] = useState(10.7890);
  const [lng, setLng] = useState(106.6965);
  const [vehicleType, setVehicleType] = useState('Xe ba gác có cân đồng hồ');

  // OTP Verification state
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp' | 'verified'>('enter_phone');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  if (!isOpen) return null;

  // Gửi mã OTP xác thực
  const handleSendOtp = () => {
    if (!phone || phone.length < 9) {
      setOtpError('Vui lòng nhập số điện thoại hợp lệ (từ 10 chữ số)');
      return;
    }
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomOtp);
    setOtpStep('enter_otp');
    setOtpError('');
  };

  // Xác thực OTP
  const handleVerifyOtp = () => {
    if (enteredOtp !== generatedOtp) {
      setOtpError('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
      return;
    }
    setOtpStep('verified');
    setOtpError('');
  };

  // Thực hiện định vị GPS khi người dùng bấm "Đồng ý cho phép"
  const executeGpsDetect = () => {
    setShowLocationDialog(false);
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`Tọa độ GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} - ${selectedCity}`);
          setIsDetectingGps(false);
        },
        () => {
          // Fallback location theo thành phố đã chọn
          if (selectedCity === 'Hà Nội') {
            setLat(21.0285 + (Math.random() - 0.5) * 0.02);
            setLng(105.8542 + (Math.random() - 0.5) * 0.02);
            setAddress('Khu vực trung tâm TP. Hà Nội');
          } else if (selectedCity === 'Đà Nẵng') {
            setLat(16.0544 + (Math.random() - 0.5) * 0.02);
            setLng(108.2022 + (Math.random() - 0.5) * 0.02);
            setAddress('Khu vực trung tâm TP. Đà Nẵng');
          } else {
            setLat(10.7850 + (Math.random() - 0.5) * 0.02);
            setLng(106.6950 + (Math.random() - 0.5) * 0.02);
            setAddress('Khu vực trung tâm TP. Hồ Chí Minh');
          }
          setIsDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
    }
  };

  // Đổi thành phố nhanh
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city === 'Hà Nội') {
      setLat(21.0285);
      setLng(105.8542);
      setAddress('36 Cầu Giấy, P. Quan Hoa, Quận Cầu Giấy, Hà Nội');
    } else if (city === 'Đà Nẵng') {
      setLat(16.0544);
      setLng(108.2022);
      setAddress('88 Nguyễn Văn Linh, P. Nam Dương, Quận Hải Châu, Đà Nẵng');
    } else if (city === 'Bình Dương') {
      setLat(10.9804);
      setLng(106.6519);
      setAddress('Đại lộ Bình Dương, TP. Thủ Dầu Một, Bình Dương');
    } else {
      setLat(10.7890);
      setLng(106.6965);
      setAddress('120 Hai Bà Trưng, P. Tân Định, Quận 1, TP. Hồ Chí Minh');
    }
  };

  // Hoàn tất đăng ký
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Vui lòng nhập Họ và Tên của bạn!');
      return;
    }
    if (otpStep !== 'verified') {
      alert('Vui lòng xác thực số điện thoại qua mã OTP để bảo đảm an toàn cộng đồng!');
      return;
    }

    registerUser({
      fullName: fullName.trim(),
      phone: phone.trim(),
      role,
      address: address.trim(),
      city: selectedCity,
      lat,
      lng,
      vehicleType: role === 'buyer' ? vehicleType : undefined
    });

    localStorage.setItem('vechaixanh_onboarded_v2', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-emerald-100 relative my-auto">
        
        {/* Nút đóng nếu người dùng muốn xem bản demo trước */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Đóng / Trải nghiệm với tài khoản mẫu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Giới thiệu */}
        <div className="text-center space-y-1.5 pb-3 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chào mừng bạn đến với VeChaiXanh</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Đăng Ký Thành Viên Mua Bán Ve Chai
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không cần giấy tờ căn cước CCCD, chỉ cần xác thực số điện thoại và cung cấp vị trí để kết nối người mua/bán gần nhất.
          </p>
        </div>

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
          
          {/* 1. Chọn vai trò */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Bạn tham gia với tư cách nào? <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all ${
                  role === 'seller'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${role === 'seller' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-xs">Người Bán Ve Chai</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Hộ gia đình, quán ăn, văn phòng, xưởng
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`p-3 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all ${
                  role === 'buyer'
                    ? 'border-sky-600 bg-sky-50/70 text-sky-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${role === 'buyer' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-xs">Người Thu Mua</span>
                  <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                    Xe ba gác, xe máy, vựa phế liệu
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Họ và tên */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Họ và tên của bạn: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Chị Lan Anh, Chú Bảy Ba Gác..."
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 text-xs font-semibold"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Phương tiện thu mua nếu là Buyer */}
          {role === 'buyer' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Phương tiện thu gom:
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold"
              >
                <option value="Xe ba gác có cân đồng hồ">Xe ba gác có cân đồng hồ chuẩn</option>
                <option value="Xe máy có giá chở hàng lớn">Xe máy có giá chở hàng lớn</option>
                <option value="Vựa phế liệu có xe tải thu gom">Vựa phế liệu có xe tải thu gom</option>
                <option value="Xe đẩy tay lưu động">Xe đẩy tay lưu động</option>
              </select>
            </div>
          )}

          {/* 3. Tỉnh / Thành Phố & Vị trí cư trú */}
          <div className="space-y-2.5">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tỉnh / Thành phố: <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:bg-white focus:border-emerald-500"
              >
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Bình Dương">Bình Dương</option>
                <option value="Đồng Nai">Đồng Nai</option>
                <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                <option value="Quảng Ninh">Quảng Ninh</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Địa chỉ chi tiết: <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationDialog(true)}
                  disabled={isDetectingGps}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                >
                  <Navigation className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'Đang lấy vị trí...' : 'Lấy vị trí GPS hiện tại'}</span>
                </button>
              </div>

              {/* HỘP THOẠI YÊU CẦU QUYỀN TRUY CẬP VỊ TRÍ ĐỊA LÝ HOÀN TOÀN BẰNG TIẾNG VIỆT */}
              {showLocationDialog && (
                <div className="mb-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-emerald-700" />
                      Yêu cầu quyền truy cập vị trí địa lý
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLocationDialog(false)}
                      className="text-slate-400 hover:text-slate-700 font-bold p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    Ứng dụng cần quyền truy cập vị trí địa lý để hoạt động chính xác. Bạn có muốn cho phép truy cập vị trí địa lý không?
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowLocationDialog(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold border border-slate-200 text-xs"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={executeGpsDetect}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs text-xs"
                    >
                      Đồng ý cho phép
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-emerald-500 text-slate-800 text-xs font-semibold"
                />
                <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* 4. Số điện thoại & Xác thực OTP */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Số điện thoại xác thực:</span>
                <span className="text-rose-500">*</span>
              </label>
              {otpStep === 'verified' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã xác thực OTP
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                disabled={otpStep === 'verified'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập SĐT (vd: 0918123456)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-mono font-bold"
              />
              {otpStep !== 'verified' && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 transition-colors shadow-xs"
                >
                  {otpStep === 'enter_otp' ? 'Gửi lại mã' : 'Gửi mã OTP'}
                </button>
              )}
            </div>

            {/* Bước nhập mã OTP */}
            {otpStep === 'enter_otp' && (
              <div className="pt-2 border-t border-slate-200 space-y-2 animate-in fade-in">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-center justify-between gap-2">
                  <span>Mã OTP gửi đến SĐT của bạn là: <strong className="font-mono text-sm text-emerald-700">{generatedOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setEnteredOtp(generatedOtp)}
                    className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[10px] font-bold"
                  >
                    Tự điền nhanh
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Nhập 4 số OTP"
                      className="w-full px-3 py-2 pl-8 border border-slate-300 rounded-xl font-mono text-sm tracking-widest text-center font-bold"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shrink-0"
                  >
                    Xác nhận OTP
                  </button>
                </div>
              </div>
            )}

            {otpError && (
              <p className="text-[11px] text-rose-600 font-semibold">{otpError}</p>
            )}
          </div>

          {/* QUY TẮC BẢO MẬT VỊ TRÍ RÕ RÀNG */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chính sách hiển thị vị trí minh bạch & an toàn:</span>
            </div>
            {role === 'seller' ? (
              <p className="text-slate-700 leading-relaxed">
                🔒 <strong>Dành cho Người Bán:</strong> Vị trí của bạn được <strong>ẩn bảo mật</strong>. Khi bạn <strong>đăng bán món hàng ve chai nào đó</strong>, vị trí mới hiển thị cho người thu mua thấy. Khi mua bán xong, hệ thống sẽ <strong>tự động ẩn vị trí của bạn ngay lập tức</strong>!
              </p>
            ) : (
              <p className="text-slate-700 leading-relaxed">
                🚚 <strong>Dành cho Người Thu Mua:</strong> Bạn sẽ thấy các điểm người bán đang có ve chai cần bán xung quanh. Khi người bán giao dịch xong, điểm đó sẽ biến mất khỏi bản đồ.
              </p>
            )}
          </div>

          {/* Nút đăng ký */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-colors"
            >
              Để sau (Xem mẫu)
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <span>Đăng Ký & Sử Dụng Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
