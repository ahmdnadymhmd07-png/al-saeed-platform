import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Due, Payment, StoreItem, Sale } from '../types';
import { 
  DollarSign, 
  CreditCard, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Receipt,
  Sparkles,
  RefreshCw,
  BookOpen,
  Plus,
  ShoppingCart,
  Edit3,
  Trash2,
  Package,
  TrendingUp,
  BarChart2
} from 'lucide-react';

interface FinanceViewProps {
  onPrintReceipt: (payment: Payment) => void;
  initialSubTab?: 'subscriptions' | 'books' | 'payments' | 'summary';
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onPrintReceipt, initialSubTab = 'subscriptions' }) => {
  const { 
    dues, 
    payments, 
    students, 
    families, 
    storeItems,
    sales, 
    generateMonthlyDues, 
    recordPayment, 
    recordSale,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem,
    selectedBranchId, 
    settings,
    currentUser 
  } = useApp();

  // Top sub-tab state
  const [activeSubTab, setActiveSubTab] = useState<'subscriptions' | 'books' | 'payments' | 'summary'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<string>('all');
  
  // Payment modal state
  const [activeDueToPay, setActiveDueToPay] = useState<Due | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Payment['method']>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [paySuccessNotice, setPaySuccessNotice] = useState<string | null>(null);

  // Book Store state
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StoreItem | null>(null);
  
  // Sell form state
  const [sellItemId, setSellItemId] = useState<string>(storeItems[0]?.id || '');
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellStudentId, setSellStudentId] = useState<string>('');
  const [storeNotice, setStoreNotice] = useState<string | null>(null);

  // New Item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<StoreItem['type']>('book');
  const [newItemPrice, setNewItemPrice] = useState<number>(25);
  const [newItemStock, setNewItemStock] = useState<number>(50);
  const [newItemDesc, setNewItemDesc] = useState('');

  // Edit Item form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<StoreItem['type']>('book');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Filter branch dues
  const filteredDues = useMemo(() => {
    return dues.filter(d => {
      if (selectedBranchId !== 'all' && d.branchId !== selectedBranchId) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (kindFilter !== 'all' && d.kind !== kindFilter) return false;
      
      const student = students.find(s => s.id === d.studentId);
      if (searchQuery.trim() && student) {
        const q = searchQuery.toLowerCase();
        if (!student.fullName.toLowerCase().includes(q) && !student.guardianPhone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [dues, selectedBranchId, statusFilter, kindFilter, searchQuery, students]);

  // Financial statistics
  const totalDueAmount = filteredDues.reduce((sum, d) => sum + d.amount, 0);
  const totalCollected = filteredDues.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalArrears = Math.max(0, totalDueAmount - totalCollected);
  const totalDiscounts = filteredDues.reduce((sum, d) => sum + (d.orphanDiscount + d.siblingDiscount), 0);

  // Store sales data for branch
  const branchSales = selectedBranchId === 'all' ? sales : sales.filter(s => s.branchId === selectedBranchId);
  const totalSalesRevenue = branchSales.reduce((acc, curr) => acc + curr.total, 0);

  // Filter store items
  const filteredStoreItems = useMemo(() => {
    return storeItems.filter(item => {
      if (selectedBranchId !== 'all' && item.branchId !== selectedBranchId && item.branchId !== 'b1') return false;
      if (bookSearchQuery.trim()) {
        return item.name.toLowerCase().includes(bookSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [storeItems, selectedBranchId, bookSearchQuery]);

  // Open Payment Modal
  const handleOpenPay = (due: Due) => {
    setActiveDueToPay(due);
    setPayAmount(due.amount - due.paidAmount);
    setPayMethod('cash');
    setPayNotes('');
    setPaySuccessNotice(null);
  };

  // Submit Payment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDueToPay || payAmount <= 0) return;

    const payment = recordPayment({
      branchId: activeDueToPay.branchId,
      dueId: activeDueToPay.id,
      studentId: activeDueToPay.studentId,
      amount: payAmount,
      date: new Date().toISOString().slice(0, 10),
      method: payMethod,
      notes: payNotes.trim()
    });

    setActiveDueToPay(null);
    setPaySuccessNotice(`تم تسجيل الدفعة بنجاح برقم إيصال ${payment.receiptNo}. وتم رفع أي تعليق مرتبط فوراً!`);
    onPrintReceipt(payment);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: StoreItem) => {
    setItemToEdit(item);
    setEditName(item.name);
    setEditType(item.type);
    setEditPrice(item.unitPrice);
    setEditStock(item.stock);
    setEditDesc(item.description || '');
    setEditActive(item.active);
  };

  // Submit Item Edit
  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit || !editName.trim() || editPrice <= 0) return;

    updateStoreItem(itemToEdit.id, {
      name: editName.trim(),
      type: editType,
      unitPrice: editPrice,
      stock: editStock,
      description: editDesc.trim(),
      active: editActive
    });

    setItemToEdit(null);
    setStoreNotice(`تم تحديث بيانات الصنف (${editName.trim()}) والمخزون بنجاح!`);
    setTimeout(() => setStoreNotice(null), 4000);
  };

  // Handle Add Item
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice <= 0) return;

    addStoreItem({
      branchId: selectedBranchId === 'all' ? 'b1' : selectedBranchId,
      name: newItemName.trim(),
      type: newItemType,
      unitPrice: newItemPrice,
      stock: newItemStock,
      description: newItemDesc.trim(),
      active: true
    });

    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemPrice(25);
    setNewItemStock(50);
    setNewItemDesc('');
    setStoreNotice(`تمت إضافة الصنف الجديد بنجاح إلى كتالوج المكتبة والمستلزمات.`);
    setTimeout(() => setStoreNotice(null), 4000);
  };

  // Execute Sale
  const handleExecuteSale = (e: React.FormEvent) => {
    e.preventDefault();
    const item = storeItems.find(i => i.id === sellItemId);
    if (!item || sellQuantity <= 0) return;

    const student = students.find(s => s.id === sellStudentId);
    const total = item.unitPrice * sellQuantity;

    const sale = recordSale({
      branchId: selectedBranchId === 'all' ? (item.branchId || 'b1') : selectedBranchId,
      itemId: item.id,
      itemName: item.name,
      studentId: student?.id,
      studentName: student?.fullName,
      quantity: sellQuantity,
      unitPrice: item.unitPrice,
      total,
      date: new Date().toISOString().slice(0, 10)
    });

    setIsSellModalOpen(false);
    setStoreNotice(`تم تسجيل حركة البيع بنجاح برقم إيصال ${sale.receiptNo}! المتبقي في المخزن: ${Math.max(0, item.stock - sellQuantity)} قطعة.`);
    setTimeout(() => setStoreNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#4A2F18]">التحصيل المالي الشامل ومبيعات الكتب</h2>
            <p className="text-xs text-[#8C6D53]">
              إدارة الاشتراكات الشهرية، متأخرات الطلاب، كتالوج مبيعات الكتب والمستلزمات، وسجل الإيصالات الموحد
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#F6EEE4] px-3 py-1.5 rounded-xl border border-[#E8DCCF] text-xs">
              <Calendar className="w-4 h-4 text-[#8C6D53]" />
              <span className="font-bold text-[#4A2F18]">الشهر:</span>
              <input
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="bg-transparent font-bold text-[#4A2F18] focus:outline-hidden"
              />
            </div>

            {(currentUser.role === 'admin' || currentUser.role === 'finance') && (
              <button
                onClick={() => generateMonthlyDues(currentMonth)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                title="إنشاء مطالبات اشتراك الشهر لجميع الطلاب المقيدين تلقائياً وتطبيق إعفاءات الأيتام وخصومات الإخوة وفق اللائحة"
              >
                <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
                <span>توليد استحقاقات الشهر للنشطين</span>
              </button>
            )}
          </div>
        </div>

        {/* Unified Sub-Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSubTab === 'subscriptions' 
                ? 'bg-[#4A2F18] text-white shadow-2xs' 
                : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>الاشتراكات والرسوم الشهرية ({filteredDues.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSubTab === 'books' 
                ? 'bg-[#4A2F18] text-white shadow-2xs' 
                : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>مبيعات الكتب والمستلزمات والمخزن ({storeItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSubTab === 'payments' 
                ? 'bg-[#4A2F18] text-white shadow-2xs' 
                : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>سجل المقبوضات وفواتير البيع ({payments.length + branchSales.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeSubTab === 'summary' 
                ? 'bg-[#4A2F18] text-white shadow-2xs' 
                : 'bg-[#F6EEE4] text-[#6D4C3D] hover:bg-[#EADDCF]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>الملخص والتحليل المالي</span>
          </button>
        </div>

        {/* Quick Financial Summary Strips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="bg-[#F6EEE4]/60 p-3 rounded-xl border border-[#E8DCCF]">
            <span className="text-[#8C6D53] block text-[11px]">إجمالي اشتراكات الشهر</span>
            <span className="text-base font-black text-[#4A2F18] tabular-nums mt-0.5 block">
              {totalDueAmount.toLocaleString()} ج.م
            </span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 block text-[11px]">المحصل الفعلي (اشتراكات)</span>
            <span className="text-base font-black text-emerald-900 tabular-nums mt-0.5 block">
              {totalCollected.toLocaleString()} ج.م
            </span>
          </div>

          <div className="bg-red-50/80 p-3 rounded-xl border border-red-200">
            <span className="text-red-800 block text-[11px]">المتأخرات غير المسددة</span>
            <span className="text-base font-black text-red-900 tabular-nums mt-0.5 block">
              {totalArrears.toLocaleString()} ج.م
            </span>
          </div>

          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200">
            <span className="text-blue-800 block text-[11px]">إيرادات مبيعات الكتب</span>
            <span className="text-base font-black text-blue-900 tabular-nums mt-0.5 block">
              {totalSalesRevenue.toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>

      {paySuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{paySuccessNotice}</span>
        </div>
      )}

      {storeNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{storeNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MONTHLY SUBSCRIPTIONS & DUES                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'subscriptions' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8DCCF]">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#8C6D53]" />
              <input
                type="text"
                placeholder="بحث باسم الطالب أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-medium"
              >
                <option value="all">كل حالات السداد</option>
                <option value="unpaid">غير مسدد (متأخر)</option>
                <option value="paid">مسدد بالكامل</option>
              </select>
            </div>

            <div>
              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
                className="w-full py-1.5 px-3 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-medium"
              >
                <option value="all">كل بنود المطالبات</option>
                <option value="subscription">اشتراك شهري</option>
                <option value="fine">غرامة انضباط وغياب</option>
              </select>
            </div>
          </div>

          {/* Dues Table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F6EEE4] border-b border-[#E8DCCF] text-[#4A2F18] font-bold">
                    <th className="py-3 px-4">الطالب والفرع</th>
                    <th className="py-3 px-3">الشهر والبند</th>
                    <th className="py-3 px-3">الاشتراك الأساسي</th>
                    <th className="py-3 px-3">الخصومات (أيتام/إخوة)</th>
                    <th className="py-3 px-3">المطلوب سداده</th>
                    <th className="py-3 px-3">المدفوع</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-4 text-center">إجراء السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCF]">
                  {filteredDues.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#8C6D53]">
                        لا توجد مطالبات أو استحقاقات مطابقة للشهر والمرشحات المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredDues.map(due => {
                      const student = students.find(s => s.id === due.studentId);
                      const isOverdue = due.status !== 'paid';

                      return (
                        <tr key={due.id} className="hover:bg-[#FDFBF9] transition">
                          
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#4A2F18] block">{student?.fullName || 'طالب غير محدد'}</span>
                            <span className="text-[10px] text-[#8C6D53]">{student?.grade}</span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-[#4A2F18] block">{due.month}</span>
                            <span className="text-[10px] text-[#8C6D53]">
                              {due.kind === 'subscription' ? 'اشتراك شهري موحد' : 'غرامة انضباط (غياب 8+)'}
                            </span>
                          </td>

                          <td className="py-3 px-3 tabular-nums font-bold text-[#4A2F18]">
                            {due.grossAmount} ج
                          </td>

                          <td className="py-3 px-3">
                            {(due.orphanDiscount > 0 || due.siblingDiscount > 0) ? (
                              <div className="text-[11px] font-bold text-blue-700">
                                {due.orphanDiscount > 0 && <span>يتيم: -{due.orphanDiscount} ج </span>}
                                {due.siblingDiscount > 0 && <span>إخوة: -{due.siblingDiscount} ج</span>}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8C6D53]">بدون خصم</span>
                            )}
                          </td>

                          <td className="py-3 px-3 tabular-nums font-black text-sm text-[#4A2F18]">
                            {due.amount} ج
                          </td>

                          <td className="py-3 px-3 tabular-nums font-bold text-emerald-800">
                            {due.paidAmount} ج
                          </td>

                          <td className="py-3 px-3">
                            {due.status === 'paid' ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                                مسدد
                              </span>
                            ) : (
                              <span className="text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-200">
                                متأخر ({due.amount - due.paidAmount} ج)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center">
                            {due.status !== 'paid' ? (
                              <button
                                onClick={() => handleOpenPay(due)}
                                className="px-3 py-1.5 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-[#D8C3AE]" />
                                <span>سداد وإيصال</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>تم السداد</span>
                              </span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: BOOK STORE & MERCHANDISE (مبيعات الكتب وتعديل الأصناف)          */}
      {/* ========================================================================= */}
      {activeSubTab === 'books' && (
        <div className="space-y-5">
          
          {/* Action Header for Book Store */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E8DCCF]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-[#8C6D53]" />
              <input
                type="text"
                placeholder="بحث باسم الكتاب أو المصحف أو المقرر الدراسي..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#8C6D53]" />
                <span>إضافة صنف جديد</span>
              </button>
              
              <button
                onClick={() => {
                  setSellItemId(storeItems[0]?.id || '');
                  setSellQuantity(1);
                  setSellStudentId('');
                  setIsSellModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A2F18] hover:bg-[#382312] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-[#D8C3AE]" />
                <span>تسجيل حركة بيع فورية</span>
              </button>
            </div>
          </div>

          {/* Catalog Cards with Direct Edit and Stock Management */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#4A2F18]">كتالوج الأصناف المتاحة وإدارة المخزون والأسعار</h3>
              <span className="text-[11px] text-[#8C6D53]">يمكنك تعديل أي صنف أو تحديث سعره ومخزونه مباشرة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredStoreItems.map(item => {
                const isLowStock = item.stock <= 5;
                return (
                  <div 
                    key={item.id} 
                    className={`bg-[#FFFFFF] p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition ${
                      !item.active ? 'opacity-60 bg-gray-50 border-gray-300' : 'border-[#E8DCCF] hover:border-[#B9895B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-[#F6EEE4] text-[#8C6D53] font-bold px-2 py-0.5 rounded">
                          {item.type === 'book' ? 'كتاب منهجي' :
                           item.type === 'notebook' ? 'دفتر دراسي' :
                           item.type === 'mushaf' ? 'مصحف شريف' : 'مستلزمات أخرى'}
                        </span>
                        <span className={`text-[11px] font-bold tabular-nums px-2 py-0.5 rounded ${
                          isLowStock ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-gray-100 text-[#4A2F18]'
                        }`}>
                          المخزون: {item.stock}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-[#4A2F18] line-clamp-2">{item.name}</h4>
                      {item.description && (
                        <p className="text-[10px] text-[#8C6D53] mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E8DCCF] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-[#4A2F18] tabular-nums">
                          {item.unitPrice} ج.م
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            title="تعديل بيانات وسعر ومخزون الصنف"
                            className="p-1.5 rounded-lg bg-[#F6EEE4] hover:bg-[#EADDCF] text-[#4A2F18] transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف الصنف (${item.name}) من الكتالوج؟`)) {
                                  deleteStoreItem(item.id);
                                  setStoreNotice(`تم حذف الصنف (${item.name}) بنجاح.`);
                                }
                              }}
                              title="حذف الصنف"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSellItemId(item.id);
                          setSellQuantity(1);
                          setSellStudentId('');
                          setIsSellModalOpen(true);
                        }}
                        disabled={item.stock <= 0 || !item.active}
                        className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                          item.stock <= 0 || !item.active 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-[#B9895B] hover:bg-[#A37549] text-white cursor-pointer shadow-2xs'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{item.stock <= 0 ? 'نفد المخزون' : 'تسجيل بيع فوري'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Sales Ledger */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
            <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#4A2F18]">سجل المبيعات الأخير وإيصالات الكتب</h3>
              <span className="text-xs font-bold text-[#4A2F18] tabular-nums">
                إجمالي إيراد الكتب: {totalSalesRevenue.toLocaleString()} ج.م
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E8DCCF] text-[#8C6D53] font-bold">
                    <th className="py-2.5 px-4">رقم الإيصال</th>
                    <th className="py-2.5 px-3">الصنف المباع</th>
                    <th className="py-2.5 px-3">الكمية</th>
                    <th className="py-2.5 px-3">سعر الوحدة</th>
                    <th className="py-2.5 px-3">الإجمالي</th>
                    <th className="py-2.5 px-3">المشتري (الطالب)</th>
                    <th className="py-2.5 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCF]">
                  {branchSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-[#8C6D53]">
                        لا توجد حركات مبيعات مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    branchSales.slice(0, 10).map(sale => (
                      <tr key={sale.id} className="hover:bg-[#FDFBF9]">
                        <td className="py-2.5 px-4 font-mono font-bold text-[#4A2F18]">{sale.receiptNo}</td>
                        <td className="py-2.5 px-3 font-medium text-[#4A2F18]">{sale.itemName}</td>
                        <td className="py-2.5 px-3 tabular-nums font-bold">{sale.quantity}</td>
                        <td className="py-2.5 px-3 tabular-nums">{sale.unitPrice} ج</td>
                        <td className="py-2.5 px-3 tabular-nums font-black text-[#4A2F18]">{sale.total} ج</td>
                        <td className="py-2.5 px-3 text-[#8C6D53]">{sale.studentName || 'مشتري عام (نقدي)'}</td>
                        <td className="py-2.5 px-4 tabular-nums text-[#8C6D53]">{sale.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: COMBINED PAYMENTS & SALES LEDGER                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'payments' && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DCCF] overflow-hidden shadow-2xs">
          <div className="p-4 bg-[#F6EEE4] border-b border-[#E8DCCF] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#4A2F18]">سجل المقبوضات والإيصالات المسددة (اشتراكات + مبيعات)</h3>
            <span className="text-xs text-[#8C6D53]">
              عدد الإيصالات: {payments.length} اشتراكات • {branchSales.length} مبيعات
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[#8C6D53] font-bold">
                  <th className="py-3 px-4">رقم الإيصال</th>
                  <th className="py-3 px-3">نوع الحركة</th>
                  <th className="py-3 px-3">البيان / المستفيد</th>
                  <th className="py-3 px-3">المبلغ</th>
                  <th className="py-3 px-3">طريقة السداد</th>
                  <th className="py-3 px-3">المحصل</th>
                  <th className="py-3 px-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]">
                {payments.map(p => {
                  const student = students.find(s => s.id === p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-[#FDFBF9]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#4A2F18]">{p.receiptNo}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          اشتراك شهري
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[#4A2F18]">{student?.fullName}</td>
                      <td className="py-2.5 px-3 tabular-nums font-black text-emerald-900">{p.amount} ج</td>
                      <td className="py-2.5 px-3 text-[#8C6D53]">
                        {p.method === 'cash' ? 'نقدي (الخزينة)' :
                         p.method === 'vodafone_cash' ? 'فودافون كاش' :
                         p.method === 'fawry' ? 'فوري' : 'تحويل بنكي'}
                      </td>
                      <td className="py-2.5 px-3 text-[#8C6D53]">{p.userName}</td>
                      <td className="py-2.5 px-4 tabular-nums text-[#8C6D53]">{p.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: FINANCIAL SUMMARY & ANALYTICS                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-[#4A2F18] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#B9895B]" />
              <span>معدل التحصيل ونسب السداد للمدرسة</span>
            </h3>
            
            <div className="space-y-2 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-[#8C6D53] mb-1">
                  <span>نسبة تحصيل الاشتراكات</span>
                  <span className="tabular-nums font-bold">
                    {totalDueAmount > 0 ? Math.round((totalCollected / totalDueAmount) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-[#F6EEE4] h-2.5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${totalDueAmount > 0 ? Math.min(100, Math.round((totalCollected / totalDueAmount) * 100)) : 0}%` }}
                    className="bg-emerald-600 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DCCF] grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                  <span className="text-[#8C6D53] block">إجمالي الخصومات الممنوحة</span>
                  <span className="text-sm font-black text-blue-800 tabular-nums mt-0.5 block">
                    {totalDiscounts.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                  <span className="text-[#8C6D53] block">متوسط الاشتراك للطالب</span>
                  <span className="text-sm font-black text-[#4A2F18] tabular-nums mt-0.5 block">
                    {students.length > 0 ? Math.round(totalDueAmount / students.length) : 0} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E8DCCF] shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-[#4A2F18] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#B9895B]" />
              <span>حركة مخزون الكتب والمبيعات الميدانية</span>
            </h3>

            <div className="space-y-2 text-xs">
              <p className="text-[#8C6D53] text-[11px] leading-relaxed">
                يتم خصم الكميات المباعة من المخزون تلقائياً عند تأكيد البيع وإصدار إيصال الاستلام برقم تسلسلي موثق.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                  <span className="text-[#8C6D53] block text-[11px]">إجمالي قطع المخزون الحالي</span>
                  <span className="text-base font-black text-[#4A2F18] tabular-nums mt-0.5 block">
                    {storeItems.reduce((acc, i) => acc + i.stock, 0)} قطعة
                  </span>
                </div>

                <div className="p-3 bg-[#FBF8F5] rounded-xl border border-[#E8DCCF]">
                  <span className="text-[#8C6D53] block text-[11px]">إجمالي القطع المباعة</span>
                  <span className="text-base font-black text-emerald-800 tabular-nums mt-0.5 block">
                    {branchSales.reduce((acc, s) => acc + s.quantity, 0)} قطعة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT STORE ITEM (تعديل بيانات الصنف والمخزون والسعر)               */}
      {/* ========================================================================= */}
      {itemToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <div className="flex items-center gap-2 text-[#4A2F18]">
                <Edit3 className="w-5 h-5 text-[#B9895B]" />
                <h3 className="font-bold text-sm">تعديل بيانات الصنف وسعر البيع والمخزون</h3>
              </div>
              <button 
                onClick={() => setItemToEdit(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItemEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الصنف:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">نوع الصنف:</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as StoreItem['type'])}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                  >
                    <option value="book">كتاب منهجي</option>
                    <option value="notebook">دفتر دراسي</option>
                    <option value="mushaf">مصحف شريف</option>
                    <option value="other">مستلزمات أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">سعر الوحدة (ج):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الرصيد في المخزن:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">حالة التوفر:</label>
                  <select
                    value={editActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditActive(e.target.value === 'active')}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                  >
                    <option value="active">متاح للبيع (نشط)</option>
                    <option value="inactive">معطل مؤقتاً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">وصف الصنف أو الفئة المستهدفة:</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="مثال: مخصص لطلاب المرحلة الابتدائية..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-[#D8C3AE]" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW STORE ITEM                                               */}
      {/* ========================================================================= */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">إضافة صنف جديد لكتالوج المدرسة</h3>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اسم الصنف أو الكتاب:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كراس حفظ جزء عم، فتح الرحمن..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">التصنيف:</label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value as StoreItem['type'])}
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                  >
                    <option value="book">كتاب منهجي</option>
                    <option value="notebook">دفتر دراسي</option>
                    <option value="mushaf">مصحف شريف</option>
                    <option value="other">صنف آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">سعر الوحدة (ج):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">الرصيد الابتدائي في المخزن:</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات أو وصف إضافي:</label>
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="وصف مختصر..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg"
                >
                  إضافة الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INSTANT SALE (تسجيل عملية بيع فورية)                             */}
      {/* ========================================================================= */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">تسجيل حركة بيع كتب أو مستلزمات</h3>
              <button onClick={() => setIsSellModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleExecuteSale} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">اختر الصنف المراد بيعه:</label>
                <select
                  value={sellItemId}
                  onChange={(e) => setSellItemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-bold"
                >
                  {storeItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ({item.unitPrice} ج) [المتوفر: {item.stock}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">الكمية:</label>
                  <input
                    type="number"
                    min="1"
                    max={storeItems.find(i => i.id === sellItemId)?.stock || 999}
                    required
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2F18] mb-1">المبلغ الإجمالي:</label>
                  <div className="px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#F6EEE4] font-black text-[#4A2F18] tabular-nums">
                    {((storeItems.find(i => i.id === sellItemId)?.unitPrice || 0) * sellQuantity)} ج.م
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">المشتري (اختياري لربط البيع بالطالب):</label>
                <select
                  value={sellStudentId}
                  onChange={(e) => setSellStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                >
                  <option value="">مشتري عام (نقدي مباشر)</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.grade})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-4 h-4 text-[#D8C3AE]" />
                  <span>تأكيد البيع وإصدار الإيصال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RECORD PAYMENT FOR DUE                                           */}
      {/* ========================================================================= */}
      {activeDueToPay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E8DCCF] shadow-xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-bold text-sm text-[#4A2F18]">تسجيل دفعة اشتراك / غرامة</h3>
              <button onClick={() => setActiveDueToPay(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div className="p-3 bg-[#F6EEE4] rounded-xl border border-[#E8DCCF]">
                <div className="text-[11px] text-[#8C6D53]">الطالب:</div>
                <div className="font-bold text-xs text-[#4A2F18]">
                  {students.find(s => s.id === activeDueToPay.studentId)?.fullName}
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px]">
                  <span>المستحق: <strong>{activeDueToPay.amount} ج</strong></span>
                  <span>المدفوع سابقاً: <strong>{activeDueToPay.paidAmount} ج</strong></span>
                  <span className="text-red-700 font-bold">المتبقي: {activeDueToPay.amount - activeDueToPay.paidAmount} ج</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">المبلغ المدفوع الآن (ج):</label>
                <input
                  type="number"
                  min="1"
                  max={activeDueToPay.amount - activeDueToPay.paidAmount}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18] font-black tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">طريقة السداد:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as Payment['method'])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5] text-[#4A2F18]"
                >
                  <option value="cash">نقدي (خزينة المدرسة)</option>
                  <option value="vodafone_cash">محفظة إلكترونية (فودافون كاش)</option>
                  <option value="fawry">فوري / أمان</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A2F18] mb-1">ملاحظات التحصيل:</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="رقم العملية، اسم المودع..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8DCCF] bg-[#FBF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => setActiveDueToPay(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6D4C3D] hover:bg-[#F6EEE4] rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A2F18] hover:bg-[#382312] rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#D8C3AE]" />
                  <span>تأكيد وطباعة الإيصال الرسمي</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
