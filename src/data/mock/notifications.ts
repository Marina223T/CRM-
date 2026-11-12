import { createStore } from './store'

export type NotificationCategory =
  | 'invoices'
  | 'collections'
  | 'warehouses'
  | 'sell_out'
  | 'system'

export type NotificationPriority = 'critical' | 'warning' | 'info'

export interface NotificationItem {
  id: string
  title: string
  title_ar?: string
  message: string
  message_ar?: string
  category: NotificationCategory
  priority: NotificationPriority
  time: string
  timestamp: string
  unread: boolean
  targetPage?: string
  targetFilter?: string
  actionLabel?: string
  actionLabel_ar?: string
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: 'Invoice Approval Requested',
    title_ar: 'طلب موافقة على فاتورة',
    message: 'INV-1048 for Green Cross Pharmacy (EGP 8,420) is pending clinical supervisor review.',
    message_ar: 'الفاتورة INV-1048 لصيدلية جرين كروس (8,420 ج.م) بانتظار مراجعة المشرف.',
    category: 'invoices',
    priority: 'warning',
    time: '25 mins ago',
    timestamp: '2026-10-26T14:15:00Z',
    unread: true,
    targetPage: 'Invoices & Sell-in',
    actionLabel: 'Review Invoice',
    actionLabel_ar: 'مراجعة الفاتورة',
  },
  {
    id: 'notif-002',
    title: 'Cheque Pending Clearance',
    title_ar: 'شيك قيد التحصيل البنكي',
    message: 'Receipt REC-2026-082 (CHQ-7719 for EGP 10,000) is awaiting 3-day bank settlement cycle.',
    message_ar: 'إيصال التحصيل REC-2026-082 (شيك 7719 بمبلغ 10,000 ج.م) بانتظار دورة المقاصة البنكية.',
    category: 'collections',
    priority: 'warning',
    time: '1 hour ago',
    timestamp: '2026-10-26T13:30:00Z',
    unread: true,
    targetPage: 'Cash In',
    actionLabel: 'View Collections',
    actionLabel_ar: 'عرض التحصيلات',
  },
  {
    id: 'notif-003',
    title: 'Warehouse Near Capacity',
    title_ar: 'المستودع قارب على الامتلاء',
    message: 'Alexandria Coastal Depot (WH-ALX-01) reached 94% storage capacity (18,800 / 20,000 units).',
    message_ar: 'مستودع الإسكندرية الساحلي وصل إلى 94% من السعة الاستيعابية (18,800 / 20,000 وحدة).',
    category: 'warehouses',
    priority: 'critical',
    time: '3 hours ago',
    timestamp: '2026-10-26T11:00:00Z',
    unread: true,
    targetPage: 'Warehouses',
    actionLabel: 'Inspect Warehouse',
    actionLabel_ar: 'فحص المستودع',
  },
  {
    id: 'notif-004',
    title: 'Sell-out Reporting Incomplete',
    title_ar: 'تقارير المبيعات الخارجية غير مكتملة',
    message: 'Upper Egypt Hub (Assiut) has not submitted the final reporting report for October 2026.',
    message_ar: 'مركز صعيد مصر (أسيوط) لم يقدم التقرير النهائي لمبيعات أكتوبر 2026 بعد.',
    category: 'sell_out',
    priority: 'warning',
    time: '5 hours ago',
    timestamp: '2026-10-26T09:00:00Z',
    unread: true,
    targetPage: 'Sell-out',
    actionLabel: 'Open Sell-out',
    actionLabel_ar: 'فتح مبيعات الصيدليات',
  },
  {
    id: 'notif-005',
    title: 'Batch Expiry Alert',
    title_ar: 'تنبيه اقتراب انتهاء صلاحية تشغيلة',
    message: 'Batch CW-2401 of NeuroCalm 50mg is approaching 12-day expiration threshold.',
    message_ar: 'تشغيلة CW-2401 لمنتج NeuroCalm تقترب من حد الـ 12 يوماً قبل انتهاء الصلاحية.',
    category: 'warehouses',
    priority: 'critical',
    time: 'Yesterday',
    timestamp: '2026-10-25T16:00:00Z',
    unread: false,
    targetPage: 'Stock',
    actionLabel: 'Check Batches',
    actionLabel_ar: 'مراجعة التشغيلات',
  },
  {
    id: 'notif-006',
    title: 'Receipt Voided for Audit',
    title_ar: 'إلغاء إيصال تحصيل مسجل',
    message: 'Receipt REC-2026-081 was voided by Alex Morgan. Reason: Client wire replacement.',
    message_ar: 'تم إلغاء الإيصال REC-2026-081 بواسطة أليكس مورجان بسبب استبدال التحويل البنكي.',
    category: 'collections',
    priority: 'info',
    time: '2 days ago',
    timestamp: '2026-10-24T10:00:00Z',
    unread: false,
    targetPage: 'Cash In',
    actionLabel: 'Audit Cash In',
    actionLabel_ar: 'تدقيق التحصيلات',
  },
  {
    id: 'notif-007',
    title: 'Q3 Performance Report Ready',
    title_ar: 'تقرير أداء الربع الثالث متاح',
    message: 'Regional distribution vs sell-out analytical aggregation has finished generating.',
    message_ar: 'اكتمل توليد تقرير مقارنة التوزيع الفصلي مقابل مبيعات الصيدليات للربع الثالث.',
    category: 'system',
    priority: 'info',
    time: '3 days ago',
    timestamp: '2026-10-23T08:30:00Z',
    unread: false,
    targetPage: 'Performance Analytics',
    actionLabel: 'View Analytics',
    actionLabel_ar: 'عرض التحليلات',
  },
]

export const notificationsStore = createStore<NotificationItem[]>(
  'notifications',
  INITIAL_NOTIFICATIONS,
)

export function markNotificationAsRead(id: string) {
  notificationsStore.update((list) =>
    list.map((n) => (n.id === id ? { ...n, unread: false } : n)),
  )
}

export function toggleNotificationRead(id: string) {
  notificationsStore.update((list) =>
    list.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)),
  )
}

export function markAllNotificationsAsRead() {
  notificationsStore.update((list) => list.map((n) => ({ ...n, unread: false })))
}

export function dismissNotification(id: string) {
  notificationsStore.update((list) => list.filter((n) => n.id !== id))
}

export function clearAllNotifications() {
  notificationsStore.set([])
}

export function addNotification(
  item: Omit<NotificationItem, 'id' | 'timestamp' | 'unread'> & { unread?: boolean },
) {
  // Deduplication: skip if an identical notification (same title + message) was added in the last 5 seconds
  const now = Date.now()
  const existing = notificationsStore.get()
  const isDuplicate = existing.some((n) => {
    if (n.title !== item.title || n.message !== item.message) return false
    const ts = new Date(n.timestamp).getTime()
    return now - ts < 5000
  })
  if (isDuplicate) return null

  const newItem: NotificationItem = {
    ...item,
    id: `notif-${now}`,
    timestamp: new Date(now).toISOString(),
    unread: item.unread ?? true,
  }
  notificationsStore.update((list) => [newItem, ...list])
  return newItem
}
