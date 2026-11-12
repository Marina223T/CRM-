import { useT } from '@/lib/i18n'

export interface StatusPillProps {
  status: string
  className?: string
}

const STATUS_AR: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
  active: 'نشط',
  inactive: 'غير نشط',
  overdue: 'متأخر',
  achieved: 'مكتمل',
  completed: 'مكتمل',
  draft: 'مسودة',
  verified: 'تم التحقق',
  unverified: 'غير محقق',
  healthy: 'بحالة جيدة',
  expired: 'منتهي الصلاحية',
  expiring: 'قارب على الانتهاء',
  'near-capacity': 'قارب على الامتلاء',
  maintenance: 'صيانة',
  critical: 'حرج',
  'low-stock': 'مخزون منخفض',
  overstocked: 'مخزون زائد',
  unpaid: 'غير مدفوع',
  'partially-paid': 'مدفوع جزئياً',
  paid: 'مدفوع',
  voided: 'ملغي',
  'pending-clearance': 'قيد التحصيل',
}

export function StatusPill({ status, className = '' }: StatusPillProps) {
  const { lang } = useT()
  const safeStatus = status || 'Active'
  const normalized = safeStatus.toLowerCase().replace(/\s+/g, '-')
  const label = lang === 'ar' ? (STATUS_AR[normalized] || safeStatus) : safeStatus
  return (
    <span className={`status ${normalized} ${className}`}>
      {label}
    </span>
  )
}
