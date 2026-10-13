import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  LogIn, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  MessageCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  HelpCircle,
  Key,
  RefreshCw,
  Send,
  Building2
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AuthViewMode = 'login' | 'forgot_password' | 'switch_account';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    updateUser, 
    settings 
  } = useApp();

  const [mode, setMode] = useState<AuthViewMode>('login');
  
  // Login Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password State
  const [recoverySearch, setRecoverySearch] = useState('');
  const [selectedUserForRecovery, setSelectedUserForRecovery] = useState<User | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: find account, 2: verify identity, 3: set new password
  const [recoveryMethod, setRecoveryMethod] = useState<'manager_pin' | 'otp' | 'whatsapp_direct'>('manager_pin');
  const [managerPinInput, setManagerPinInput] = useState('');
  const [otpGenerated, setOtpGenerated] = useState<string>('742891');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roleLabels: Record<UserRole, string> = {
    admin: 'المدير العام والأعضاء',
    finance: 'مشرفة التحصيل والشؤون المالية',
    data_entry: 'مدخلة البيانات وشؤون القيد',
    attendance_supervisor: 'مشرفة الغياب وشؤون الطلاب',
    board: 'عضو مجلس الإدارة'
  };

  // Default Master Pin for school administration fallback (manager code)
  const MASTER_ADMIN_PIN = '123456';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedUser = usernameInput.trim().toLowerCase();
    const found = users.find(u => 
      u.username.toLowerCase() === trimmedUser || 
      (u.phone && u.phone.trim() === usernameInput.trim())
    );

    if (!found) {
      setLoginError('اسم المستخدم أو رقم الهاتف غير مسجل في النظام. تأكد من البيانات أو تواصل مع إدارة المدرسة.');
      return;
    }

    if (!found.active) {
      setLoginError('هذا الحساب معطل حالياً من قِبل إدارة المدرسة.');
      return;
    }

    // Check password if set on user, otherwise accept default demo logic
    if (found.password && passwordInput && found.password !== passwordInput) {
      setLoginError('كلمة المرور غير صحيحة. يمكنك النقر على «نسيت كلمة المرور؟» لاستعادتها فوراً.');
      return;
    }

    // Log in
    setCurrentUser(found);
    setSuccessMessage(`مرحباً بك فضيلة ${found.fullName}! تم تسجيل الدخول بنجاح.`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleStartRecovery = (user: User) => {
    setSelectedUserForRecovery(user);
    setRecoveryError(null);
    // Generate fresh random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpGenerated(code);
    setRecoveryStep(2);
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (recoveryMethod === 'manager_pin') {
      if (managerPinInput.trim() !== MASTER_ADMIN_PIN) {
        setRecoveryError('رمز اعتماد الإدارة غير صحيح. الرمز الافتراضي المعتمد هو: 123456 أو كود مدير المدرسة.');
        return;
      }
      setRecoveryStep(3);
    } else if (recoveryMethod === 'otp') {
      if (otpInput.trim() !== otpGenerated) {
        setRecoveryError('رمز التحقق غير متطابق. يرجى إدخال الرمز المكون من 6 أرقام بشكل صحيح.');
        return;
      }
      setRecoveryStep(3);
    }
  };

  const handleSetNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (newPassword.length < 4) {
      setRecoveryError('كلمة المرور يجب أن تتكون من 4 خانات على الأقل.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('كلمة المرور غير متطابقة مع خانة التأكيد.');
      return;
    }

    if (selectedUserForRecovery) {
      // Update in global app state and localStorage
      updateUser(selectedUserForRecovery.id, { password: newPassword });
      
      // Auto log in with the recovered account
      const updatedUser = { ...selectedUserForRecovery, password: newPassword };
      setCurrentUser(updatedUser);

      setSuccessMessage(`تم بنجاح إعادة تعيين كلمة المرور للمستخدم (${selectedUserForRecovery.fullName}) وتفعيل الحساب!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const generateWhatsAppHelpUrl = (user: User) => {
    const text = `السلام عليكم ورحمة الله وبركاته،\nإدارة مدرسة السعيد القرآنية الموقرة،\nأرجو التكرم بالمساعدة في إعادة تعيين كلمة المرور لحسابي:\nالاسم: ${user.fullName}\nاسم المستخدم: ${user.username}\nالهاتف المسجل: ${user.phone || 'غير مسجل'}\nوجزاكم الله خيراً.`;
    return `https://wa.me/20${settings.phone?.replace(/[^0-9]/g, '') || '01012345678'}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden my-6 transition-all duration-300">
        
        {/* Luxury Islamic Brand Header */}
        <div className="bg-gradient-to-l from-[#361E10] via-[#4A2F18] to-[#603A1F] p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={settings.logoUrl || '/school_logo.jpg'} 
                  alt="شعار المدرسة" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
                />
                <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#361E10] p-0.5 rounded-full shadow-xs">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                    {settings.schoolName}
                  </h3>
                  <span className="text-[10px] bg-[#D4AF37]/25 text-[#F6EEE4] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full font-bold">
                    منصة السعيد
                  </span>
                </div>
                <p className="text-[11px] text-[#D8C3AE] mt-0.5 font-medium">
                  {mode === 'login' && 'بوابة تسجيل الدخول الموحدة للنظام'}
                  {mode === 'forgot_password' && 'بوابة استعادة ونسيان كلمة المرور'}
                  {mode === 'switch_account' && 'قائمة التبديل السريع بين حسابات النظام'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold transition cursor-pointer"
              title="إغلاق"
            >
              ✕
            </button>
          </div>

          {/* Sub Navigation Bar inside Modal */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                mode === 'login' ? 'bg-[#D4AF37] text-[#361E10] shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot_password'); setRecoveryStep(1); setRecoveryError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                mode === 'forgot_password' ? 'bg-[#D4AF37] text-[#361E10] shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>نسيان كلمة المرور</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('switch_account'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer mr-auto ${
                mode === 'switch_account' ? 'bg-[#D4AF37] text-[#361E10] shadow-xs' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>الحسابات المصرحة</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 1: LOGIN                                                             */}
          {/* ========================================================================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              
              {/* Active Session Info Pill */}
              <div className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4A2F18] text-[#D4AF37] flex items-center justify-center font-black text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C6D53] block">الحساب النشط حالياً بالجهاز:</span>
                    <strong className="text-xs text-[#4A2F18]">{currentUser.fullName}</strong>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#4A2F18] text-white px-2 py-0.5 rounded-md">
                  {roleLabels[currentUser.role] || currentUser.role}
                </span>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-[#4A2F18] mb-1">
                    اسم المستخدم أو رقم الهاتف المسجل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="مثال: admin أو finance أو رقم الهاتف"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-[#FBF8F5] font-bold text-[#4A2F18] focus:outline-hidden focus:border-[#B9895B] focus:ring-1 focus:ring-[#B9895B]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#4A2F18]">
                      كلمة المرور
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setRecoveryStep(1);
                        setRecoveryError(null);
                      }}
                      className="text-[11px] font-bold text-[#B9895B] hover:text-[#4A2F18] transition flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>نسيت كلمة المرور؟</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="أدخل كلمة المرور الخاصة بك"
                      className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-[#FBF8F5] font-bold text-[#4A2F18] focus:outline-hidden focus:border-[#B9895B] focus:ring-1 focus:ring-[#B9895B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#4A2F18] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-l from-[#4A2F18] to-[#5C3B1E] hover:from-[#361E10] hover:to-[#4A2F18] text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm text-xs"
                >
                  <LogIn className="w-4 h-4 text-[#D4AF37]" />
                  <span>دخول النظام</span>
                </button>
              </form>

              {/* Fast Direct Switcher Section */}
              <div className="pt-3 border-t border-[#E8DCCF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#8C6D53] text-[11px]">
                    الدخول السريع بالحسابات المعرفة:
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('switch_account')}
                    className="text-[11px] text-[#B9895B] font-bold hover:underline"
                  >
                    عرض التفاصيل
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setCurrentUser(u);
                        setSuccessMessage(`تم التحويل إلى: ${u.fullName}`);
                        setTimeout(() => onClose(), 600);
                      }}
                      className={`p-2 rounded-xl text-right transition border font-bold text-[11px] flex flex-col cursor-pointer ${
                        currentUser.id === u.id
                          ? 'bg-[#4A2F18] text-white border-[#4A2F18]'
                          : 'bg-[#FBF8F5] hover:bg-[#F6EEE4] text-[#4A2F18] border-[#E8DCCF]'
                      }`}
                    >
                      <span className="truncate">{u.fullName}</span>
                      <span className="text-[10px] opacity-75">{roleLabels[u.role] || u.role}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: FORGOT PASSWORD / ACCOUNT RECOVERY                                */}
          {/* ========================================================================= */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              
              {/* Stepper indicator */}
              <div className="flex items-center justify-between px-2 text-[11px] font-bold text-[#8C6D53]">
                <span className={recoveryStep >= 1 ? 'text-[#4A2F18] font-black' : ''}>1. تحديد الحساب</span>
                <span className="text-gray-300">←</span>
                <span className={recoveryStep >= 2 ? 'text-[#4A2F18] font-black' : ''}>2. التحقق من الهوية</span>
                <span className="text-gray-300">←</span>
                <span className={recoveryStep >= 3 ? 'text-[#4A2F18] font-black' : ''}>3. تعيين كلمة المرور</span>
              </div>

              {recoveryError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {/* STEP 1: FIND ACCOUNT */}
              {recoveryStep === 1 && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-[#FBF8F5] border border-[#E8DCCF] rounded-xl text-[11px] text-[#6D4C3D] leading-relaxed">
                    اختر الحساب الذي ترغب في استعادة كلمة المرور له، أو ابحث باسم المستخدم أو رقم الهاتف المسجل:
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A2F18] mb-1">
                      البحث في مستخدمي المدرسة:
                    </label>
                    <input
                      type="text"
                      value={recoverySearch}
                      onChange={(e) => setRecoverySearch(e.target.value)}
                      placeholder="ابحث بالاسم أو اسم المستخدم أو الهاتف..."
                      className="w-full px-3.5 py-2 border border-[#E8DCCF] rounded-xl bg-[#FBF8F5] font-bold text-[#4A2F18]"
                    />
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {users
                      .filter(u => {
                        if (!recoverySearch.trim()) return true;
                        const s = recoverySearch.toLowerCase();
                        return u.fullName.toLowerCase().includes(s) || 
                               u.username.toLowerCase().includes(s) || 
                               (u.phone && u.phone.includes(s));
                      })
                      .map(u => (
                        <div 
                          key={u.id}
                          onClick={() => handleStartRecovery(u)}
                          className="p-3 rounded-xl border border-[#E8DCCF] bg-white hover:bg-[#F6EEE4] transition cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <strong className="text-xs text-[#4A2F18] block">{u.fullName}</strong>
                            <div className="flex items-center gap-2 text-[10px] text-[#8C6D53] mt-0.5">
                              <span>اسم المستخدم: <strong>{u.username}</strong></span>
                              <span>•</span>
                              <span>الهاتف: <strong className="tabular-nums">{u.phone || 'غير مسجل'}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[#B9895B] group-hover:text-[#4A2F18] font-bold text-xs">
                            <span>اختيار</span>
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* STEP 2: VERIFICATION METHOD */}
              {recoveryStep === 2 && selectedUserForRecovery && (
                <div className="space-y-4">
                  {/* Selected User Badge */}
                  <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#8C6D53] block">الحساب المستهدف للاستعادة:</span>
                      <strong className="text-xs text-[#4A2F18]">{selectedUserForRecovery.fullName}</strong>
                      <span className="text-[10px] text-[#8C6D53] block">({roleLabels[selectedUserForRecovery.role] || selectedUserForRecovery.role}) • {selectedUserForRecovery.username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                      className="text-[11px] font-bold text-[#B9895B] hover:underline"
                    >
                      تغيير
                    </button>
                  </div>

                  {/* Method Choice Tabs */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setRecoveryMethod('manager_pin'); setRecoveryError(null); }}
                      className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                        recoveryMethod === 'manager_pin'
                          ? 'bg-[#4A2F18] text-white border-[#4A2F18]'
                          : 'bg-[#FBF8F5] text-[#4A2F18] border-[#E8DCCF]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-[#D4AF37]" />
                      <span>كود اعتماد الإدارة الفوري</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setRecoveryMethod('otp'); setRecoveryError(null); }}
                      className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                        recoveryMethod === 'otp'
                          ? 'bg-[#4A2F18] text-white border-[#4A2F18]'
                          : 'bg-[#FBF8F5] text-[#4A2F18] border-[#E8DCCF]'
                      }`}
                    >
                      <Phone className="w-4 h-4 mx-auto mb-1 text-[#D4AF37]" />
                      <span>رمز التحقق بالهاتف / OTP</span>
                    </button>
                  </div>

                  {/* Option A: Master Admin Pin */}
                  {recoveryMethod === 'manager_pin' && (
                    <form onSubmit={handleVerifyIdentity} className="space-y-3 p-3.5 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                      <div>
                        <label className="block font-bold text-[#4A2F18] mb-1">
                          رمز اعتماد مدير المدرسة (Master PIN)
                        </label>
                        <p className="text-[10px] text-[#8C6D53] mb-2">
                          يقوم مدير المدرسة أو المشرف العام بإدخال رمز الحماية المعتمد لتخويل الموظف فورياً (الرمز الافتراضي: 123456):
                        </p>
                        <input
                          type="password"
                          value={managerPinInput}
                          onChange={(e) => setManagerPinInput(e.target.value)}
                          placeholder="أدخل كود الأمان 123456"
                          required
                          className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-white font-mono text-center tracking-widest text-lg font-bold text-[#4A2F18]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#4A2F18] hover:bg-[#361E10] text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Key className="w-4 h-4 text-[#D4AF37]" />
                        <span>تحقق واعتماد إعادة التعيين</span>
                      </button>
                    </form>
                  )}

                  {/* Option B: OTP Verification */}
                  {recoveryMethod === 'otp' && (
                    <form onSubmit={handleVerifyIdentity} className="space-y-3 p-3.5 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-[#4A2F18]">
                            رمز التحقق المؤقت (OTP)
                          </label>
                          <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                            الرمز المولد: {otpGenerated}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8C6D53] mb-2">
                          تم توليد رمز تحقق مخصص لرقم هاتف الموظف المسجل ({selectedUserForRecovery.phone || '01012345671'}). أدخل الرمز للمتابعة:
                        </p>
                        <input
                          type="text"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="أدخل 6 أرقام للرمز"
                          required
                          className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-white font-mono text-center tracking-widest text-lg font-bold text-[#4A2F18]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setOtpGenerated(code);
                            setOtpInput('');
                          }}
                          className="px-3 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
                          title="توليد كود جديد"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>تجديد الكود</span>
                        </button>

                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-[#4A2F18] hover:bg-[#361E10] text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                          <span>تأكيد الرمز والمتابعة</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* WhatsApp Support Direct Link */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-[11px] text-emerald-950 block">هل تواجه صعوبة في الاستعادة؟</strong>
                      <span className="text-[10px] text-emerald-800">راسل إدارة المدرسة مباشرة عبر واتساب بطلب رسمي</span>
                    </div>
                    <a
                      href={generateWhatsAppHelpUrl(selectedUserForRecovery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>مراسلة الإدارة</span>
                    </a>
                  </div>

                </div>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {recoveryStep === 3 && selectedUserForRecovery && (
                <form onSubmit={handleSetNewPassword} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="text-xs block">تم التحقق من هوية الحساب بنجاح!</strong>
                      <span className="text-[10px]">يمكنك الآن إدخال كلمة المرور الجديدة لحساب: <strong>{selectedUserForRecovery.fullName}</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A2F18] mb-1">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور قوية"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-[#FBF8F5] font-bold text-[#4A2F18] focus:border-[#B9895B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#4A2F18] mb-1">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      required
                      className="w-full px-3.5 py-2.5 border border-[#E8DCCF] rounded-xl bg-[#FBF8F5] font-bold text-[#4A2F18] focus:border-[#B9895B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-l from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-extrabold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>حفظ كلمة المرور وتعيينها فوراً</span>
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: SWITCH ACCOUNT DIRECT VIEW                                        */}
          {/* ========================================================================= */}
          {mode === 'switch_account' && (
            <div className="space-y-3">
              <p className="text-[11px] text-[#8C6D53]">
                اختر الحساب المطلوب للتبديل الفوري ومباشرة المهام الإدارية والتربوية:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {users.map(u => {
                  const isActive = currentUser.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setSuccessMessage(`تم التبديل بنجاح إلى: ${u.fullName}`);
                        setTimeout(() => onClose(), 600);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-[#4A2F18] text-white border-[#4A2F18] shadow-sm'
                          : 'bg-[#FBF8F5] hover:bg-[#F6EEE4] text-[#4A2F18] border-[#E8DCCF]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isActive ? 'bg-[#D4AF37] text-[#361E10]' : 'bg-[#E8DCCF] text-[#4A2F18]'
                        }`}>
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-xs block">{u.fullName}</strong>
                          <span className={`text-[10px] block ${isActive ? 'text-white/80' : 'text-[#8C6D53]'}`}>
                            {roleLabels[u.role] || u.role} • {u.username}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="text-[10px] bg-[#D4AF37] text-[#361E10] font-black px-2 py-0.5 rounded-md">
                          الحساب الحالي
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#B9895B] font-bold">
                          تبديل
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
