import { ChevronRight, FileText } from 'lucide-react'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import type { InvoiceRecord } from '../mock-data'

export interface InvoiceListItemProps {
  item: InvoiceRecord
  onClick: () => void
}

export function InvoiceListItem({ item, onClick }: InvoiceListItemProps) {
  const { lang } = useT()
  const displayName = lang === 'ar' ? (item.name_ar || item.name) : item.name
  let displayMeta = lang === 'ar' ? (item.meta_ar || item.meta) : item.meta
  if (lang === 'ar' && !item.meta_ar) {
    displayMeta = displayMeta
      .replace(/Telegram sourced/g, 'عبر تيليجرام')
      .replace(/Web uploaded/g, 'رفع يدوي عبر الويب')
      .replace(/EGP\s*([\d,]+)/g, '$1 ج.م')
  }

  return (
    <button className="collection-item" onClick={onClick}>
      <div className="item-icon">
        <FileText />
      </div>
      <div>
        <strong>{displayName}</strong>
        <span>{displayMeta}</span>
        {item.status === 'Rejected' && (item as any).rejection_reason && (
          <span style={{ color: 'var(--rose-text, #dc2626)', fontSize: '11px', display: 'block', marginTop: '2px' }}>
            {(item as any).rejection_reason}
          </span>
        )}
      </div>
      <StatusPill status={item.status} />
      <ChevronRight />
    </button>
  )
}
