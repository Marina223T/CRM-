'use client'

import { useMemo } from 'react'
import { SALES_PERFORMANCE_MOCK, type SalesRepBreakdown } from '../mock-data'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Avatar } from '@/ui/design-system/components/Avatar'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatCurrencyCompact, formatReportTerm, formatMetricValue } from '@/lib/format'
import type { ReportFiltersState } from './ReportFilters'

export interface SalesPerformanceReportProps {
  filters: ReportFiltersState
}

export function SalesPerformanceReport({ filters }: SalesPerformanceReportProps) {
  const { t, lang } = useT()
  // Filter by reps and regions if selected
  const reps = SALES_PERFORMANCE_MOCK.byRep.filter((r) => {
    if (filters.reps.length > 0 && !filters.reps.includes(r.rep)) return false
    if (filters.regions.length > 0 && !filters.regions.some((reg) => r.territory.includes(reg.split(' ')[0]))) return false
    return true
  })

  // Dynamic summary stats aggregating from active filtered dataset
  const summaryStats = useMemo(() => {
    if (reps.length === 0) {
      return [
        { label: 'Total Revenue', value: 'EGP 0', change: '0% vs target', isPositive: false },
        { label: 'Quota Achievement', value: '0.0%', change: 'Goal: EGP 0', isPositive: false },
        { label: 'Average Rep Velocity', value: 'EGP 0', change: '0 active field reps', isPositive: false },
      ]
    }
    const totalActual = reps.reduce((sum, r) => sum + r.actual, 0)
    const totalTarget = reps.reduce((sum, r) => sum + r.target, 0)
    const rate = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : '0.0'
    const avgVelocity = Math.round(totalActual / reps.length)
    const vsTargetPct = totalTarget > 0 ? (((totalActual - totalTarget) / totalTarget) * 100).toFixed(1) : '0.0'

    return [
      {
        label: 'Total Revenue',
        value: `EGP ${totalActual.toLocaleString('en-US')}`,
        change: `${totalActual >= totalTarget ? '+' : ''}${vsTargetPct}% vs target`,
        isPositive: totalActual >= totalTarget,
      },
      {
        label: 'Quota Achievement',
        value: `${rate}%`,
        change: `Goal: EGP ${totalTarget.toLocaleString('en-US')}`,
        isPositive: Number(rate) >= 100,
      },
      {
        label: 'Average Rep Velocity',
        value: `EGP ${avgVelocity.toLocaleString('en-US')}`,
        change: `${reps.length} active field reps`,
        isPositive: true,
      },
    ]
  }, [reps])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 3 Stat Capsules */}
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

      {/* Main Chart: Sales vs Target by Rep & Product Breakdown */}
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
              {t('reports.sales.chartTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)' }}>
              {t('reports.sales.chartSubtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted-text)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--ocean)' }} />
              Bevato
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--sky)' }} />
              Naviro D3
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--green)' }} />
              {t('reports.sales.others')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--rose)' }} />
              {t('reports.sales.targetLine')}
            </span>
          </div>
        </div>

        {/* SVG Grouped/Stacked Bar Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ minWidth: '550px' }}>
            <svg viewBox="0 0 650 240" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Horizontal Grid lines */}
              {[0, 50000, 100000, 150000, 200000, 250000].map((val) => {
                const y = 200 - (val / 250000) * 170
                return (
                  <g key={val}>
                    <line x1="50" y1={y} x2="630" y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <text x="42" y={y + 4} textAnchor="end" fontSize="10" fill="var(--muted-text)">
                      {formatCurrencyCompact(val, 'EGP', lang)}
                    </text>
                  </g>
                )
              })}

              {/* Rep Bars */}
              {reps.map((r, idx) => {
                const repSlotWidth = (630 - 60) / Math.max(reps.length, 1)
                const groupX = 65 + idx * repSlotWidth + repSlotWidth * 0.15
                const barWidth = Math.min(repSlotWidth * 0.45, 52)

                // Target line position
                const targetY = 200 - (r.target / 250000) * 170

                // Product stacked heights
                let currentY = 200
                return (
                  <g key={r.id}>
                    {/* Actual Stacked Bar */}
                    {r.productBars.map((p, pIdx) => {
                      const h = (p.amount / 250000) * 170
                      currentY -= h
                      return (
                        <rect
                          key={p.product}
                          x={groupX}
                          y={currentY}
                          width={barWidth}
                          height={h}
                          fill={p.color}
                          rx={pIdx === r.productBars.length - 1 ? 4 : 0}
                        />
                      )
                    })}

                    {/* Target benchmark marker */}
                    <line
                      x1={groupX - 6}
                      y1={targetY}
                      x2={groupX + barWidth + 6}
                      y2={targetY}
                      stroke="var(--rose)"
                      strokeWidth="2.5"
                      strokeDasharray="2 2"
                    />

                    {/* Rep Name Label */}
                    <text
                      x={groupX + barWidth / 2}
                      y="218"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="var(--heading-text)"
                    >
                      {r.rep.split(' ')[0]}
                    </text>
                    <text
                      x={groupX + barWidth / 2}
                      y="232"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="var(--muted-text)"
                    >
                      {r.achievementRate}%
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Rounded-row Table */}
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: 'var(--heading-text)' }}>
          {t('reports.sales.tableTitle')}
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted-text)', textAlign: 'start', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>{t('reports.sales.thRep')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.sales.thTerritory')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sales.thTarget')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sales.thActual')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.sales.thAttainment')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.sales.thTopSku')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('reports.sales.thStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    background: 'var(--input-bg)',
                    borderRadius: '14px',
                  }}
                >
                  <td style={{ padding: '12px 14px', borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={r.rep.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <span style={{ fontWeight: 600, color: 'var(--heading-text)' }}>{r.rep}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--muted-text)' }}>{r.territory}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(r.target, 'EGP', lang)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--heading-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(r.actual, 'EGP', lang)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    <span style={{ color: r.achievementRate >= 100 ? 'var(--story-em)' : 'var(--amber-text)' }}>
                      {r.achievementRate}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--heading-text)' }}>{r.topProduct}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderTopRightRadius: '14px', borderBottomRightRadius: '14px' }}>
                    <StatusPill status={r.achievementRate >= 100 ? 'Achieved' : 'Pending'} />
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
