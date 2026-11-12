import { MapPin, ChevronRight, Warehouse as WarehouseIcon } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'

export interface AreaPerformanceItem {
  areaId: string
  areaName: string
  areaName_ar?: string
  governorate: string
  governorate_ar?: string
  sellInRevenue: number
  sellOutQuantity: number
  warehouseCount: number
}

export interface AreaPerformanceCardProps {
  data: AreaPerformanceItem[]
  onSelectArea: (areaId: string) => void
}

export function AreaPerformanceCard({ data, onSelectArea }: AreaPerformanceCardProps) {
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
            <MapPin size={14} /> {t('performanceAnalytics.area.title')}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--heading-text)' }}>
            {t('performanceAnalytics.area.subtitle')}
          </h3>
        </div>
      </div>

      {data.length === 0 ? (
        <p style={{ margin: 0, padding: '24px 0', textAlign: 'center', color: 'var(--muted-text)', fontSize: '13px' }}>
          {t('performanceAnalytics.empty')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, idx) => {
            const displayName = lang === 'ar' && item.areaName_ar ? item.areaName_ar : item.areaName
            const displayGov = lang === 'ar' && item.governorate_ar ? item.governorate_ar : item.governorate

            return (
              <div
                key={item.areaId}
                onClick={() => onSelectArea(item.areaId)}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-soft)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                {/* Rank & Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1.2 }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
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
                    <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'block' }}>
                      {displayName}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                      {displayGov} · {item.warehouseCount} {t('performanceAnalytics.area.hubs').toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'end' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--muted-text)', display: 'block', textTransform: 'uppercase' }}>
                      Sell-in
                    </span>
                    <strong style={{ fontSize: '13px', color: '#1B3554' }}>
                      {formatCurrency(item.sellInRevenue, 'EGP', lang)}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--muted-text)', display: 'block', textTransform: 'uppercase' }}>
                      Sell-out
                    </span>
                    <strong style={{ fontSize: '13px', color: '#059669' }}>
                      {item.sellOutQuantity.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
                    </strong>
                  </div>

                  <ChevronRight size={16} style={{ color: 'var(--sky, #0284c7)' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
