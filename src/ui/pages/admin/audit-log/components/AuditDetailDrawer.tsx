'use client'

import { X, ClipboardCheck, User, Globe, Tag, Layers, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import type { AuditRecord } from '../mock-data'

export interface AuditDetailDrawerProps {
  log: AuditRecord | null
  isOpen: boolean
  onClose: () => void
}

export function AuditDetailDrawer({ log, isOpen, onClose }: AuditDetailDrawerProps) {
  const { t, lang } = useT()

  if (!isOpen || !log) return null

  const displayAction = lang === 'ar' && log.action_ar ? log.action_ar : log.action
  const displayDetails = lang === 'ar' && log.details_ar ? log.details_ar : log.details

  // Collect keys from before & after
  const beforeKeys = Object.keys(log.beforeAfter?.before || {})
  const afterKeys = Object.keys(log.beforeAfter?.after || {})
  const allFieldKeys = Array.from(new Set([...beforeKeys, ...afterKeys]))

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="drawer-panel"
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '100%',
          background: 'var(--card-bg, #ffffff)',
          boxShadow: 'var(--shadow-raised, -8px 0 32px rgba(0,0,0,0.18))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.22s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-raised, #f8fafc)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '8px',
                  background: 'var(--navy, #1B3554)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                {log.id}
              </span>
              <StatusPill status={log.status} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--heading-text)', margin: '8px 0 2px' }}>
              {displayAction}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
              {formatDate(log.timestamp || log.time, lang)}{log.time && log.timestamp && log.time !== formatDate(log.timestamp, lang) ? ` · ${log.time}` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Actor Info Card */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid var(--border-card, #e2e8f0)',
              background: 'linear-gradient(135deg, rgba(27, 53, 84, 0.04), rgba(2, 132, 199, 0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'var(--navy, #1B3554)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                }}
              >
                {(log.actor || 'User').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
                  {log.actor}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                  {log.actorRole || 'System Operator'}
                </span>
              </div>
            </div>

            {log.ipAddress && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--muted-text)',
                  background: 'var(--card-bg, #ffffff)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle, #f1f5f9)',
                }}
              >
                <Globe size={13} style={{ color: 'var(--sky, #0284c7)' }} />
                <span>{log.ipAddress}</span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border-card, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              fontSize: '13px',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Layers size={13} /> {lang === 'ar' ? 'الوحدة / النظام' : 'Module'}
              </span>
              <strong style={{ color: 'var(--heading-text)', display: 'block', marginTop: '3px' }}>
                {log.module}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={13} /> {lang === 'ar' ? 'نوع الإجراء' : 'Action Type'}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '3px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--sky, #0284c7)',
                }}
              >
                {log.actionType}
              </span>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'block' }}>
                {lang === 'ar' ? 'السجل / الكيان المتأثر' : 'Affected Record / Entity'}
              </span>
              <strong style={{ color: 'var(--navy, #1B3554)', display: 'block', marginTop: '3px' }}>
                {log.affectedRecord || '—'}
              </strong>
            </div>
          </div>

          {/* Details Narrative */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--heading-text)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>
              {lang === 'ar' ? 'تفاصيل العملية وسجل التنفيذ' : 'Operation Description & Payload'}
            </span>
            {displayDetails}
          </div>

          {/* Before & After Diff Comparison Panel */}
          {log.beforeAfter && allFieldKeys.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCheck size={16} style={{ color: 'var(--sky, #0284c7)' }} />
                <span>{lang === 'ar' ? 'مقارنة القيم قبل وبعد التعديل' : 'Before vs After State Comparison'}</span>
              </strong>

              <div
                style={{
                  borderRadius: '14px',
                  border: '1px solid var(--border-card, #e2e8f0)',
                  overflow: 'hidden',
                  background: 'var(--card-bg, #ffffff)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1.4fr 1.4fr',
                    background: 'var(--surface-raised, #f8fafc)',
                    padding: '10px 14px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: 'var(--muted-text)',
                    borderBottom: '1px solid var(--border-card, #e2e8f0)',
                  }}
                >
                  <span>{lang === 'ar' ? 'الحقل / الخاصية' : 'Property'}</span>
                  <span>{lang === 'ar' ? 'القيمة السابقة (Before)' : 'Previous Value'}</span>
                  <span>{lang === 'ar' ? 'القيمة الجديدة (After)' : 'Updated Value'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {allFieldKeys.map((field, idx) => {
                    const beforeVal = log.beforeAfter?.before?.[field]
                    const afterVal = log.beforeAfter?.after?.[field]

                    return (
                      <div
                        key={`${field}-${idx}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.2fr 1.4fr 1.4fr',
                          padding: '12px 14px',
                          fontSize: '12.5px',
                          borderBottom: idx < allFieldKeys.length - 1 ? '1px solid var(--border-subtle, #f1f5f9)' : 'none',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <strong style={{ color: 'var(--heading-text)', fontSize: '12px' }}>
                          {field}
                        </strong>

                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            background: beforeVal !== undefined ? 'rgba(225, 29, 72, 0.07)' : 'transparent',
                            color: beforeVal !== undefined ? 'var(--rose, #e11d48)' : 'var(--muted-text)',
                            fontSize: '12px',
                          }}
                        >
                          {beforeVal !== undefined ? String(beforeVal) : '—'}
                        </div>

                        <div
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            background: afterVal !== undefined ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                            color: afterVal !== undefined ? 'var(--emerald, #10b981)' : 'var(--muted-text)',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {afterVal !== undefined ? String(afterVal) : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-card, #e2e8f0)',
            background: 'var(--surface-raised, #f8fafc)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  )
}
