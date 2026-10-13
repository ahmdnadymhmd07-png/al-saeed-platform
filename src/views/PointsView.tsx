import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student, Reward } from '../types';
import { 
  Award, 
  Gift, 
  Trophy, 
  Plus, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Search,
  Edit3,
  Trash2,
  HelpCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

export const PointsView: React.FC = () => {
  const { 
    students, 
    rewards, 
    rewardGrants, 
    pointsLedger, 
    getStudentPoints, 
    deliverReward, 
    addManualPoints, 
    addReward,
    updateReward,
    deleteReward,
    selectedBranchId, 
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusStudentId, setBonusStudentId] = useState(students[0]?.id || '');
  const [bonusPoints, setBonusPoints] = useState(5);
  const [bonusReason, setBonusReason] = useState('إتقان حفظ وتلاوة الجزء كاملاً بدون أخطاء');
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);

  // Add reward modal
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newThreshold, setNewThreshold] = useState<number>(20);
  const [newDesc, setNewDesc] = useState('');

  // Edit reward modal
  const [rewardToEdit, setRewardToEdit] = useState<Reward | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editThreshold, setEditThreshold] = useState<number>(20);
  const [editDesc, setEditDesc] = useState('');

  // Delivery confirmation modal
  const [deliveryCandidate, setDeliveryCandidate] = useState<{ student: Student; reward: Reward } | null>(null);
  const [deliveryNote, setDeliveryNote] = useState('');

  // Filter students by branch
  const branchStudents = students.filter(s => {
    if (selectedBranchId !== 'all' && s.branchId !== selectedBranchId) return false;
    if (s.status === 'left') return false;
    if (searchQuery.trim()) {
      return s.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Sort students descending by active points (Leaderboard)
  const rankedStudents = [...branchStudents].sort((a, b) => getStudentPoints(b.id) - getStudentPoints(a.id));

  // Handle open deliver modal
  const handleOpenDeliverModal = (student: Student, reward: Reward) => {
    setDeliveryCandidate({ student, reward });
    setDeliveryNote('مبارك التفوق والالتزام المبارك');
  };

  // Confirm delivery
  const handleConfirmDeliver = () => {
    if (!deliveryCandidate) return;
    deliverReward(deliveryCandidate.student.id, deliveryCandidate.reward.id);
    setDeliveryNotice(`تم تسليم (${deliveryCandidate.reward.title}) للطالب (${deliveryCandidate.student.fullName}) بنجاح، وتوثيق ذلك في سجل الشرف التاريخي وتصفير رصيد النقاط.`);
    setDeliveryCandidate(null);
    setTimeout(() => setDeliveryNotice(null), 6000);
  };

  // Submit manual bonus points
  const handleAddBonusPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusStudentId || bonusPoints <= 0) return;
    addManualPoints(bonusStudentId, bonusPoints, bonusReason);
    setIsBonusModalOpen(false);
    setBonusReason('');
    setDeliveryNotice(`تم منح ${bonusPoints} نقاط تشجيعية للطالب بنجاح.`);
    setTimeout(() => setDeliveryNotice(null), 4000);
  };

  // Submit Add Reward
  const handleSaveNewReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newThreshold <= 0) return;
    addReward({
      title: newTitle.trim(),
      threshold: newThreshold,
      description: newDesc.trim() || 'جائزة تكريمية من المدرسة',
      active: true
    });
    setIsAddRewardOpen(false);
    setNewTitle('');
    setNewThreshold(20);
    setNewDesc('');
    setDeliveryNotice(`تمت إضافة الهدية الجديدة بنجاح إلى سلم الجوائز.`);
    setTimeout(() => setDeliveryNotice(null), 4000);
  };

  // Submit Edit Reward
  const handleSaveEditReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardToEdit || !editTitle.trim() || editThreshold <= 0) return;
    updateReward(rewardToEdit.id, {
      title: editTitle.trim(),
      threshold: editThreshold,
      description: editDesc.trim()
    });
    setRewardToEdit(null);
    setDeliveryNotice(`تم تعديل بيانات الهدية (${editTitle.trim()}) بنجاح.`);
    setTimeout(() => setDeliveryNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#4A2F18]">النقاط التحفيزية ومنظومة الجوائز التكريمية</h2>
          <p className="text-xs text-[#8C6D53]">
            احتساب نقطة لكل حصة حضور، وتصفير الرصيد تلقائياً عند تسليم الجائزة وتوثيق السجل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddRewardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#8C6D53]" />
            <span>إضافة هدية / مكافأة جديدة</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setIsBonusModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#D8C3AE]" />
              <span>منح نقاط تشجيعية يدوية</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanatory Banner: "ما هو إجراء التسليم؟" */}
      <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3.5 text-xs text-amber-950">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-xs">ما هو خانة «إجراء التسليم»؟</h4>
          <p className="text-[11px] leading-relaxed text-amber-900/90">
            عندما يحضر الطالب الحلقات القرآنية يكتسب نقطة تلقائية مع كل حضور؛ وعند بلوغ مجموع نقاطه الحد المقرر لأي هدية في السلم (مثال: 20 نقطة لمصحف، 40 نقطة لساعة)، تظهر له شارة <strong>«مستحق جائزة!»</strong>.
            <br />
            <strong>خانة «إجراء التسليم»:</strong> هي العملية الميدانية التي يقوم فيها المشرف أو المدير بتسليم الجائزة العينية للطالب باليد. وعند الضغط على زر <strong>(تسليم الجائزة)</strong>:
            يتم توثيق الاستلام رسمياً باسم الطالب وتاريخ اليوم والقائم بالتسليم في <strong>سجل الشرف التاريخي</strong>، ويُصفر عداد النقاط النشط ليعود إلى 0 ليبدأ الطالب مرحلة تحفيز جديدة نحو الجائزة التالية.
          </p>
        </div>
      </div>

      {deliveryNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{deliveryNotice}</span>
        </div>
      )}

      {/* Rewards Catalog Cards (with Edit & Delete options) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#4A2F18]">سلم الجوائز والتحفيز المعتمد (يمكنك إضافة أو تعديل أي هدية)</h3>
          <span className="text-[11px] text-[#8C6D53]">إجمالي الجوائز المعرفة: {rewards.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF] shadow-2xs relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#B9895B] to-[#4A2F18]" />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F6EEE4] flex items-center justify-center text-[#B9895B]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#4A2F18] bg-[#F6EEE4] px-2.5 py-1 rounded-md tabular-nums">
                      {reward.threshold} نقطة
                    </span>
                    
                    {/* Edit & Delete Buttons */}
                    <button
                      onClick={() => {
                        setRewardToEdit(reward);
                        setEditTitle(reward.title);
                        setEditThreshold(reward.threshold);
                        setEditDesc(reward.description);
                      }}
                      title="تعديل الهدية"
                      className="p-1 rounded-md hover:bg-[#F6EEE4] text-[#4A2F18] transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {currentUser.role === 'admin' && rewards.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من حذف الهدية (${reward.title})؟`)) {
                            deleteReward(reward.id);
                            setDeliveryNotice(`تم حذف الهدية بنجاح.`);
                          }
                        }}
                        title="حذف الهدية"
                        className="p-1 rounded-md hover:bg-red-50 text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-xs text-[#4A2F18]">{reward.title}</h4>
                <p className="text-[11px] text-[#8C6D53] mt-1">{reward.description}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E8DCCF] text-[11px] text-[#8C6D53] flex items-center justify-between">
                <span>تصفير الرصيد عند التسليم</span>
                <span className="text-emerald-700 font-bold">
                  {rewardGrants.filter(g => g.rewardId === reward.id).length} سُلمت تاريخياً
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table with Progress Bars & Deliver Buttons */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
        <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-[#4A2F18]">لوحة شرف وتنافس الطلاب (Leaderboard)</h3>
            <p className="text-[11px] text-[#8C6D53]">رصيد النقاط الفعلي، وشريط التقدم نحو الجائزة، وخانة إجراء التسليم الفوري</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-2 text-[#8C6D53]" />
            <input
              type="text"
              placeholder="بحث باسم الطالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-9 py-1 text-xs rounded-lg border border-[#E8DCCF] bg-[#FFFFFF]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E8DCCF] text-[#8C6D53] font-bold">
                <th className="py-3 px-4">الترتيب</th>
                <th className="py-3 px-4">الطالب</th>
                <th className="py-3 px-3">الرصيد الحالي</th>
                <th className="py-3 px-3">التقدم نحو الجائزة القادمة</th>
                <th className="py-3 px-3">حالة الاستحقاق</th>
                <th className="py-3 px-4 text-center">إجراء التسليم (تسليم الجائزة)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCF]">
              {rankedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8C6D53]">
                    لا يوجد طلاب مطابقون للبحث.
                  </td>
                </tr>
              ) : (
                rankedStudents.map((student, idx) => {
                  const currentPoints = getStudentPoints(student.id);
                  // Next reward to unlock
                  const eligibleReward = rewards.filter(r => currentPoints >= r.threshold).sort((a,b) => b.threshold - a.threshold)[0];
                  const nextReward = rewards.find(r => r.threshold > currentPoints) || rewards[rewards.length - 1];
                  const targetPoints = nextReward ? nextReward.threshold : 20;
                  const progressPct = Math.min(100, Math.round((currentPoints / targetPoints) * 100));

                  return (
                    <tr key={student.id} className="hover:bg-[#FDFBF9] transition">
                      
                      <td className="py-3 px-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] tabular-nums ${
                          idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          idx === 1 ? 'bg-slate-100 text-slate-800' :
                          idx === 2 ? 'bg-orange-100 text-orange-900' :
                          'bg-[#F6EEE4] text-[#8C6D53]'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-[#4A2F18] block">{student.fullName}</span>
                        <span className="text-[10px] text-[#8C6D53]">{student.grade}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-sm font-black text-[#4A2F18] tabular-nums">{currentPoints}</span>
                        <span className="text-[10px] text-[#8C6D53] mr-1">نقطة</span>
                      </td>

                      <td className="py-3 px-3 min-w-[160px]">
                        <div className="flex items-center justify-between text-[10px] text-[#8C6D53] mb-1">
                          <span>{nextReward?.title.split('(')[0]}</span>
                          <span className="tabular-nums font-bold">{currentPoints}/{targetPoints}</span>
                        </div>
                        <div className="w-full bg-[#F6EEE4] h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressPct}%` }}
                            className="bg-[#B9895B] h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {eligibleReward ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[11px] font-black animate-pulse">
                            <Gift className="w-3.5 h-3.5 text-amber-600" />
                            <span>مستحق: {eligibleReward.title}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8C6D53]">
                            متبقي {targetPoints - currentPoints} نقطة للهدية القادمة
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {eligibleReward ? (
                          <button
                            onClick={() => handleOpenDeliverModal(student, eligibleReward)}
                            className="px-3 py-1.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <Gift className="w-3.5 h-3.5 text-[#D8C3AE]" />
                            <span>تسليم الجائزة الآن</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8C6D53]">—</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivered Grants History */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs">
        <h3 className="text-xs font-bold text-[#4A2F18] mb-3">سجل الشرف والجوائز المسلمة تاريخياً (محفوظ بالكامل)</h3>
        <div className="divide-y divide-[#E8DCCF]">
          {rewardGrants.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8C6D53]">
              لم يتم تسليم جوائز بعد.
            </div>
          ) : (
            rewardGrants.map(grant => {
              const student = students.find(s => s.id === grant.studentId);
              return (
                <div key={grant.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#4A2F18] block">{student?.fullName}</span>
                      <span className="text-[11px] text-[#8C6D53]">
                        الجائزة: <strong>{grant.rewardTitle}</strong> ({grant.pointsCost} نقطة)
                      </span>
                    </div>
                  </div>

                  <div className="text-left text-[11px] text-[#8C6D53]">
                    <div className="font-bold text-[#4A2F18]">تاريخ التسليم: {grant.earnedAt}</div>
                    <div>المسؤول: {grant.deliveredBy || 'إدارة المدرسة'}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW REWARD (إضافة هدية جديدة) */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">إضافة هدية / مكافأة جديدة لسلم الجوائز</h3>
              <button onClick={() => setIsAddRewardOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveNewReward} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الجائزة / الهدية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصحف التهجد الفاخر، ساعة حائط الأذان..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">عدد النقاط المطلوبة للاستحقاق:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">وصف الجائزة أو الهدف التشجيعي:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="وصف مختصر للهدية..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setIsAddRewardOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg"
                >
                  إضافة الجائزة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT REWARD (تعديل الهدية) */}
      {rewardToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">تعديل بيانات الهدية والمكافأة</h3>
              <button onClick={() => setRewardToEdit(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSaveEditReward} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الجائزة / الهدية:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">عدد النقاط المطلوبة للاستحقاق:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editThreshold}
                  onChange={(e) => setEditThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">وصف الجائزة:</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setRewardToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM REWARD DELIVERY (إجراء تسليم الجائزة وتصفير الرصيد) */}
      {deliveryCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-amber-300 shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                <Gift className="w-5 h-5 text-amber-700 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#4A2F18]">تأكيد تسليم الجائزة وتصفير الرصيد</h3>
                <p className="text-[11px] text-[#8C6D53]">توثيق واقعة التسليم الرسمي للطالب</p>
              </div>
            </div>

            <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#8C6D53]">الطالب المكرم:</span>
                <span className="font-bold text-[#4A2F18]">{deliveryCandidate.student.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D53]">الجائزة المستحقة:</span>
                <span className="font-black text-amber-900">{deliveryCandidate.reward.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C6D53]">تكلفة النقاط المخصومة:</span>
                <span className="font-black tabular-nums text-red-700">-{deliveryCandidate.reward.threshold} نقطة</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#E8DCCF] text-[11px]">
                <span className="text-[#8C6D53]">رصيد النقاط بعد التسليم:</span>
                <span className="font-bold text-emerald-800">0 نقطة (يبدأ دورة جديدة)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A2F18] mb-1">كلمة تهنئة / ملاحظة التسليم:</label>
              <input
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DCCF]">
              <button
                type="button"
                onClick={() => setDeliveryCandidate(null)}
                className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDeliver}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-200" />
                <span>تأكيد التسليم وتصفير الرصيد</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MANUAL BONUS POINTS */}
      {isBonusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">منح نقاط تشجيعية يدوية (بقرار المدير)</h3>
              <button onClick={() => setIsBonusModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddBonusPoints} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">الطالب:</label>
                <select
                  value={bonusStudentId}
                  onChange={(e) => setBonusStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">عدد النقاط الإضافية:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-black tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">سبب المنح / الإنجاز:</label>
                <input
                  type="text"
                  required
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  placeholder="مثال: إتقان التجويد، المشاركة في مسابقة القرآن..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setIsBonusModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg"
                >
                  إضافة النقاط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
