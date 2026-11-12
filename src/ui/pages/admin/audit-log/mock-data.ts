export type AuditModule =
  | 'Invoices'
  | 'Collections'
  | 'Warehouses'
  | 'Sell-out'
  | 'Visits'
  | 'Users'
  | 'System'

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete_void'
  | 'auth'
  | 'permission'

export type AuditResult = 'Success' | 'Warning' | 'Failed'

export interface AuditRecord {
  id: string
  action: string
  action_ar?: string
  actor: string
  actorRole?: string
  time: string
  timestamp: string
  module: AuditModule
  actionType: AuditActionType
  affectedRecord: string
  status: AuditResult
  details: string
  details_ar?: string
  ipAddress?: string
  beforeAfter?: {
    before?: Record<string, string | number>
    after?: Record<string, string | number>
  }
}

export const adminAuditLogMockData: AuditRecord[] = [
  {
    id: 'LOG-415',
    action: 'Payment Voided',
    action_ar: 'إلغاء إيصال تحصيل',
    actor: 'Alex Morgan',
    actorRole: 'System Administrator',
    time: '15 mins ago',
    timestamp: '2026-10-26T14:45:00Z',
    module: 'Collections',
    actionType: 'delete_void',
    affectedRecord: 'REC-2026-081 (City Clinic)',
    status: 'Warning',
    details: 'Voided payment receipt REC-2026-081 (EGP 3,210). Reverted allocation to invoice INV-1044.',
    details_ar: 'تم إلغاء إيصال السداد REC-2026-081 (3,210 ج.م). وأُعيد فتح الفاتورة INV-1044.',
    ipAddress: '192.168.1.104',
    beforeAfter: {
      before: {
        receiptStatus: 'Completed',
        amountCollected: 'EGP 3,210',
        invoiceBalance: 'EGP 0 (Paid)',
      },
      after: {
        receiptStatus: 'Voided',
        reason: 'Customer replaced cash payment with certified branch wire transfer slip',
        invoiceBalance: 'EGP 3,210 (Unpaid)',
      },
    },
  },
  {
    id: 'LOG-414',
    action: 'Payment Collected',
    action_ar: 'تسجيل تحصيل نقدي',
    actor: 'Maya Patel',
    actorRole: 'Medical Representative',
    time: '45 mins ago',
    timestamp: '2026-10-26T14:15:00Z',
    module: 'Collections',
    actionType: 'create',
    affectedRecord: 'REC-2026-088 (Green Cross)',
    status: 'Success',
    details: 'Recorded cash collection of EGP 12,000 allocated across INV-1040 and INV-1048.',
    details_ar: 'تسجيل تحصيل نقدي بمبلغ 12,000 ج.م مخصص للفاتورتين INV-1040 و INV-1048.',
    ipAddress: '10.24.12.88',
    beforeAfter: {
      before: {
        inv1040Balance: 'EGP 16,380',
        inv1048Balance: 'EGP 8,420',
      },
      after: {
        allocatedInv1040: 'EGP 8,000 (Remaining: EGP 8,380)',
        allocatedInv1048: 'EGP 4,000 (Remaining: EGP 4,420)',
        paymentMethod: 'Cash (CSH-2401)',
      },
    },
  },
  {
    id: 'LOG-413',
    action: 'Warehouse Stock Inflow',
    action_ar: 'تحديث مخزون مستودع',
    actor: 'Sara Ali',
    actorRole: 'Regional Hub Lead',
    time: '2 hours ago',
    timestamp: '2026-10-26T12:30:00Z',
    module: 'Warehouses',
    actionType: 'update',
    affectedRecord: 'WH-ALX-01 (Alexandria Depot)',
    status: 'Warning',
    details: 'Logged shipment delivery of 2,400 units. Capacity reached 94% threshold.',
    details_ar: 'تسجيل توريد 2,400 وحدة لمستودع الإسكندرية. وصلت السعة إلى 94%.',
    ipAddress: '192.168.3.15',
    beforeAfter: {
      before: {
        currentStockUnits: '16,400 units',
        occupancyRate: '82%',
        status: 'Healthy',
      },
      after: {
        currentStockUnits: '18,800 units',
        occupancyRate: '94%',
        status: 'Near Capacity',
      },
    },
  },
  {
    id: 'LOG-412',
    action: 'Sell-out Report Added',
    action_ar: 'تقديم تقرير مبيعات صيدليات',
    actor: 'Ahmed Samir',
    actorRole: 'Area Sales Manager',
    time: '3 hours ago',
    timestamp: '2026-10-26T11:15:00Z',
    module: 'Sell-out',
    actionType: 'create',
    affectedRecord: 'WH-CAI-01 · Period 2026-10',
    status: 'Success',
    details: 'Submitted warehouse sell-out report: 3,840 boxes recorded across 4 product categories.',
    details_ar: 'تقديم تقرير مبيعات مستودع القاهرة لشهر 2026-10: تسجيل 3,840 عبوة عبر 4 منتجات.',
    ipAddress: '10.20.5.42',
    beforeAfter: {
      after: {
        reportingMonth: '2026-10',
        warehouse: 'Cairo Central Logistics Hub',
        totalBoxesSold: '3,840 boxes',
        submissionState: 'Submitted (Awaiting monthly audit)',
      },
    },
  },
  {
    id: 'LOG-411',
    action: 'Invoice Approved',
    action_ar: 'الموافقة على فاتورة',
    actor: 'Alex Morgan',
    actorRole: 'System Administrator',
    time: '4 hours ago',
    timestamp: '2026-10-26T10:30:00Z',
    module: 'Invoices',
    actionType: 'update',
    affectedRecord: 'INV-1048 · Green Cross',
    status: 'Success',
    details: 'Approved Telegram-sourced invoice INV-1048 for Green Cross Pharmacy (EGP 8,420).',
    details_ar: 'الموافقة على الفاتورة INV-1048 لصيدلية جرين كروس بمبلغ 8,420 ج.م.',
    ipAddress: '192.168.1.104',
    beforeAfter: {
      before: {
        approvalStatus: 'Pending',
        reviewedBy: 'None',
      },
      after: {
        approvalStatus: 'Approved',
        reviewedBy: 'Alex Morgan',
        ledgerState: 'Open for Collection',
      },
    },
  },
  {
    id: 'LOG-410',
    action: 'User Permissions Updated',
    action_ar: 'تعديل صلاحيات مستخدم',
    actor: 'Alex Morgan',
    actorRole: 'System Administrator',
    time: 'Yesterday',
    timestamp: '2026-10-25T15:20:00Z',
    module: 'Users',
    actionType: 'permission',
    affectedRecord: 'User: rep-olivia (Olivia Martin)',
    status: 'Success',
    details: 'Granted extended reporting permission for Giza Wholesale Hub and Assiut distribution sector.',
    details_ar: 'منح صلاحيات إضافية للمندوبة أوليفيا مارتن لقطاع الجيزة وأسيوط.',
    ipAddress: '192.168.1.104',
    beforeAfter: {
      before: {
        assignedHubs: 'Giza Wholesale only',
        canExport: 'false',
      },
      after: {
        assignedHubs: 'Giza Wholesale + Assiut Regional Hub',
        canExport: 'true',
      },
    },
  },
  {
    id: 'LOG-409',
    action: 'Sales Order Billed',
    action_ar: 'إصدار أمر بيع',
    actor: 'James Wilson',
    actorRole: 'Medical Representative',
    time: 'Yesterday',
    timestamp: '2026-10-25T11:45:00Z',
    module: 'Invoices',
    actionType: 'create',
    affectedRecord: 'SO-9021 (Apex Pharma)',
    status: 'Success',
    details: 'Created sales order SO-9021 for Apex Pharma Distribution: 14,200 units billed at EGP 118,500.',
    details_ar: 'إصدار أمر البيع SO-9021 لتوزيع أبيكس فارما: 14,200 وحدة بقيمة 118,500 ج.م.',
    ipAddress: '10.22.4.11',
  },
  {
    id: 'LOG-408',
    action: 'Doctor Profile Updated',
    action_ar: 'تحديث ملف طبيب',
    actor: 'Olivia Martin',
    actorRole: 'Medical Representative',
    time: '2 days ago',
    timestamp: '2026-10-24T16:10:00Z',
    module: 'Visits',
    actionType: 'update',
    affectedRecord: 'Dr. Sarah Kim (Nile Hospital)',
    status: 'Success',
    details: 'Added follow-up clinical discussion notes regarding Bevato dosage and patient tolerance trial.',
    details_ar: 'إضافة ملاحظات متابعة سريرية لد. سارة كيم حول تجربة دواء Bevato.',
    ipAddress: '10.20.1.72',
  },
  {
    id: 'LOG-407',
    action: 'Admin Session Login',
    action_ar: 'تسجيل دخول مسؤول',
    actor: 'Alex Morgan',
    actorRole: 'System Administrator',
    time: '3 days ago',
    timestamp: '2026-10-23T08:00:00Z',
    module: 'System',
    actionType: 'auth',
    affectedRecord: 'Session #SES-88291',
    status: 'Success',
    details: 'Successful administrator login with two-factor validation from authorized office subnet.',
    details_ar: 'تسجيل دخول ناجح للمسؤول مع التحقق الثنائي من شبكة المكتب المعتمدة.',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'LOG-406',
    action: 'Batch Expiry Alert',
    action_ar: 'تنبيه انتهاء تشغيلة',
    actor: 'System Worker',
    actorRole: 'Automated Service',
    time: '3 days ago',
    timestamp: '2026-10-23T04:00:00Z',
    module: 'System',
    actionType: 'update',
    affectedRecord: 'Batch CW-2401',
    status: 'Warning',
    details: 'Automatic cron job triggered 12-day expiration flag on NeuroCalm lot CW-2401.',
    details_ar: 'المهمة الآلية أطلقت تنبيه اقتراب انتهاء صلاحية تشغيلة CW-2401.',
    ipAddress: '127.0.0.1',
  },
  {
    id: 'LOG-405',
    action: 'Warehouse Audit Verified',
    action_ar: 'اعتماد جرد مستودع',
    actor: 'Ahmed Samir',
    actorRole: 'Regional Hub Lead',
    time: '4 days ago',
    timestamp: '2026-10-22T17:30:00Z',
    module: 'Warehouses',
    actionType: 'update',
    affectedRecord: 'WH-CAI-01 (Cairo Hub)',
    status: 'Success',
    details: 'Periodic physical inventory verification completed: 42,000 units verified with 0% variance.',
    details_ar: 'اكتمال التدقيق الدوري الفعلي للمخزون: مطابقة 42,000 وحدة بنسبة تطابق 100%.',
    ipAddress: '10.20.5.42',
  },
  {
    id: 'LOG-404',
    action: 'Invoice Rejected',
    action_ar: 'رفض فاتورة',
    actor: 'Alex Morgan',
    actorRole: 'System Administrator',
    time: '5 days ago',
    timestamp: '2026-10-21T13:15:00Z',
    module: 'Invoices',
    actionType: 'update',
    affectedRecord: 'INV-1046 · Wellcare',
    status: 'Failed',
    details: 'Rejected invoice INV-1046 due to missing clinical dispensing signature and stamped receipt.',
    details_ar: 'رفض الفاتورة INV-1046 بسبب غياب توقيع الصرف الطبي وختم الاستلام.',
    ipAddress: '192.168.1.104',
    beforeAfter: {
      before: {
        approvalStatus: 'Pending',
      },
      after: {
        approvalStatus: 'Rejected',
        rejectionReason: 'Missing official pharmacy stamp and dispensing signature slip',
      },
    },
  },
]
