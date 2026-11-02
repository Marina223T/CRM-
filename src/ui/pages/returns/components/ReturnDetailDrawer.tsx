'use client'

import { useState, type CSSProperties } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { useAuth, canPerformAction } from '@/lib/auth'
import { useStore } from '@/data/mock/store'
import { returnsStore, approveReturn, rejectReturn } from '@/data/mock/returns'
import { formatDate } from '@/lib/format'

interface ReturnDetailDrawerProps {
  returnId: string | null
  onClose: () => void
  onAction: (msg: string) => void
}

const rowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  fontSize: '13px',
  padding: '6px 0',
  borderBottom: '1px solid var(--border-soft)',
}
const mutedStyle: CSSProperties = { color: 'var(--muted-text)' }

const CONDITION_COLOR: Record<string, string> = {
  sellable: 'var(--green-text, #16a34a)',
  damaged: 'var(--rose-text, #dc2626)',
  expired: 'var(--muted-text)',
}

export function ReturnDetailDrawer({ returnId, onClose, onAction }: ReturnDetailDrawerProps) {
  const { t, lang } = useT()
  const { user } = useAuth()
  const records = useStore(returnsStore)

  const record = records.find((r) => r.id === returnId)

  const canReview = canPerformAction('canApproveInvoices', user)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)

  if (!record) return null

  const isPending = record.status === 'Pending'

  const handleApprove = () => {
    if (busy) return
    setBusy('approve')
    try {
      approveReturn(record.id, user?.name || 'Unknown')
      onAction(t('returns.approveSuccess'))
      onClose()
    } catch (err) {
      onAction((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      setRejectReasonError(t('returns.reasonRequired'))
      return
    }
    if (busy) return
    setBusy('reject')
    try {
      rejectReturn(record.id, rejectReason.trim(), user?.name || 'Unknown')
      onAction(t('returns.rejectSuccess'))
      onClose()
    } catch (err) {
      onAction((err as Error).message)
    } finally {
      setBusy(null)
      setRejectOpen(false)
      setRejectReason('')
      setRejectReasonError('')
    }
  }

  const conditionLabel = (() => {
    if (record.condition === 'sellable') return t('returns.drawer.sellable')
    if (record.condition === 'damaged') return t('returns.drawer.damaged')
    return t('returns.drawer.expired')
  })()

  return (
    <Drawer
      title={t('returns.detail.title')}
      kicker={record.id}
      isOpen={!!returnId}
      onClose={onClose}
    >
      <div style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {record.order_id && (
            <div style={rowStyle}>
              <span style={mutedStyle}>{t('returns.detail.orderId')}</span>
              <span>{record.order_id}</span>
            </div>
          )}
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.customer')}</span>
            <span>{record.customerName}</span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.product')}</span>
            <span>{record.productName}</span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.batch')}</span>
            <span>{record.batchNumber}</span>
          </div>
          {record.expiryDate && (
            <div style={rowStyle}>
              <span style={mutedStyle}>Expiry Date</span>
              <span>{formatDate(record.expiryDate, lang)}</span>
            </div>
          )}
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.quantity')}</span>
            <span>{record.quantity} {t('returns.units')}</span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.date')}</span>
            <span>{formatDate(record.returnDate, lang)}</span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.reason')}</span>
            <span style={{ maxWidth: '200px', textAlign: 'end' }}>{record.reason}</span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.condition')}</span>
            <span style={{ color: CONDITION_COLOR[record.condition] || undefined, fontWeight: 600 }}>
              {conditionLabel}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={mutedStyle}>{t('returns.detail.status')}</span>
            <StatusPill status={record.status} />
          </div>
          {record.rejectionReason && (
            <div style={rowStyle}>
              <span style={mutedStyle}>{t('returns.detail.rejectionReason')}</span>
              <span style={{ maxWidth: '200px', textAlign: 'end', color: 'var(--rose-text, #dc2626)' }}>
                {record.rejectionReason}
              </span>
            </div>
          )}
        </div>

        {/* Already processed notice */}
        {!isPending && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-soft)',
              fontSize: '13px',
              color: 'var(--muted-text)',
            }}
          >
            {t('invoices.alreadyProcessed')}
          </div>
        )}

        {/* Approve / Reject buttons for Pending */}
        {isPending && canReview && !rejectOpen && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              variant="secondary"
              onClick={() => setRejectOpen(true)}
              disabled={!!busy}
            >
              {t('returns.reject')}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={busy === 'approve'}
              disabled={!!busy}
            >
              {t('returns.approve')}
            </Button>
          </div>
        )}

        {/* Rejection reason form */}
        {isPending && canReview && rejectOpen && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
              {t('invoices.rejectReason')}
            </div>
            <textarea
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-soft)',
                background: 'var(--surface-raised)',
                color: 'var(--heading-text)',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              placeholder={t('invoices.enterRejectReason')}
              value={rejectReason}
              onChange={(e) => { setRejectReason(e.target.value); setRejectReasonError('') }}
            />
            <FieldError message={rejectReasonError} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="secondary"
                onClick={() => { setRejectOpen(false); setRejectReason(''); setRejectReasonError('') }}
                disabled={!!busy}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleRejectConfirm}
                loading={busy === 'reject'}
                disabled={!!busy}
              >
                {t('returns.reject')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
