import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Branch } from '../types';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  UserCheck, 
  Users, 
  BookOpen, 
  DollarSign, 
  Edit3, 
  Power, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface BranchesViewProps {
  onNavigateToStats: () => void;
}

export const BranchesView: React.FC<BranchesViewProps> = ({ onNavigateToStats }) => {
  const { 
    branches, 
    addBranch, 
    updateBranch, 
    toggleBranchStatus, 
    students, 
    teachers, 
    groups, 
    dues, 
    setSelectedBranchId, 
    selectedBranchId,
    currentUser 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [capacity, setCapacity] = useState<number>(100);
  const [notes, setNotes] = useState('');
  const [formNotice, setFormNotice] = useState<string | null>(null);

  // Totals across all branches
  const totalCapacity = branches.reduce((sum, b) => sum + (b.capacity || 100), 0);
  const totalStudents = students.length;
  const overallOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
  const activeBranchesCount = branches.filter(b => b.active).length;

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addBranch({
      name: name.trim(),
      city: city.trim() || 'الشرقية',
      address: address.trim(),
      phone: phone.trim(),
      managerName: managerName.trim() || 'إدارة الفرع',
      capacity: Number(capacity) || 100,
      establishedDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      active: true
    });

    setIsAddModalOpen(false);
    setName('');
    setCity('');
    setAddress('');
    setPhone('');
    setManagerName('');
    setCapacity(100);
    setNotes('');
    setFormNotice('تمت إضافة الفرع الجديد بنجاح وإدراجه في النظام المركزي.');
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name.trim()) return;

    updateBranch(editingBranch.id, {
      name: editingBranch.name.trim(),
      city: editingBranch.city?.trim(),
      address: editingBranch.address.trim(),
      phone: editingBranch.phone.trim(),
      managerName: editingBranch.managerName?.trim(),
      capacity: Number(editingBranch.capacity) || 100,
      notes: editingBranch.notes?.trim()
    });

    setEditingBranch(null);
    setFormNotice('تم تحديث بيانات الفرع بنجاح.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">إدارة فروع المدرسة القرآنية ومقارنة الأداء</h2>
            <p className="text-xs text-[#8C6D53]">
              المتابعة المركزية لكافة الفروع، توزيع الطاقة الاستيعابية، ونسب التحصيل والإشغال
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToStats}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-[#8C6D53]" />
              <span>مقارنة إحصائيات الفروع</span>
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D8C3AE]" />
                <span>إضافة فرع جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Multi-Branch Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#F6EEE4]/60 p-3.5 rounded-xl border border-[#E8DCCF]">
            <span className="text-[#8C6D53] font-bold block text-[11px]">الفروع النشطة</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#4A2F18] tabular-nums">{activeBranchesCount}</span>
              <span className="text-[10px] text-[#8C6D53]">من إجمالي {branches.length} فرع</span>
            </div>
          </div>

          <div className="bg-[#F6EEE4]/60 p-3.5 rounded-xl border border-[#E8DCCF]">
            <span className="text-[#8C6D53] font-bold block text-[11px]">إجمالي الطاقة الاستيعابية</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#4A2F18] tabular-nums">{totalCapacity}</span>
              <span className="text-[10px] text-[#8C6D53]">مقعد دارس</span>
            </div>
          </div>

          <div className="bg-[#F6EEE4]/60 p-3.5 rounded-xl border border-[#E8DCCF]">
            <span className="text-[#8C6D53] font-bold block text-[11px]">الطلاب المسجلون</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-800 tabular-nums">{totalStudents}</span>
              <span className="text-[10px] text-[#8C6D53]">طالب وطالبة</span>
            </div>
          </div>

          <div className="bg-[#F6EEE4]/60 p-3.5 rounded-xl border border-[#E8DCCF]">
            <span className="text-[#8C6D53] font-bold block text-[11px]">متوسط نسبة الإشغال</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-black text-[#B9895B] tabular-nums">{overallOccupancy}%</span>
              <span className="text-[10px] text-[#8C6D53]">من السعة الكلية</span>
            </div>
          </div>
        </div>
      </div>

      {formNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{formNotice}</span>
        </div>
      )}

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {branches.map(branch => {
          const branchStudents = students.filter(s => s.branchId === branch.id);
          const branchTeachers = teachers.filter(t => t.branchId === branch.id);
          const branchGroups = groups.filter(g => g.branchId === branch.id);
          const branchDues = dues.filter(d => d.branchId === branch.id);
          
          const collected = branchDues.reduce((sum, d) => sum + d.paidAmount, 0);
          const totalDue = branchDues.reduce((sum, d) => sum + d.amount, 0);
          const collectionRate = totalDue > 0 ? Math.round((collected / totalDue) * 100) : 100;
          
          const bCapacity = branch.capacity || 100;
          const occupancyRate = Math.min(100, Math.round((branchStudents.length / bCapacity) * 100));
          const isSelected = selectedBranchId === branch.id;

          return (
            <div 
              key={branch.id} 
              className={`bg-[#FFFFFF] rounded-2xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                isSelected ? 'border-[#4A2F18] ring-2 ring-[#4A2F18]/20' : 'border-[#E8DCCF]'
              }`}
            >
              <div>
                {/* Branch Card Header */}
                <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-center text-[#4A2F18]">
                      <Building2 className="w-5 h-5 text-[#8C6D53]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-[#4A2F18] line-clamp-1">{branch.name}</h3>
                      <span className="text-[11px] text-[#8C6D53]">{branch.city || 'الشرقية'}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    branch.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {branch.active ? 'نشط' : 'متوقف'}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="space-y-1.5 text-[11px] text-[#6D4C3D]">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#8C6D53]" />
                      <span>مدير الفرع: <strong className="text-[#4A2F18]">{branch.managerName || 'غير محدد'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6D53]" />
                      <span className="line-clamp-1">العنوان: {branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#8C6D53]" />
                      <span className="tabular-nums dir-ltr">{branch.phone}</span>
                    </div>
                  </div>

                  {/* Operational Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8DCCF] text-center">
                    <div className="p-1.5 bg-[#FBF8F5] rounded-lg">
                      <span className="text-[10px] text-[#8C6D53] block">الطلاب</span>
                      <strong className="text-xs font-black text-[#4A2F18] tabular-nums">{branchStudents.length}</strong>
                    </div>
                    <div className="p-1.5 bg-[#FBF8F5] rounded-lg">
                      <span className="text-[10px] text-[#8C6D53] block">المعلمون</span>
                      <strong className="text-xs font-black text-[#4A2F18] tabular-nums">{branchTeachers.length}</strong>
                    </div>
                    <div className="p-1.5 bg-[#FBF8F5] rounded-lg">
                      <span className="text-[10px] text-[#8C6D53] block">الحلقات</span>
                      <strong className="text-xs font-black text-[#4A2F18] tabular-nums">{branchGroups.length}</strong>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-[#8C6D53]">
                      <span>إشغال السعة ({branchStudents.length} من {bCapacity})</span>
                      <span className="font-bold tabular-nums">{occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${occupancyRate}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyRate > 90 ? 'bg-amber-600' : 'bg-[#4A2F18]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Financial Collection */}
                  <div className="pt-2 border-t border-[#E8DCCF] flex items-center justify-between text-[11px]">
                    <span className="text-[#8C6D53]">نسبة التحصيل:</span>
                    <span className="font-bold text-emerald-800 tabular-nums">
                      {collectionRate}% ({collected.toLocaleString()} ج)
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#FBF8F5] border-t border-[#E8DCCF] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                    isSelected 
                      ? 'bg-[#4A2F18] text-white' 
                      : 'bg-[#F6EEE4] text-[#4A2F18] hover:bg-[#EADDCF]'
                  }`}
                >
                  {isSelected ? 'الفرع المحدد حالياً' : 'تحديد الفرع للعمل'}
                </button>

                {currentUser.role === 'admin' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingBranch(branch)}
                      title="تعديل بيانات الفرع"
                      className="p-1.5 text-[#8C6D53] hover:bg-white rounded-md border border-[#E8DCCF] transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleBranchStatus(branch.id)}
                      title={branch.active ? 'إيقاف الفرع' : 'تفعيل الفرع'}
                      className={`p-1.5 rounded-md border transition cursor-pointer ${
                        branch.active 
                          ? 'text-red-600 border-red-200 hover:bg-red-50' 
                          : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">إضافة فرع مدرسي جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الفرع المعتمد *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع روضة الإيمان — ديرب نجم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المدينة / المركز</label>
                  <input
                    type="text"
                    placeholder="مثال: الزقازيق"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الطاقة الاستيعابية (طلاب)</label>
                  <input
                    type="number"
                    min={10}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-left tabular-nums font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم مدير الفرع</label>
                  <input
                    type="text"
                    placeholder="مثال: الشيخ عبد الحميد يوسف"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">هاتف الفرع للتواصل</label>
                  <input
                    type="tel"
                    placeholder="010XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-left tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="الشارع، بجوار معلم معروف..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات</label>
                <input
                  type="text"
                  placeholder="ملاحظات حول الفرع والمبنى..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ وتفعيل الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E8DCCF] shadow-xl overflow-hidden">
            <div className="bg-[#4A2F18] p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">تعديل بيانات الفرع: {editingBranch.name}</h3>
              <button onClick={() => setEditingBranch(null)} className="text-white hover:text-red-200 font-bold px-2 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateBranch} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المدينة / المركز</label>
                  <input
                    type="text"
                    value={editingBranch.city || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الطاقة الاستيعابية</label>
                  <input
                    type="number"
                    min={10}
                    value={editingBranch.capacity || 100}
                    onChange={(e) => setEditingBranch({ ...editingBranch, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-left tabular-nums font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">مدير الفرع</label>
                  <input
                    type="text"
                    value={editingBranch.managerName || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editingBranch.phone}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5] text-left tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">العنوان</label>
                <input
                  type="text"
                  value={editingBranch.address}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
