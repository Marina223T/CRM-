'use client'

import { ChevronRight } from 'lucide-react'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { returnsStore } from '@/data/mock/returns'
import { formatDate } from '@/lib/format'

interface ReturnsListProps {
  onSelect: (id: string) => void
}

export function ReturnsList({ onSelect }: ReturnsListProps) {
  const { t, lang } = useT()
  const records = useStore(returnsStore)

  if (records.length === 0) {
    return <EmptyState message={t('returns.emptyState')} />
  }

  return (
    <div className="collection-list" style={{ marginTop: '16px' }}>
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          className="collection-item"
          onClick={() => onSelect(record.id)}
        >
          <div>
            <strong>{record.productName}</strong>
            <span>
              {record.customerName} · {record.quantity} {t('returns.units')} · {formatDate(record.returnDate, lang)}
            </span>
          </div>
          <StatusPill status={record.status} />
          <ChevronRight />
        </button>
      ))}
    </div>
  )
}
