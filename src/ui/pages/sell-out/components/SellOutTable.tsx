'use client'

import { ChevronRight } from 'lucide-react'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { sellOutStore } from '@/data/mock/sell-out'
import { formatDate } from '@/lib/format'

export function SellOutTable({ onSelect }: { onSelect?: (id: string) => void }) {
  const { t, lang } = useT()
  const records = useStore(sellOutStore)

  if (records.length === 0) {
    return <EmptyState message={t('sellOut.emptyHistory')} />
  }

  return (
    <div className="collection-list" style={{ marginTop: '16px' }}>
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          className="collection-item"
          onClick={() => onSelect?.(record.id)}
        >
          <div>
            <strong>{record.productName}</strong>
            <span>{record.customerName}</span>
          </div>
          <span style={{ color: 'var(--muted-text)', fontSize: '13px', marginInlineEnd: '8px' }}>
            {record.quantity} {t('returns.units')} · {formatDate(record.date, lang)}
          </span>
          <ChevronRight />
        </button>
      ))}
    </div>
  )
}
