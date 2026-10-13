import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Users, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';

export const WhatsAppView: React.FC = () => {
  const { 
    students, 
    studentAttendance, 
    dues, 
    messageTemplates, 
    messageLogs, 
    logMessageSent, 
    settings, 
    checkStudentBan,
    selectedBranchId 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'absent' | 'late' | 'logs'>('absent');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Find students absent today
  const absentTodayAttendance = studentAttendance.filter(a => {
    if (a.date !== selectedDate) return false;
    if (a.status !== 'absent') return false; // Absent with excuse not sent automatically if setting enabled
    if (selectedBranchId !== 'all' && a.branchId !== selectedBranchId) return false;
    return true;
  });

  // Find overdue dues
  const overdueDues = dues.filter(d => {
    if (selectedBranchId !== 'all' && d.branchId !== selectedBranchId) return false;
    if (d.status === 'paid') return false;
    if (d.kind !== 'subscription') return false;
    return true;
  });

  // Compose text with template substitution
  const generateMessageText = (templateStr: string, vars: Record<string, string>) => {
    let result = templateStr;
    Object.keys(vars).forEach(key => {
      result = result.replaceAll(`{${key}}`, vars[key]);
    });
    return result;
  };

  // Build WhatsApp URL
  const buildWhatsAppLink = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  };

  // Handle single send
  const handleSendMessage = (studentId: string, type: 'absent' | 'late', customText?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const tpl = messageTemplates.find(t => t.type === type) || messageTemplates[0];
    const textToSend = customText || generateMessageText(tpl.template, {
      اسم_الطالب: student.fullName,
      التاريخ: selectedDate,
      القسم: 'القسم القرآني',
      المجموعة: 'الحلقة المعتمدة',
      المبلغ: '50',
      الشهر: selectedDate.slice(0, 7),
      اسم_المدرسة: settings.schoolName
    });

    // Log the message
    logMessageSent({
      studentId: student.id,
      studentName: student.fullName,
      phone: student.guardianPhone,
      type: tpl.name,
      text: textToSend
    });

    // Open WhatsApp link in new tab
    const url = buildWhatsAppLink(student.guardianPhone, textToSend);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">إشعارات ورسائل أولياء الأمور عبر واتساب</h2>
            <p className="text-xs text-[#8C6D53]">
              توليد رسائل فورية مجهزة بروابط wa.me مباشرة دون الحاجة لحفظ الأرقام بالهاتف
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#F6EEE4] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('absent')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'absent' ? 'bg-[#4A2F18] text-white' : 'text-[#6D4C3D]'
              }`}
            >
              تنبيهات الغياب اليومي ({absentTodayAttendance.length})
            </button>
            <button
              onClick={() => setActiveTab('late')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'late' ? 'bg-[#4A2F18] text-white' : 'text-[#6D4C3D]'
              }`}
            >
              تنبيهات المتأخرين مالياً ({overdueDues.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'logs' ? 'bg-[#4A2F18] text-white' : 'text-[#6D4C3D]'
              }`}
            >
              سجل الرسائل المرسلة
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Absent Students Queue */}
      {activeTab === 'absent' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#4A2F18]">
              قائمة الطلاب الغائبين ليوم {selectedDate}
            </h3>
            <span className="text-[11px] text-[#8C6D53]">
              الغياب بعذر لا يُرسل له تلقائياً وفق الإعدادات
            </span>
          </div>

          <div className="divide-y divide-[#E8DCCF]">
            {absentTodayAttendance.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C6D53]">
                لا توجد حالات غياب غير مبررة مسجلة في هذا التاريخ.
              </div>
            ) : (
              absentTodayAttendance.map(att => {
                const student = students.find(s => s.id === att.studentId);
                const hasSent = messageLogs.some(l => l.studentId === att.studentId && l.sentAt.startsWith(selectedDate));
                const template = messageTemplates.find(t => t.type === 'absent')?.template || '';
                const msgText = generateMessageText(template, {
                  اسم_الطالب: student?.fullName || '',
                  التاريخ: selectedDate,
                  القسم: att.departmentId === 'tahfeez' ? 'قسم التحفيظ' : 'لقاء الجمعة التربوي',
                  المجموعة: 'الحلقة المعتمدة',
                  اسم_المدرسة: settings.schoolName
                });

                return (
                  <div key={att.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FDFBF9]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#4A2F18]">{student?.fullName}</span>
                        {hasSent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            تم فتح الرابط مسبقاً
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8C6D53] mt-1 bg-[#FBF8F5] p-2 rounded-lg border border-[#E8DCCF]/60 max-w-2xl">
                        "{msgText}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSendMessage(att.studentId, 'absent', msgText)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال واتساب (wa.me)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Overdue Fees Queue */}
      {activeTab === 'late' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#4A2F18]">
              قائمة الطلاب المتأخرين في سداد الاشتراكات الشهرية
            </h3>
            <span className="text-[11px] text-[#8C6D53]">
              تذكير أولياء الأمور قبل سريان قرار تعليق الحضور
            </span>
          </div>

          <div className="divide-y divide-[#E8DCCF]">
            {overdueDues.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C6D53]">
                لا توجد اشتراكات متأخرة حالياً.
              </div>
            ) : (
              overdueDues.map(due => {
                const student = students.find(s => s.id === due.studentId);
                const remaining = due.amount - due.paidAmount;
                const template = messageTemplates.find(t => t.type === 'late')?.template || '';
                const msgText = generateMessageText(template, {
                  اسم_الطالب: student?.fullName || '',
                  المبلغ: remaining.toString(),
                  الشهر: due.month,
                  اسم_المدرسة: settings.schoolName
                });

                return (
                  <div key={due.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FDFBF9]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#4A2F18]">{student?.fullName}</span>
                        <span className="text-xs font-black text-red-700 tabular-nums">
                          متبقي: {remaining} ج (شهر {due.month})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8C6D53] mt-1 bg-[#FBF8F5] p-2 rounded-lg border border-[#E8DCCF]/60 max-w-2xl">
                        "{msgText}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSendMessage(due.studentId, 'late', msgText)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال تنبيه سداد</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#4A2F18]">سجل الرسائل وتنبيهات الواتساب</h3>
            <span className="text-[11px] text-[#8C6D53]">
              توثيق عمليات الإرسال لمنع التكرار
            </span>
          </div>

          <div className="divide-y divide-[#E8DCCF]">
            {messageLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C6D53]">
                لا توجد رسائل موثقة بعد.
              </div>
            ) : (
              messageLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFBF9] text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#4A2F18]">
                      <span>{log.studentName}</span>
                      <span className="text-[10px] text-[#8C6D53] font-normal tabular-nums dir-ltr">({log.phone})</span>
                      <span className="text-[10px] bg-[#F6EEE4] text-[#8C6D53] px-2 py-0.5 rounded font-bold">{log.type}</span>
                    </div>
                    <p className="text-[11px] text-[#8C6D53] mt-1 line-clamp-1">{log.text}</p>
                  </div>
                  <div className="text-left text-[#8C6D53] text-[11px] tabular-nums shrink-0">
                    {new Date(log.sentAt).toLocaleString('ar-EG')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
