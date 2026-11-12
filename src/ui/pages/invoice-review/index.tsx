import { useState } from 'react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Modal } from '@/ui/design-system/components/Modal'
import { Button } from '@/ui/design-system/components/Button'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { InvoiceDetailCard } from './components/InvoiceDetailCard'
import { InvoiceReviewActions } from './components/InvoiceReviewActions'
import { invoiceReviewMockData } from './mock-data'
import { canPerformAction, useAuth } from '@/lib/auth'
import { localizedName, useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import { invoicesStore, updateInvoice } from '@/data/mock/invoices'
import { salesOrdersStore } from '@/data/mock/sales-orders'
import { customersStore } from '@/data/mock/customers'
import { addAuditLog } from '@/data/mock/audit'
import { addNotification } from '@/data/mock/notifications'

export interface InvoiceReviewPageProps {
  invoiceName?: string | null
  onClose: () => void
  onAction: (msg: string) => void
}

function parseMetaAmount(meta: string): number | undefined {
  const match = meta.match(/EGP\s*([\d,]+(?:\.\d+)?)/)
  if (!match) return undefined
  const value = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(value) ? value : undefined
}

export default function InvoiceReviewPage({
  invoiceName,
  onClose,
  onAction,
}: InvoiceReviewPageProps) {
  const { t, lang } = useT()
  const { user } = useAuth()
  const invoices = useStore(invoicesStore)
  const orders = useStore(salesOrdersStore)
  const customers = useStore(customersStore)
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | 'resubmit' | null>(null)

  // Rejection modal state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')

  // Resubmit modal state
  const [resubmitOpen, setResubmitOpen] = useState(false)
  const [resubmitNote, setResubmitNote] = useState('')

  const invoice = invoiceName
    ? invoices.find((item) => item.name === invoiceName)
    : invoices.find((item) => item.status === 'Pending')

  const linkedOrder = invoice?.order_id
    ? orders.find((order) => order.id === invoice.order_id)
    : undefined
  const linkedCustomer = linkedOrder
    ? customers.find((customer) => customer.id === linkedOrder.customerId)
    : undefined

  const canReview = canPerformAction('canApproveInvoices', user)
  const isPending = invoice?.status === 'Pending'
  const isRejected = invoice?.status === 'Rejected'
  const isOwnerOrAdmin =
    user?.role === 'admin' ||
    Boolean(invoice?.repName && user?.name && invoice.repName.toLowerCase() === user.name.toLowerCase())

  if (!invoice) {
    const legacy = invoiceReviewMockData
    return (
      <Drawer title={legacy.id} kicker={lang === 'ar' ? legacy.kicker_ar : legacy.kicker} onClose={onClose}>
        <InvoiceDetailCard
          client={lang === 'ar' ? legacy.client_ar : legacy.client}
          amount={formatCurrency(legacy.amount, 'EGP', lang)}
          meta={lang === 'ar' ? legacy.meta_ar : legacy.meta}
        />
      </Drawer>
    )
  }

  const client = linkedCustomer
    ? localizedName(linkedCustomer, lang)
    : linkedOrder?.customerName ??
      (invoice.name.includes('·') ? invoice.name.split('·').slice(1).join('·').trim() : invoice.name)
  const amount = linkedOrder
    ? formatCurrency(linkedOrder.total, 'EGP', lang)
    : formatCurrency(parseMetaAmount(invoice.meta), 'EGP', lang)
  const meta = lang === 'ar' ? invoice.meta_ar || invoice.meta : invoice.meta

  const handleApprove = () => {
    // Prevent duplicate approval actions
    if (loadingAction || !isPending) return
    setLoadingAction('approve')
    try {
      const now = new Date().toISOString()
      const newHistory = [
        ...(invoice.approval_history || []),
        {
          action: 'Approved' as const,
          actor: user?.name || 'Unknown',
          timestamp: now,
        },
      ]
      updateInvoice(invoice.name, {
        status: 'Approved',
        approval_history: newHistory,
      })
      addAuditLog({
        action: 'Invoice Approved',
        actor: user?.name || 'Unknown',
        time: 'Just now',
        details: linkedOrder
          ? `Approved ${invoice.name} from sales order ${linkedOrder.id}`
          : `Approved ${invoice.name}`,
      })
      addNotification({
        title: 'Invoice Approved',
        message: `${invoice.name} has been approved by ${user?.name || 'Unknown'}.`,
        category: 'invoices',
        priority: 'info',
        time: 'Just now',
        targetPage: 'Invoices & Sell-in',
      })
      onAction(t('invoices.approveSuccess'))
      onClose()
    } finally {
      setLoadingAction(null)
    }
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectReasonError(t('invoices.rejectReasonRequired'))
      return
    }
    // Prevent duplicate actions
    if (loadingAction || !isPending) return
    setLoadingAction('reject')
    try {
      const now = new Date().toISOString()
      const newHistory = [
        ...(invoice.approval_history || []),
        {
          action: 'Rejected' as const,
          actor: user?.name || 'Unknown',
          timestamp: now,
          reason: rejectReason.trim(),
        },
      ]
      updateInvoice(invoice.name, {
        status: 'Rejected',
        rejection_reason: rejectReason.trim(),
        approval_history: newHistory,
      })
      addAuditLog({
        action: 'Invoice Rejected',
        actor: user?.name || 'Unknown',
        time: 'Just now',
        details: `Rejected ${invoice.name}: ${rejectReason.trim()}`,
      })
      addNotification({
        title: 'Invoice Rejected',
        message: `${invoice.name} was rejected by ${user?.name || 'Unknown'}: ${rejectReason.trim()}`,
        category: 'invoices',
        priority: 'warning',
        time: 'Just now',
        targetPage: 'Invoices & Sell-in',
      })
      setRejectOpen(false)
      setRejectReason('')
      setRejectReasonError('')
      onAction(t('invoices.rejectSuccess'))
      onClose()
    } finally {
      setLoadingAction(null)
    }
  }

  const handleConfirmResubmit = () => {
    if (loadingAction || !isRejected) return
    setLoadingAction('resubmit')
    try {
      const now = new Date().toISOString()
      const newHistory = [
        ...(invoice.approval_history || []),
        {
          action: 'Resubmitted' as const,
          actor: user?.name || 'Owner',
          timestamp: now,
          reason: resubmitNote.trim() || undefined,
        },
      ]
      updateInvoice(invoice.name, {
        status: 'Pending',
        rejection_reason: undefined,
        approval_history: newHistory,
      })
      addAuditLog({
        action: 'Invoice Resubmitted',
        actor: user?.name || 'Owner',
        time: 'Just now',
        details: `Resubmitted ${invoice.name} for review`,
      })
      addNotification({
        title: 'Invoice Resubmitted',
        message: `${invoice.name} has been resubmitted for review by ${user?.name || 'Owner'}.`,
        category: 'invoices',
        priority: 'info',
        time: 'Just now',
        targetPage: 'Invoices & Sell-in',
      })
      setResubmitOpen(false)
      setResubmitNote('')
      onAction(t('invoices.resubmitSuccess'))
      onClose()
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <Drawer title={invoice.name} kicker={t('invoices.reviewKicker')} onClose={onClose}>
      <InvoiceDetailCard client={client} amount={amount} meta={meta} />

      {linkedOrder && (
        <div style={{ margin: '-8px 24px 16px', fontSize: '12px', color: 'var(--muted-text)' }}>
          {t('invoices.createdFromOrder', { order: linkedOrder.id })}
        </div>
      )}

      {/* Rejection Note Banner */}
      {invoice.status === 'Rejected' && invoice.rejection_reason && (
        <div
          style={{
            margin: '0 24px 16px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '13px',
          }}
        >
          <div style={{ color: 'var(--rose-text, #dc2626)', fontWeight: 600, marginBottom: '4px' }}>
            {t('invoices.rejectReason')}
          </div>
          <div style={{ color: 'var(--heading-text)' }}>{invoice.rejection_reason}</div>
        </div>
      )}

      {/* Discount breakdown from the originating order */}
      {linkedOrder && (linkedOrder.discountAmount ?? 0) > 0 && (
        <div
          style={{
            margin: '-4px 24px 16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: 'var(--muted-text)' }}>{t('salesOrders.subtotal')}</span>
            <span>{formatCurrency(linkedOrder.subtotal, 'EGP', lang)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ color: 'var(--muted-text)' }}>
              {t('salesOrders.discount')}
              {linkedOrder.discountType === 'percentage' && linkedOrder.discountValue !== undefined
                ? ` (${linkedOrder.discountValue}%)`
                : ''}
            </span>
            <span style={{ color: 'var(--green-text, #16a34a)' }}>
              −{formatCurrency(linkedOrder.discountAmount ?? 0, 'EGP', lang)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontWeight: 700 }}>
            <span>{t('salesOrders.total')}</span>
            <span>{formatCurrency(linkedOrder.total, 'EGP', lang)}</span>
          </div>
        </div>
      )}

      {/* Approval History Timeline */}
      {invoice.approval_history && invoice.approval_history.length > 0 && (
        <div
          style={{
            margin: '0 24px 20px',
            padding: '14px',
            borderRadius: '10px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
          }}
        >
          <strong style={{ display: 'block', marginBottom: '10px', fontSize: '13px' }}>
            {t('invoices.history')}
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {invoice.approval_history.map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom:
                    i < invoice.approval_history!.length - 1 ? '1px solid var(--border-soft)' : 'none',
                  paddingBottom: i < invoice.approval_history!.length - 1 ? '6px' : '0',
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        h.action === 'Approved'
                          ? 'var(--green-text, #16a34a)'
                          : h.action === 'Rejected'
                          ? 'var(--rose-text, #dc2626)'
                          : 'var(--amber-text, #d97706)',
                    }}
                  >
                    {h.action === 'Approved'
                      ? t('invoices.historyApproved')
                      : h.action === 'Rejected'
                      ? t('invoices.historyRejected')
                      : t('invoices.historyResubmitted')}
                  </span>
                  <span style={{ color: 'var(--muted-text)', marginInlineStart: '6px' }}>
                    · {h.actor}
                  </span>
                  {h.reason && (
                    <div style={{ color: 'var(--muted-text)', marginTop: '2px', fontStyle: 'italic' }}>
                      &ldquo;{h.reason}&rdquo;
                    </div>
                  )}
                </div>
                <span style={{ color: 'var(--muted-text)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                  {formatDate(h.timestamp, lang)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already Processed Notice */}
      {!isPending && !isRejected && (
        <div
          style={{
            margin: '0 24px 16px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-soft)',
            fontSize: '13px',
            color: 'var(--muted-text)',
            textAlign: 'center',
          }}
        >
          {t('invoices.alreadyProcessed')}
        </div>
      )}

      {/* Action Buttons for Pending */}
      {isPending && canReview && (
        <InvoiceReviewActions
          onReject={() => setRejectOpen(true)}
          onApprove={handleApprove}
          loadingAction={loadingAction === 'resubmit' ? null : loadingAction}
        />
      )}

      {/* Resubmit Action for Rejected Invoices */}
      {isRejected && isOwnerOrAdmin && (
        <div style={{ padding: '0 24px 16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => setResubmitOpen(true)}>
            {t('invoices.resubmit')}
          </Button>
        </div>
      )}

      {/* Reject Reason Modal */}
      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{t('invoices.rejectTitle')}</h3>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
            {t('invoices.rejectReason')}
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value)
              setRejectReasonError('')
            }}
            placeholder={t('invoices.enterRejectReason')}
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
              background: 'var(--surface-raised)',
              color: 'var(--heading-text)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            autoFocus
          />
          {rejectReasonError && <FieldError message={rejectReasonError} />}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectOpen(false)
                setRejectReason('')
                setRejectReasonError('')
              }}
              disabled={loadingAction !== null}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReject}
              loading={loadingAction === 'reject'}
              disabled={loadingAction !== null}
            >
              {t('returns.reject')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resubmit Modal */}
      <Modal isOpen={resubmitOpen} onClose={() => setResubmitOpen(false)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{t('invoices.resubmit')}</h3>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--muted-text)' }}>
            {t('invoices.enterRejectReason')}
          </p>
          <textarea
            value={resubmitNote}
            onChange={(e) => setResubmitNote(e.target.value)}
            placeholder="Correction notes or resolution details (optional)..."
            rows={3}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-soft)',
              background: 'var(--surface-raised)',
              color: 'var(--heading-text)',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setResubmitOpen(false)
                setResubmitNote('')
              }}
              disabled={loadingAction !== null}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmResubmit}
              loading={loadingAction === 'resubmit'}
              disabled={loadingAction !== null}
            >
              {t('invoices.resubmit')}
            </Button>
          </div>
        </div>
      </Modal>
    </Drawer>
  )
}
