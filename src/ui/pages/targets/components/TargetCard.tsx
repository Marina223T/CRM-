'use client'

import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import type { SalesTarget, TargetProgressSummary } from '@/data/mock/targets'

export interface TargetCardProps {
  target: SalesTarget
  progress: TargetProgressSummary
  onEdit: (target: SalesTarget) => void
  onDelete: (target: SalesTarget) => void
  canManage?: boolean
}

export function TargetCard({
  target,
  progress,
  onEdit,
  onDelete,
  canManage = true,
}: TargetCardProps) {
  const { lang } = useT()

  const displayName = lang === 'ar' && target.name_ar ? target.name_ar : target.name
  const repDisplayName = lang === 'ar' && target.repName_ar ? target.repName_ar : target.repName

  // Progress Bar color styling based on percentage
  const percentCapped = Math.min(100, progress.percent)
  const barColor =
    progress.percent >= 100
      ? 'var(--emerald, #10b981)'
      : progress.percent >= 60
        ? 'var(--sky, #0284c7)'
        : 'var(--amber, #f59e0b)'

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '18px',
        background: 'var(--card-bg, #ffffff)',
        border: progress.isAchieved ? '1.5px solid var(--emerald, #10b981)' : '1px solid var(--border-card, #e2e8f0)',
        boxShadow: 'var(--card-shadow, 0 4px 16px rgba(0,0,0,0.04))',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Top Row: Name, Period Badge & Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '15.5px', color: 'var(--heading-text)' }}>
              {displayName}
            </strong>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: target.period === 'Quarterly' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                color: target.period === 'Quarterly' ? '#7c3aed' : 'var(--sky, #0284c7)',
              }}
            >
              {target.period === 'Quarterly'
                ? (lang === 'ar' ? 'ربع سنوي' : 'Quarterly')
                : (lang === 'ar' ? 'شهري' : 'Monthly')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', fontSize: '12.5px', marginTop: '4px' }}>
            <User size={13} />
            <span>{repDisplayName}</span>
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        {canManage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onEdit(target)}
              title={lang === 'ar' ? 'تعديل المستهدف' : 'Edit Target'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border-soft, #e2e8f0)',
                background: 'var(--surface-raised, #f8fafc)',
                color: 'var(--muted-text)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(target)}
              title={lang === 'ar' ? 'حذف المستهدف' : 'Delete Target'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid rgba(225, 29, 72, 0.2)',
                background: 'rgba(225, 29, 72, 0.05)',
                color: 'var(--rose, #e11d48)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Date Span & Days Left */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted-text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={13} />
          <span>
            {formatDate(target.startDate, lang)} — {formatDate(target.endDate, lang)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={13} style={{ color: progress.isAchieved ? 'var(--emerald)' : 'var(--muted-text)' }} />
          <span style={{ fontWeight: 600, color: progress.isAchieved ? 'var(--emerald, #10b981)' : 'var(--muted-text)' }}>
            {progress.isAchieved
              ? (lang === 'ar' ? 'تم تحقيق المستهدف!' : 'Target Achieved!')
              : (lang === 'ar' ? `متبقي ${progress.daysLeft} يوم` : `${progress.daysLeft} days left`)}
          </span>
        </div>
      </div>

      {/* Progress Bar with Attainment Percent */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
          <span style={{ color: 'var(--muted-text)', fontSize: '12px' }}>
            {lang === 'ar' ? 'نسبة الإنجاز:' : 'Achievement:'}
          </span>
          <strong style={{ fontSize: '16px', fontWeight: 800, color: barColor }}>
            {progress.percent}%
          </strong>
        </div>

        <div
          style={{
            width: '100%',
            height: '10px',
            borderRadius: '99px',
            background: 'var(--surface-raised, #e2e8f0)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentCapped}%`,
              height: '100%',
              borderRadius: '99px',
              background: barColor,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Progress Financials Breakdown (Requirement 5) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '12px',
          borderRadius: '12px',
          background: 'var(--surface-raised, #f8fafc)',
          border: '1px solid var(--border-soft, #f1f5f9)',
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        {/* Target Amount */}
        <div>
          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>
            {lang === 'ar' ? 'قيمة المستهدف' : 'Target Goal'}
          </span>
          <strong style={{ color: 'var(--heading-text)', fontSize: '13px' }}>
            {formatCurrency(target.targetValue, 'EGP', lang)}
          </strong>
        </div>

        {/* Achieved Amount */}
        <div>
          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>
            {lang === 'ar' ? 'المتحقق فعلياً' : 'Achieved'}
          </span>
          <strong style={{ color: barColor, fontSize: '13px' }}>
            {formatCurrency(progress.achievedAmount, 'EGP', lang)}
          </strong>
        </div>

        {/* Remaining Amount */}
        <div>
          <span style={{ color: 'var(--muted-text)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>
            {lang === 'ar' ? 'المتبقي' : 'Remaining'}
          </span>
          <strong style={{ color: progress.remainingAmount === 0 ? 'var(--emerald, #10b981)' : 'var(--heading-text)', fontSize: '13px' }}>
            {formatCurrency(progress.remainingAmount, 'EGP', lang)}
          </strong>
        </div>
      </div>
    </div>
  )
}
