import { Package } from 'lucide-react'
import { useT } from '@/lib/i18n'

export interface ProductPerformanceItem {
  productName: string
  productName_ar?: string
  category: string
  quantity: number // boxes
  sharePct: number // 0-100%
}

export interface ProductPerformanceCardProps {
  data: ProductPerformanceItem[]
  totalSellOutQuantity: number
}

export function ProductPerformanceCard({ data, totalSellOutQuantity }: ProductPerformanceCardProps) {
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
            <Package size={14} /> {t('performanceAnalytics.product.title')}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--heading-text)' }}>
            {t('performanceAnalytics.product.subtitle')}
          </h3>
        </div>
      </div>

      {data.length === 0 ? (
        <p style={{ margin: 0, padding: '24px 0', textAlign: 'center', color: 'var(--muted-text)', fontSize: '13px' }}>
          {t('performanceAnalytics.empty')}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.map((prod, idx) => {
            const displayName = lang === 'ar' && prod.productName_ar ? prod.productName_ar : prod.productName

            return (
              <div
                key={prod.productName}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-soft)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
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
                      <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                        {displayName}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginInlineStart: '8px' }}>
                        {prod.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                      {prod.quantity.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginInlineStart: '6px' }}>
                      ({prod.sharePct}%)
                    </span>
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '99px',
                    background: 'var(--border-soft)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${prod.sharePct}%`,
                      height: '100%',
                      borderRadius: '99px',
                      background: idx === 0 ? '#059669' : idx === 1 ? '#2563eb' : '#1B3554',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
