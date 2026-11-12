import { Warehouse as WarehouseIcon, MapPin, User, Calendar, Edit3, Package } from 'lucide-react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import type { WarehouseSellOutReport } from '@/data/mock/sell-out'

export interface WarehouseSellOutDetailDrawerProps {
  report: WarehouseSellOutReport | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (report: WarehouseSellOutReport) => void
  canEdit?: boolean
}

export function WarehouseSellOutDetailDrawer({
  report,
  isOpen,
  onClose,
  onEdit,
  canEdit = true,
}: WarehouseSellOutDetailDrawerProps) {
  const { t, lang } = useT()

  if (!report) return null

  const displayWh = lang === 'ar' && report.warehouseName_ar ? report.warehouseName_ar : report.warehouseName
  const displayArea = lang === 'ar' && report.area_ar ? report.area_ar : report.area
  const displayGov = lang === 'ar' && report.governorate_ar ? report.governorate_ar : report.governorate
  const displayRep = lang === 'ar' && report.repName_ar ? report.repName_ar : report.repName

  const totalQuantity = report.items.reduce((sum, it) => sum + it.quantity, 0)

  return (
    <Drawer
      title={displayWh}
      kicker={`${report.warehouseCode} · ${report.reportingMonth}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 4px' }}>
        {/* Header Summary Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(27, 53, 84, 0.12)',
                color: 'var(--navy, #1B3554)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <WarehouseIcon size={24} />
            </div>
            <div>
              <strong style={{ fontSize: '16px', color: 'var(--heading-text)', display: 'block' }}>
                {displayWh}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                {report.warehouseCode} · {displayArea} ({displayGov})
              </span>
            </div>
          </div>

          {canEdit && onEdit && (
            <Button variant="secondary" onClick={() => onEdit(report)}>
              <Edit3 data-icon="inline-start" size={15} /> {t('common.edit')}
            </Button>
          )}
        </div>

        {/* Metadata Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={17} style={{ color: 'var(--steel, #64748b)' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('sellOut.table.month')}
              </span>
              <strong style={{ fontSize: '13.5px', color: 'var(--heading-text)' }}>
                {report.reportingMonth}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={17} style={{ color: 'var(--navy, #1B3554)' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('sellOut.table.rep')}
              </span>
              <strong style={{ fontSize: '13.5px', color: 'var(--heading-text)' }}>
                {displayRep}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={17} style={{ color: 'var(--steel, #64748b)' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('sellOut.table.area')}
              </span>
              <span style={{ fontSize: '13.5px', color: 'var(--heading-text)' }}>
                {displayArea} ({displayGov})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={17} style={{ color: 'var(--steel, #64748b)' }} />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('sellOut.table.submissionDate')}
              </span>
              <span style={{ fontSize: '13.5px', color: 'var(--heading-text)' }}>
                {formatDate(report.submissionDate, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Items Breakdown */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: 'var(--navy, #1B3554)' }} />
              <strong style={{ fontSize: '15px', color: 'var(--heading-text)' }}>
                {t('sellOut.drawer.productsSection')}
              </strong>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--navy, #1B3554)',
                padding: '3px 10px',
                borderRadius: '99px',
                background: 'rgba(27, 53, 84, 0.08)',
              }}
            >
              {totalQuantity.toLocaleString()} {t('sellOut.kpi.boxes')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.items.map((it, idx) => {
              const prodName = lang === 'ar' && it.productName_ar ? it.productName_ar : it.productName
              const pct = totalQuantity > 0 ? Math.round((it.quantity / totalQuantity) * 100) : 0

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-soft)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
                      {prodName}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                      {pct}% of warehouse sell-out
                    </span>
                  </div>

                  <strong style={{ fontSize: '15px', color: 'var(--navy, #1B3554)' }}>
                    {it.quantity.toLocaleString()} {t('sellOut.kpi.boxes')}
                  </strong>
                </div>
              )
            })}
          </div>
        </div>

        {/* Visit Notes */}
        {report.notes && (
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--muted-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              {t('sellOut.drawer.notesLabel')}
            </span>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--heading-text)', lineHeight: 1.5 }}>
              {report.notes}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  )
}
