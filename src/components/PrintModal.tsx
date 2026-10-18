import React from 'react';
import { useApp } from '../context/AppContext';
import { Student, Payment } from '../types';
import { Printer } from 'lucide-react';

interface PrintModalProps {
  type: 'admission' | 'receipt' | 'gatekeeper' | null;
  student?: Student | null;
  payment?: Payment | null;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ type, student, payment, onClose }) => {
  const { 
    settings, 
    branches, 
    selectedBranchId, 
    students, 
    groups, 
    checkStudentBan 
  } = useApp();

  if (!type) return null;

  const currentBranch = branches.find(b => b.id === (student?.branchId || payment?.branchId || selectedBranchId)) || branches[0];
  const branchStudents = selectedBranchId === 'all' ? students : students.filter(s => s.branchId === selectedBranchId);
  const bannedList = branchStudents.filter(s => checkStudentBan(s.id).isBanned);

  const handlePrint = () => {
    window.print();
  };

  const isFemale = student?.gender === 'female';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl border border-[#E8DCCF] shadow-2xl overflow-hidden my-6">
        
        {/* Modal Controls (hidden during print) */}
        <div className="no-print bg-[#4A2F18] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#D8C3AE]" />
            <h3 className="text-xs font-bold">معاينة المستند الرسمي للطباعة</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#B9895B] hover:bg-[#A37549] text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              طباعة المستند الآن (Print)
            </button>
            <button onClick={onClose} className="text-white hover:text-red-200 text-lg font-bold px-2 cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Paper A4 Layout */}
        <div className="p-8 sm:p-10 text-xs text-[#2C1810] space-y-6">
          
          {/* Header */}
          <div className="border-b-2 border-[#4A2F18] pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-base font-black text-[#4A2F18]">{settings.associationName}</h1>
              <h2 className="text-sm font-extrabold text-[#B9895B] mt-0.5">{settings.schoolName}</h2>
              <h3 className="text-xs font-bold text-[#8C6D53] mt-0.5">{currentBranch?.name}</h3>
            </div>
            <img 
              src={settings.logoUrl || '/school_logo.jpg'} 
              alt="شعار المدرسة" 
              className="w-14 h-14 rounded-full object-cover border border-[#B9895B]/40"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.src = '/school_logo.jpg'; }}
            />
          </div>

          {/* 1. Admission Form Document */}
          {type === 'admission' && student && (
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-[#E8DCCF]">
                <h3 className="text-sm font-black text-[#4A2F18]">
                  استمارة التحاق {isFemale ? 'طالبة' : 'طالب'} وإقرار الالتزام بالشروط واللوائح
                </h3>
                <span className="text-[11px] text-[#8C6D53]">العام الدراسي 2026-2027 م / 1447-1448 هـ</span>
              </div>

              {/* جدول البيانات الشخصية متضمناً النوع */}
              <div className="grid grid-cols-2 gap-3 bg-[#FBF8F5] p-3.5 rounded-xl border border-[#E8DCCF] text-xs">
                <div><span>الاسم رباعي:</span> <strong className="text-[#4A2F18]">{student.fullName}</strong></div>
                <div><span>النوع (الجنس):</span> <strong className="text-[#4A2F18]">{isFemale ? 'أنثى' : 'ذكر'}</strong></div>
                <div><span>الصف والمرحلة:</span> <strong className="text-[#4A2F18]">{student.grade}</strong></div>
                <div><span>رقم ولي الأمر:</span> <strong className="tabular-nums dir-ltr text-right">{student.guardianPhone}</strong></div>
                <div><span>تاريخ الالتحاق:</span> <strong className="tabular-nums">{student.joinDate}</strong></div>
                <div><span>حلقة التحفيظ:</span> <strong>{groups.find(g => g.id === student.tahfeezGroupId)?.name || '—'}</strong></div>
                <div className="col-span-2"><span>لقاء الجمعة التربوي:</span> <strong>{groups.find(g => g.id === student.tarbawiGroupId)?.name || '—'}</strong></div>
              </div>

              {/* التعهد والإقرار مع ضبط التذكير والتأنيث */}
              <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] text-[11px] leading-relaxed space-y-1">
                <span className="font-bold text-[#4A2F18] block text-xs">إقرار وتعهد ولي الأمر:</span>
                <p>
                  أقر أنا ولي أمر {isFemale ? 'الطالبة المذكورة' : 'الطالب المذكور'} أعلاه باطلاعي على شروط ولوائح مدرسة السعيد القرآنية المعتمدة، وأتعهد بالآتي:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[#6D4C3D] pr-2">
                  <li>الالتزام بحضور قسمي التحفيظ ولقاء الجمعة التربوي بانتظام.</li>
                  <li>عدم الغياب إلا لعذر قهري مثبت بإفادة خطية لمشرفة الغياب.</li>
                  <li>الالتزام التام باللائحة: (6 غيابات توجب الاستدعاء والمنع • 8 غيابات توجب الغرامة • 10 غيابات توجب الفصل لشهرين).</li>
                  <li>سداد الاشتراك الشهري بانتظام قبل يوم 10 من كل شهر ميلادي.</li>
                  <li>الالتزام بالزي والسمت الإسلامي اللائق داخل مقر المدرسة.</li>
                </ol>
              </div>

              <div className="pt-6 border-t border-[#4A2F18] flex items-center justify-between text-xs">
                <div className="text-center">
                  <span>توقيع ولي الأمر</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
                <div className="text-center">
                  <span>توقيع مسؤول التسجيل</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
                <div className="text-center">
                  <span>خاتم المدرسة واعتماد الإدارة</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* 2. Official Payment Receipt Document */}
          {type === 'receipt' && payment && (
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-[#E8DCCF]">
                <h3 className="text-sm font-black text-[#4A2F18]">
                  إيصال تحصيل وسداد رسمي (رقم: {payment.receiptNo})
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#FBF8F5] p-3.5 rounded-xl border border-[#E8DCCF] text-xs">
                <div><span>اسم الطالب:</span> <strong className="text-[#4A2F18]">{students.find(s => s.id === payment.studentId)?.fullName}</strong></div>
                <div><span>تاريخ السداد:</span> <strong className="tabular-nums">{payment.date}</strong></div>
                <div><span>طريقة الدفع:</span> <strong>{payment.method === 'cash' ? 'نقدي بالخزينة' : payment.method}</strong></div>
                <div><span>المستلم:</span> <strong>{payment.userName}</strong></div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs">المبلغ المحصل نقداً:</span>
                <span className="text-xl font-black text-emerald-900 tabular-nums">{payment.amount} جنيهاً مصرياً</span>
              </div>

              {payment.notes && (
                <div className="text-[11px] text-[#8C6D53]">
                  <span>ملاحظات: {payment.notes}</span>
                </div>
              )}

              <div className="pt-6 border-t border-[#4A2F18] flex items-center justify-between text-xs">
                <div className="text-center">
                  <span>توقيع المحصل</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
                <div className="text-center">
                  <span>ختم الخزينة المعتمد</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Gatekeeper Banned List Document */}
          {type === 'gatekeeper' && (
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-red-300 bg-red-50 p-2 rounded-lg">
                <h3 className="text-sm font-black text-red-900">
                  كشف الممنوعين من الدخول اليوم — خاص بالبوابة والأمن المدرسي
                </h3>
                <span className="text-[11px] text-red-700">تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG')}</span>
              </div>

              <table className="w-full text-right border-collapse text-xs border border-[#E8DCCF]">
                <thead>
                  <tr className="bg-red-100 text-red-900 font-bold border-b border-red-200">
                    <th className="py-2 px-3 border-l border-red-200 text-center w-10">م</th>
                    <th className="py-2 px-4 border-l border-red-200">اسم الطالب</th>
                    <th className="py-2 px-3 border-l border-red-200">النوع</th>
                    <th className="py-2 px-3 border-l border-red-200">الصف</th>
                    <th className="py-2 px-3 border-l border-red-200">رقم ولي الأمر</th>
                    <th className="py-2 px-4">سبب المنع والإجراء المطلوب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCF]">
                  {bannedList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-emerald-800 font-bold">
                        لا يوجد أي طالب ممنوع من الدخول اليوم.
                      </td>
                    </tr>
                  ) : (
                    bannedList.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="py-2 px-3 border-l border-[#E8DCCF] text-center font-bold tabular-nums">{idx + 1}</td>
                        <td className="py-2 px-4 border-l border-[#E8DCCF] font-bold text-[#4A2F18]">{s.fullName}</td>
                        <td className="py-2 px-3 border-l border-[#E8DCCF]">{s.gender === 'female' ? 'أنثى' : 'ذكر'}</td>
                        <td className="py-2 px-3 border-l border-[#E8DCCF]">{s.grade}</td>
                        <td className="py-2 px-3 border-l border-[#E8DCCF] tabular-nums dir-ltr text-right">{s.guardianPhone}</td>
                        <td className="py-2 px-4 text-red-700 font-bold">{checkStudentBan(s.id).details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="pt-6 border-t border-[#4A2F18] flex items-center justify-between text-xs">
                <div className="text-center">
                  <span>مشرف الأمن والبوابة</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
                <div className="text-center">
                  <span>اعتماد إدارة المدرسة</span>
                  <div className="h-10 border-b border-dotted border-[#8C6D53] w-32 mt-2" />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
