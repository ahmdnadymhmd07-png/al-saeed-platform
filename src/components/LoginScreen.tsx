import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  LogIn, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Sparkles, 
  AlertCircle, 
  Building2, 
  BookOpen,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { users, login, settings } = useApp();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const success = login(usernameInput, passwordInput);
    if (!success) {
      setIsSubmitting(false);
      setErrorMessage('بيانات الدخول غير صحيحة أو الحساب غير مفعل. يرجى التأكد من اسم المستخدم وكلمة المرور.');
    }
  };

  const handleQuickFill = (u: typeof users[0]) => {
    setUsernameInput(u.username);
    setPasswordInput(u.password || '');
    setErrorMessage(null);
  };

  const roleLabels: Record<UserRole, string> = {
    admin: 'المدير العام (صاحب المنصة)',
    finance: 'مشرفة التحصيل المالي',
    data_entry: 'مدخلة البيانات وشؤون الطلاب',
    attendance_supervisor: 'مشرفة الغياب والحضور',
    board: 'عضو مجلس الإدارة'
  };

  return (
    <div className="min-h-screen bg-radial from-[#FBF8F5] via-[#F4EBE1] to-[#E9DAC9] flex flex-col items-center justify-center p-4 select-none">
      
      {/* Background Decorative Pattern Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-25 flex items-center justify-center overflow-hidden">
        <div className="w-[800px] h-[800px] rounded-full border border-[#D4AF37]/30 blur-2xl" />
        <div className="w-[500px] h-[500px] rounded-full border border-[#4A2F18]/20 blur-xl" />
      </div>

      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Header Branding Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative p-1 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F6EEE4] to-[#4A2F18] shadow-lg">
            <img 
              src={settings.logoUrl || '/school_logo.jpg'} 
              alt="شعار المدرسة" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white shadow-inner bg-white"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
            />
            <span className="absolute bottom-0 right-1 bg-[#D4AF37] text-[#361E10] p-1.5 rounded-full shadow-md">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-[#4A2F18] tracking-tight">
                {settings.schoolName}
              </h1>
            </div>
            <p className="text-xs font-bold text-[#8C6D53] mt-1">
              منصة السعيد — النظام الإداري الموحد للمدارس القرآنية
            </p>
            <p className="text-[11px] text-[#A27B5C] font-medium mt-0.5">
              {settings.associationName}
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8DCCF] shadow-xl space-y-5">
          
          <div className="border-b border-[#F0E6DC] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F6EEE4] flex items-center justify-center text-[#4A2F18]">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h2 className="font-extrabold text-sm text-[#4A2F18]">
                تسجيل الدخول للمنصة
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>نظام مشفر ومؤمن</span>
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1.5">
                اسم المستخدم أو رقم الهاتف
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="أدخل اسم المستخدم (مثال: admin)"
                  required
                  autoFocus
                  className="w-full pl-3 pr-10 py-2.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded-xl text-xs font-bold text-[#4A2F18] focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition"
                />
                <User className="w-4 h-4 text-[#8C6D53] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور الخاصة بحسابك"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6F0] border border-[#E8DCCF] rounded-xl text-xs font-bold text-[#4A2F18] focus:outline-hidden focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 transition"
                />
                <KeyRound className="w-4 h-4 text-[#8C6D53] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C6D53] hover:text-[#4A2F18] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-l from-[#361E10] via-[#4A2F18] to-[#5C3B1E] hover:from-[#26150B] hover:to-[#4A2F18] text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#4A2F18] active:scale-[0.99] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 text-[#D4AF37]" />
              <span>دخول إلى المنصة</span>
            </button>
          </form>

          {/* System Default Credentials Helper Hint */}
          <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E8DCCF] text-[11px] text-[#4A2F18] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#8C6D53]">بيانات حساب صاحب المنصة (الافتراضية):</span>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('admin');
                  setPasswordInput('admin');
                  setErrorMessage(null);
                }}
                className="text-[10px] bg-[#4A2F18] text-white px-2 py-0.5 rounded font-bold hover:bg-[#382312] cursor-pointer"
              >
                تعبئة تلقائية
              </button>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-[#6D4C3D]">
              <span>اسم المستخدم: <strong className="text-[#4A2F18]">admin</strong></span>
              <span>•</span>
              <span>كلمة المرور: <strong className="text-[#4A2F18]">admin</strong></span>
            </div>
          </div>

          {/* Collapsible List of Authorized Accounts (For Administrator reference only) */}
          <div className="pt-2 border-t border-[#F0E6DC]">
            <details className="text-[11px] text-[#8C6D53] group">
              <summary className="font-bold text-[#4A2F18] cursor-pointer hover:text-[#8C6D53] transition list-none flex items-center justify-between py-1 select-none">
                <span>عرض الحسابات المصرحة المسجلة بالنظام</span>
                <span className="text-[10px] bg-[#F6EEE4] px-1.5 py-0.5 rounded text-[#4A2F18] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-[10px] text-[#8C6D53] mt-1 mb-2">
                هذه القائمة مخصصة لمساعدة إدارة المدرسة؛ يمكنك النقر على أي حساب لتعبئة بياناته:
              </p>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickFill(u)}
                    className="p-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E8DC] border border-[#E8DCCF] flex items-center justify-between text-right text-[11px] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-[#4A2F18] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {u.fullName.charAt(0)}
                      </span>
                      <span className="font-bold text-[#4A2F18] truncate">{u.fullName}</span>
                    </div>
                    <span className="text-[10px] text-[#8C6D53] shrink-0 font-medium">
                      @{u.username}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#8C6D53] space-y-1">
          <p className="font-bold text-[#4A2F18]">
            منصة السعيد — جميع الحقوق محفوظة © 1448 هـ / 2027 م
          </p>
          <p className="text-[11px] text-[#A27B5C]">
            الإصدار 1.0 • متصل بقاعدة بيانات Supabase السحابية
          </p>
        </div>

      </div>
    </div>
  );
};
