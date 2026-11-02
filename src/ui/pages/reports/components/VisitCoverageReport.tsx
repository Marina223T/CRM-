'use client'

import { useMemo } from 'react'
import { AlertCircle, Calendar, Clock, Stethoscope } from 'lucide-react'
import { VISIT_COVERAGE_MOCK, type OverdueDoctor } from '../mock-data'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Avatar } from '@/ui/design-system/components/Avatar'
import { useT } from '@/lib/i18n'
import { formatReportTerm, formatMetricValue } from '@/lib/format'
import type { ReportFiltersState } from './ReportFilters'

export interface VisitCoverageReportProps {
  filters: ReportFiltersState
}

export function VisitCoverageReport({ filters }: VisitCoverageReportProps) {
  const { t, lang } = useT()
  const overdueDocs = VISIT_COVERAGE_MOCK.overdueDoctors.filter((doc) => {
    if (filters.reps.length > 0 && !filters.reps.includes(doc.assignedRep)) return false
    if (filters.regions.length > 0 && !filters.regions.some((reg) => doc.territory.includes(reg.split(' ')[0]))) return false
    return true
  })

  const repCoverage = VISIT_COVERAGE_MOCK.repCoverage.filter((r) => {
    if (filters.reps.length > 0 && !filters.reps.includes(r.rep)) return false
    return true
  })

  const summaryStats = useMemo(() => {
    if (repCoverage.length === 0) {
      return [
        { label: 'Target Coverage', value: '0.0%', change: '0 visits reached', isPositive: false },
        { label: 'Overdue Doctors', value: `${overdueDocs.length} accounts`, change: 'Exceeding cycle interval', isPositive: overdueDocs.length === 0 },
        { label: 'Total Visits Logged', value: '0 visits', change: '0 field reps', isPositive: false },
      ]
    }
    const totalPlanned = repCoverage.reduce((sum, r) => sum + r.planned, 0)
    const totalCompleted = repCoverage.reduce((sum, r) => sum + r.completed, 0)
    const covRate = totalPlanned > 0 ? ((totalCompleted / totalPlanned) * 100).toFixed(1) : '0.0'

    return [
      {
        label: 'Target Coverage',
        value: `${covRate}%`,
        change: `${totalCompleted} of ${totalPlanned} doctors reached`,
        isPositive: Number(covRate) >= 85,
      },
      {
        label: 'Overdue Doctors',
        value: `${overdueDocs.length} accounts`,
        change: 'Exceeding cycle interval',
        isPositive: overdueDocs.length === 0,
      },
      {
        label: 'Total Visits Logged',
        value: `${totalCompleted} visits`,
        change: `${repCoverage.length} active field reps`,
        isPositive: totalCompleted > 0,
      },
    ]
  }, [repCoverage, overdueDocs])

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

      {/* Main Chart: Coverage % & Missed Visits by Rep */}
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
              {t('reports.coverage.chartTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)' }}>
              {t('reports.coverage.chartSubtitle')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--muted-text)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--ocean)' }} />
              {t('reports.coverage.completedLegend')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--rose)' }} />
              {t('reports.coverage.missedLegend')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--story-em, #3e9a78)' }} />
              {t('reports.coverage.thresholdLegend')}
            </span>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <div style={{ minWidth: '550px' }}>
            <svg viewBox="0 0 650 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Horizontal lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = 180 - (val / 100) * 150
                return (
                  <g key={val}>
                    <line x1="50" y1={y} x2="620" y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <text x="42" y={y + 4} textAnchor="end" fontSize="10" fill="var(--muted-text)">
                      {t('reports.coverage.callsUnit', { val })}
                    </text>
                  </g>
                )
              })}

              {/* Rep Bars */}
              {repCoverage.map((r, idx) => {
                const slotW = (620 - 60) / Math.max(repCoverage.length, 1)
                const groupX = 65 + idx * slotW + slotW * 0.2
                const barW = Math.min(slotW * 0.35, 42)

                const completedH = (r.completed / 100) * 150
                const missedH = (r.missed / 100) * 150

                const completedY = 180 - completedH
                const missedY = 180 - missedH

                return (
                  <g key={r.rep}>
                    {/* Completed Bar */}
                    <rect
                      x={groupX}
                      y={completedY}
                      width={barW}
                      height={completedH}
                      fill="var(--ocean)"
                      rx="4"
                    />

                    {/* Missed Bar */}
                    <rect
                      x={groupX + barW + 6}
                      y={missedY}
                      width={barW}
                      height={missedH}
                      fill="var(--rose)"
                      rx="4"
                    />

                    {/* Rep Label */}
                    <text
                      x={groupX + barW + 3}
                      y="198"
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="var(--heading-text)"
                    >
                      {r.rep.split(' ')[0]}
                    </text>
                    <text
                      x={groupX + barW + 3}
                      y="212"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill={r.coveragePct >= 90 ? 'var(--story-em, #3e9a78)' : 'var(--rose-text)'}
                    >
                      {t('reports.coverage.covUnit', { coverage: r.coveragePct })}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Rounded-row Table: Overdue Doctors List */}
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          borderRadius: '24px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--heading-text)' }}>
              {t('reports.coverage.tableTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-text)' }}>
              {t('reports.coverage.tableSubtitle')}
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--rose-text)' }}>
            {t('reports.coverage.overdueCount', { count: overdueDocs.length })}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ color: 'var(--muted-text)', textAlign: 'start', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 12px' }}>{t('reports.coverage.thDoctor')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.coverage.thSpecialty')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.coverage.thTerritory')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.coverage.thAssignedRep')}</th>
                <th style={{ padding: '8px 12px' }}>{t('reports.coverage.thLastVisit')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>{t('reports.coverage.thDaysOverdue')}</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('reports.coverage.thUrgency')}</th>
              </tr>
            </thead>
            <tbody>
              {overdueDocs.map((doc) => (
                <tr
                  key={doc.id}
                  style={{
                    background: 'var(--input-bg)',
                    borderRadius: '14px',
                  }}
                >
                  <td style={{ padding: '12px 14px', borderTopLeftRadius: '14px', borderBottomLeftRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Stethoscope style={{ width: '16px', height: '16px', color: 'var(--ocean)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--heading-text)' }}>{doc.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-text)' }}>{doc.clinic}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--heading-text)' }}>{doc.specialty}</td>
                  <td style={{ padding: '12px', color: 'var(--muted-text)' }}>{doc.territory}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Avatar initials={doc.assignedRep.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <span style={{ fontSize: '12px', color: 'var(--heading-text)' }}>{doc.assignedRep}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--muted-text)' }}>{doc.lastVisit}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: 'var(--rose-text)' }}>
                    {t('reports.coverage.daysPlus', { days: doc.daysOverdue })}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', borderTopRightRadius: '14px', borderBottomRightRadius: '14px' }}>
                    <StatusPill status={doc.daysOverdue > 20 ? 'Overdue' : 'Pending'} />
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
