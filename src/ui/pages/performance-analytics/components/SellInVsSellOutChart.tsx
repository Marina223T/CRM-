import { useState } from 'react'
import { TrendingUp, DollarSign, Package, Info } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'

export interface MonthlyMetric {
  month: string
  label: string
  sellInRevenue: number // EGP
  sellOutQuantity: number // Boxes
}

export interface SellInVsSellOutChartProps {
  data: MonthlyMetric[]
}

export function SellInVsSellOutChart({ data }: SellInVsSellOutChartProps) {
  const { t, lang } = useT()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div className="panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-text)' }}>
        {t('performanceAnalytics.empty')}
      </div>
    )
  }

  // Max values for independent scaling
  const maxRevenue = Math.max(...data.map((d) => d.sellInRevenue), 1)
  const maxQuantity = Math.max(...data.map((d) => d.sellOutQuantity), 1)

  // SVG dimensions for trend sparkline
  const width = 600
  const height = 180
  const padX = 40
  const padY = 25
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const getX = (idx: number) =>
    data.length === 1 ? width / 2 : padX + (idx / (data.length - 1)) * chartW

  const getRevY = (val: number) => padY + chartH - (val / maxRevenue) * chartH
  const getQtyY = (val: number) => padY + chartH - (val / maxQuantity) * chartH

  const revCoords = data.map((d, i) => `${getX(i)},${getRevY(d.sellInRevenue)}`)
  const qtyCoords = data.map((d, i) => `${getX(i)},${getQtyY(d.sellOutQuantity)}`)

  const revLineD = `M ${revCoords.join(' L ')}`
  const qtyLineD = `M ${qtyCoords.join(' L ')}`

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
        gap: '20px',
      }}
    >
      {/* Chart Header & Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} /> {t('performanceAnalytics.comparison.title')}
          </span>
          <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: 'var(--heading-text)' }}>
            {t('performanceAnalytics.comparison.subtitle')}
          </h3>
        </div>

        {/* Explicit Dual-Metric Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
          {/* Sell-in Revenue */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: '#1B3554',
              }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)' }}>
              {t('performanceAnalytics.comparison.financialLabel')}
            </span>
          </div>

          {/* Sell-out Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: '#059669',
              }}
            />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)' }}>
              {t('performanceAnalytics.comparison.quantityLabel')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Metric Visualization */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          padding: '16px',
          borderRadius: '16px',
          background: 'var(--surface-raised)',
          border: '1px solid var(--border-soft)',
        }}
      >
        {data.map((item, idx) => {
          const revPct = Math.round((item.sellInRevenue / maxRevenue) * 100)
          const qtyPct = Math.round((item.sellOutQuantity / maxQuantity) * 100)
          const isHovered = hoveredIdx === idx

          return (
            <div
              key={item.month}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '14px',
                borderRadius: '12px',
                background: isHovered ? 'var(--card-bg)' : 'var(--surface)',
                border: isHovered ? '1px solid var(--navy, #1B3554)' : '1px solid var(--border-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Month Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                  {item.label}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', fontWeight: 600 }}>
                  {item.month}
                </span>
              </div>

              {/* Sell-in Revenue Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={12} style={{ color: '#1B3554' }} /> Sell-in:
                  </span>
                  <strong style={{ color: '#1B3554' }}>
                    {formatCurrency(item.sellInRevenue, 'EGP', lang)}
                  </strong>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '99px',
                    background: 'var(--border-soft)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${revPct}%`,
                      height: '100%',
                      borderRadius: '99px',
                      background: '#1B3554',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Sell-out Volume Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Package size={12} style={{ color: '#059669' }} /> Sell-out:
                  </span>
                  <strong style={{ color: '#059669' }}>
                    {item.sellOutQuantity.toLocaleString()} {t('performanceAnalytics.kpi.boxes')}
                  </strong>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '99px',
                    background: 'var(--border-soft)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${qtyPct}%`,
                      height: '100%',
                      borderRadius: '99px',
                      background: '#059669',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Monthly Sparkline Curve */}
      {data.length > 1 && (
        <div style={{ width: '100%', height: '120px', position: 'relative' }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
            preserveAspectRatio="none"
          >
            {/* Grid horizontal guidelines */}
            <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="var(--border-soft)" strokeDasharray="4 4" />
            <line x1={padX} y1={padY + chartH / 2} x2={width - padX} y2={padY + chartH / 2} stroke="var(--border-soft)" strokeDasharray="4 4" />
            <line x1={padX} y1={padY + chartH} x2={width - padX} y2={padY + chartH} stroke="var(--border-soft)" />

            {/* Revenue Trend Line */}
            <path d={revLineD} fill="none" stroke="#1B3554" strokeWidth="2.5" strokeLinecap="round" />
            {data.map((d, i) => (
              <circle
                key={`rev-pt-${i}`}
                cx={getX(i)}
                cy={getRevY(d.sellInRevenue)}
                r="4.5"
                fill="#1B3554"
                stroke="var(--surface)"
                strokeWidth="2"
              />
            ))}

            {/* Quantity Trend Line */}
            <path d={qtyLineD} fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" />
            {data.map((d, i) => (
              <circle
                key={`qty-pt-${i}`}
                cx={getX(i)}
                cy={getQtyY(d.sellOutQuantity)}
                r="4.5"
                fill="#059669"
                stroke="var(--surface)"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      )}

      {/* Disclaimers & Unit Clarification */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--muted-text)',
          borderTop: '1px solid var(--border-soft)',
          paddingTop: '12px',
        }}
      >
        <Info size={14} style={{ flexShrink: 0 }} />
        <span>{t('performanceAnalytics.comparison.dualNotice')}</span>
      </div>
    </div>
  )
}
