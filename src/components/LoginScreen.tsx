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
  ShieldCheck
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, settings } = useApp();
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
            <h1 className="text-xl sm:text-2xl font-black text-[#4A2F18] tracking-tight">
              منصة السعيد — نظام إدارة المدارس القرآنية
            </h1>
            <p className="text-sm font-extrabold text-[#8C6D53] mt-1.5">
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
                  placeholder="أدخل اسم المستخدم أو رقم الهاتف"
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

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#8C6D53] space-y-1">
          <p className="font-bold text-[#4A2F18]">
            منصة السعيد — جميع الحقوق محفوظة © 1448 هـ / 2027 م
          </p>
        </div>

      </div>
    </div>
  );
};
