'use client'

import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { SELL_IN_OUT_MOCK, type ProductSellThrough } from '../mock-data'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatCurrencyCompact, formatMonth, formatReportTerm, formatMetricValue } from '@/lib/format'
import type { ReportFiltersState } from './ReportFilters'

export interface SellInVsSellOutReportProps {
  filters: ReportFiltersState
}

export function SellInVsSellOutReport({ filters }: SellInVsSellOutReportProps) {
  const { t, lang } = useT()
  const products = SELL_IN_OUT_MOCK.products.filter((p) => {
    if (filters.products.length > 0 && !filters.products.includes(p.product)) return false
    return true
  })

  // Dynamic summary stats reflecting active product filter
  const summaryStats = useMemo(() => {
    if (products.length === 0) {
      return [
        { label: 'Total Sell-In', value: '0 units', change: '0 packs ordered', isPositive: false },
        { label: 'Total Sell-Out', value: '0 units', change: '0 packs dispensed', isPositive: false },
        { label: 'Sell-Through Ratio', value: '0.0%', change: 'Optimal threshold: 75%+', isPositive: false },
      ]
    }
    const totalSellInUnits = products.reduce((sum, p) => sum + p.sellInUnits, 0)
    const totalSellOutUnits = products.reduce((sum, p) => sum + p.sellOutUnits, 0)
    const rate = totalSellInUnits > 0 ? ((totalSellOutUnits / totalSellInUnits) * 100).toFixed(1) : '0.0'

    if (products.length === SELL_IN_OUT_MOCK.products.length) {
      return SELL_IN_OUT_MOCK.summary
    }

    return [
      {
        label: 'Total Sell-In',
        value: `${totalSellInUnits.toLocaleString('en-US')} units`,
        change: `${totalSellInUnits.toLocaleString('en-US')} packs ordered`,
        isPositive: true,
      },
      {
        label: 'Total Sell-Out',
        value: `${totalSellOutUnits.toLocaleString('en-US')} units`,
        change: `${totalSellOutUnits.toLocaleString('en-US')} packs dispensed`,
        isPositive: true,
      },
      {
        label: 'Sell-Through Ratio',
        value: `${rate}%`,
        change: 'Optimal threshold: 75%+',
        isPositive: Number(rate) >= 75,
      },
    ]
  }, [products])

  // SVG Area Chart points calculation
  const months = SELL_IN_OUT_MOCK.monthlyTrend
  const maxVal = 1000000
  const width = 640
  const height = 220
  const padLeft = 60
  const padRight = 20
  const padBottom = 30
  const padTop = 20

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  const getX = (idx: number) => padLeft + (idx / (months.length - 1)) * chartW
  const getY = (val: number) => padTop + chartH - (val / maxVal) * chartH

  // Sell-in path
  const sellInCoords = months.map((m, i) => `${getX(i)},${getY(m.sellIn)}`)
  const sellInAreaD = `M ${getX(0)},${padTop + chartH} L ${sellInCoords.join(' L ')} L ${getX(months.length - 1)},${padTop + chartH} Z`
  const sellInLineD = `M ${sellInCoords.join(' L ')}`

  // Sell-out path
  const sellOutCoords = months.map((m, i) => `${getX(i)},${getY(m.sellOut)}`)
  const sellOutAreaD = `M ${getX(0)},${padTop + chartH} L ${sellOutCoords.join(' L ')} L ${getX(months.length - 1)},${padTop + chartH} Z`
  const sellOutLineD = `M ${sellOutCoords.join(' L ')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 3 Summary Capsules */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {summaryStats.map((stat) => (
          <div
            key={stat.label}
            className="panel"
            style={{
              padding: '20px 24px',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted-text)' }}>
              {formatReportTerm(stat.label, lang)}
            </span>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--heading-text)',
                margin: '6px 0 2px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatMetricValue(stat.value, lang)}
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: stat.isPositive ? 'var(--story-em, #3e9a78)' : 'var(--rose-text)',
              }}
            >
              {formatMetricValue(stat.change, lang)}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart: Area Chart of Sell-in vs Sell-out */}
      <div
        className="panel"
        style={{
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--heading-text)' }}>
              {t('reports.sellinout.chartTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)' }}>
              {t('reports.sellinout.chartSubtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted-text)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--ocean)' }} />
              {t('reports.sellinout.sellInLegend')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--story-em, #3e9a78)' }} />
              {t('reports.sellinout.sellOutLegend')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--rose-bg)', border: '1px solid var(--rose)' }} />
              {t('reports.sellinout.lowRiskLegend')}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ minWidth: '580px' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="sellInGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3F6593" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3F6593" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="sellOutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3e9a78" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3e9a78" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[200000, 400000, 600000, 800000, 1000000].map((val) => {
                const y = getY(val)
                return (
                  <g key={val}>
                    <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <text x={padLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--muted-text)">
                      {formatCurrencyCompact(val, 'EGP', lang)}
                    </text>
                  </g>
                )
              })}

              {/* Sell-in Area & Line */}
              <path d={sellInAreaD} fill="url(#sellInGradient)" />
              <path d={sellInLineD} fill="none" stroke="var(--ocean)" strokeWidth="2.5" />

              {/* Sell-out Area & Line */}
              <path d={sellOutAreaD} fill="url(#sellOutGradient)" />
              <path d={sellOutLineD} fill="none" stroke="var(--story-em, #3e9a78)" strokeWidth="2.5" />

              {/* Data points & X Labels */}
              {months.map((m, idx) => {
                const x = getX(idx)
                const yIn = getY(m.sellIn)
                const yOut = getY(m.sellOut)
                return (
                  <g key={m.month}>
                    <circle cx={x} cy={yIn} r="4" fill="var(--ocean)" stroke="var(--card-bg)" strokeWidth="1.5" />
                    <circle cx={x} cy={yOut} r="4" fill="var(--story-em, #3e9a78)" stroke="var(--card-bg)" strokeWidth="1.5" />
                    <text x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--muted-text)">
                      {formatMonth(m.month, lang)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Rounded-row Table with Low Sell-through Highlighted in Rose */}
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: 'var(--heading-text)' }}>
          {t('reports.sellinout.tableTitle')}
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted-text)', textAlign: 'start', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>{t('reports.sellinout.thProduct')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sellinout.thSellInUnits')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sellinout.thSellOutUnits')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sellinout.thSellThrough')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sellinout.thMonthsOnHand')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.sellinout.thAssessment')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    background: p.isLowSellThrough ? 'var(--rose-bg)' : 'var(--input-bg)',
                    borderRadius: '14px',
                    color: p.isLowSellThrough ? 'var(--rose-text)' : 'inherit',
                  }}
                >
                  <td
                    style={{
                      padding: '12px 14px',
                      fontWeight: 600,
                      color: p.isLowSellThrough ? 'var(--rose-text)' : 'var(--heading-text)',
                      borderTopLeftRadius: '14px',
                      borderBottomLeftRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.isLowSellThrough && <AlertTriangle style={{ width: '15px', height: '15px', color: 'var(--rose-text)' }} />}
                      <span>{p.product}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {p.sellInUnits.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {p.sellOutUnits.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {p.sellThroughRate}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {t('reports.sellinout.monthsUnit', { months: p.monthsOnHand })}
                  </td>
                  <td
                    style={{
                      padding: '12px 14px',
                      borderTopRightRadius: '14px',
                      borderBottomRightRadius: '14px',
                    }}
                  >
                    {p.isLowSellThrough ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '8px',
                          background: 'rgba(217, 121, 139, 0.2)',
                          color: 'var(--rose-text)',
                        }}
                      >
                        {t('reports.sellinout.lowRiskBadge', { notice: p.statusNotice || '' })}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '8px',
                          background: 'var(--green-bg)',
                          color: 'var(--green-text)',
                        }}
                      >
                        {t('reports.sellinout.healthyBadge', { months: p.monthsOnHand })}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
