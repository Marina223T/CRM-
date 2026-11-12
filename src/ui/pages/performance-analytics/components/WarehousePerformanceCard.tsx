import { Warehouse as WarehouseIcon, User, MapPin, CheckCircle2, Clock } from 'lucide-react'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'

export interface WarehousePerformanceItem {
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  warehouseName_ar?: string
  area: string
  area_ar?: string
  governorate: string
  governorate_ar?: string
  assignedRepName: string
  assignedRepName_ar?: string
  sellOutVolume: number
  capacityUnits: number
  currentStockUnits: number
  hasReported: boolean
  temperatureType: string
}

export interface WarehousePerformanceCardProps {
  data: WarehousePerformanceItem[]
}

export function WarehousePerformanceCard({ data }: WarehousePerformanceCardProps) {
  const { t, lang } = useT()

  return (
    <div
      className="panel"
      style={{
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid var(--border-soft)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WarehouseIcon size={14} /> {t('performanceAnalytics.warehouse.title')}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--heading-text)' }}>
            {t('performanceAnalytics.warehouse.subtitle')}
          </h3>
        </div>
      </div>

      {data.length === 0 ? (
        <p style={{ margin: 0, padding: '24px 0', textAlign: 'center', color: 'var(--muted-text)', fontSize: '13px' }}>
          {t('performanceAnalytics.empty')}
        </p>
      ) : (
        <div className="collection-list">
          {data.map((wh, idx) => {
            const displayName = lang === 'ar' && wh.warehouseName_ar ? wh.warehouseName_ar : wh.warehouseName
            const displayArea = lang === 'ar' && wh.area_ar ? wh.area_ar : wh.area
            const displayGov = lang === 'ar' && wh.governorate_ar ? wh.governorate_ar : wh.governorate
            const displayRep = lang === 'ar' && wh.assignedRepName_ar ? wh.assignedRepName_ar : wh.assignedRepName

            const utilization = Math.min(
              100,
              Math.round((wh.currentStockUnits / Math.max(1, wh.capacityUnits)) * 100)
            )

            return (
              <div
                key={wh.warehouseId}
                className="collection-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                }}
              >
                {/* Rank & Warehouse Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1.4 }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: idx < 3 ? 'var(--navy, #1B3554)' : 'var(--border-soft)',
                      color: idx < 3 ? '#ffffff' : 'var(--muted-text)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </div>

                  <div>
                    <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)', display: 'block' }}>
                      {displayName}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                      {wh.warehouseCode} · {wh.temperatureType}
                    </span>
                  </div>
                </div>

                {/* Area & Governorate */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} style={{ color: 'var(--muted-text)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--heading-text)' }}>
                      {displayArea}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                    {displayGov}
                  </span>
                </div>

                {/* Assigned Rep */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} style={{ color: 'var(--muted-text)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--heading-text)' }}>
                      {displayRep}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                    {t('performanceAnalytics.warehouse.rep')}
                  </span>
                </div>

                {/* Sell-out Volume */}
                <div style={{ flex: 1, textAlign: 'end', marginInlineEnd: '14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                    {t('performanceAnalytics.warehouse.volume')}
                  </span>
                  <strong style={{ fontSize: '15px', color: '#059669' }}>
                    {wh.sellOutVolume.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
                  </strong>
                </div>

                {/* Reporting Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {wh.hasReported ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(5, 150, 105, 0.12)',
                        color: '#059669',
                      }}
                    >
                      <CheckCircle2 size={13} /> {t('performanceAnalytics.warehouse.reported')}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#d97706',
                      }}
                    >
                      <Clock size={13} /> {t('performanceAnalytics.warehouse.missing')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
