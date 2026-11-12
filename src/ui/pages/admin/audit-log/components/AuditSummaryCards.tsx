'use client'

import { useMemo } from 'react'
import { ClipboardCheck, ShieldAlert, KeyRound, Users } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { AuditRecord } from '../mock-data'

export interface AuditSummaryCardsProps {
  logs: AuditRecord[]
}

export function AuditSummaryCards({ logs }: AuditSummaryCardsProps) {
  const { t, lang } = useT()

  const stats = useMemo(() => {
    const total = logs.length
    const criticalOrVoid = logs.filter(
      (l) => l.actionType === 'delete_void' || l.status === 'Warning' || l.status === 'Failed',
    ).length
    const securityOrPerms = logs.filter(
      (l) => l.actionType === 'auth' || l.actionType === 'permission',
    ).length
    const uniqueActors = new Set(logs.map((l) => l.actor)).size

    return { total, criticalOrVoid, securityOrPerms, uniqueActors }
  }, [logs])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}
    >
      {/* Total Events */}
      <div
        className="kpi-card"
        style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-card, #e2e8f0)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'إجمالي الأحداث المسجلة' : 'Total Logged Events'}
          </span>
          <ClipboardCheck size={16} style={{ color: 'var(--sky, #0284c7)' }} />
        </div>
        <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--heading-text)', display: 'block' }}>
          {stats.total}
        </strong>
        <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
          {lang === 'ar' ? 'سجل عمليات النظام المتكامل' : 'Across all distribution modules'}
        </span>
      </div>

      {/* Critical & Void Events */}
      <div
        className="kpi-card"
        style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: stats.criticalOrVoid > 0 ? 'rgba(225, 29, 72, 0.03)' : 'var(--card-bg, #ffffff)',
          border: stats.criticalOrVoid > 0 ? '1.5px solid rgba(225, 29, 72, 0.3)' : '1px solid var(--border-card, #e2e8f0)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'عمليات الإلغاء والتنبيهات' : 'Void & Critical Actions'}
          </span>
          <ShieldAlert size={16} style={{ color: 'var(--rose, #e11d48)' }} />
        </div>
        <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--rose, #e11d48)', display: 'block' }}>
          {stats.criticalOrVoid}
        </strong>
        <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
          {lang === 'ar' ? 'إيصالات ملغاة وتحذيرات تدقيق' : 'Requires administrative oversight'}
        </span>
      </div>

      {/* Security & Access */}
      <div
        className="kpi-card"
        style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-card, #e2e8f0)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'الأمان والصلاحيات' : 'Security & Permissions'}
          </span>
          <KeyRound size={16} style={{ color: 'var(--amber, #f59e0b)' }} />
        </div>
        <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--amber, #f59e0b)', display: 'block' }}>
          {stats.securityOrPerms}
        </strong>
        <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
          {lang === 'ar' ? 'جلسات دخول وتعديل صلاحيات' : 'Logins and privilege updates'}
        </span>
      </div>

      {/* Active Operators */}
      <div
        className="kpi-card"
        style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-card, #e2e8f0)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'المستخدمون النشطون' : 'Active Operators'}
          </span>
          <Users size={16} style={{ color: 'var(--navy, #1B3554)' }} />
        </div>
        <strong style={{ fontSize: '22px', fontWeight: 800, color: 'var(--navy, #1B3554)', display: 'block' }}>
          {stats.uniqueActors}
        </strong>
        <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
          {lang === 'ar' ? 'مسؤولون ومندوبو مبيعات مسجلون' : 'Unique actors executing actions'}
        </span>
      </div>
    </div>
  )
}
