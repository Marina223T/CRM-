'use client'

import { useState } from 'react'
import { X, ShieldAlert, FileText, Calendar, Building, CreditCard, User, Hash, AlertOctagon, CheckCircle2 } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PaymentRecord, CollectionInvoice } from '@/data/mock/cash-in'
import { VoidPaymentModal } from './VoidPaymentModal'

export interface CollectionDetailDrawerProps {
  payment: PaymentRecord | null
  isOpen: boolean
  onClose: () => void
  onVoidPayment: (receiptNumber: string, reason: string) => void
  invoices: CollectionInvoice[]
  canVoid?: boolean
}

export function CollectionDetailDrawer({
  payment,
  isOpen,
  onClose,
  onVoidPayment,
  invoices,
  canVoid = true,
}: CollectionDetailDrawerProps) {
  const { t, lang } = useT()
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false)

  if (!isOpen || !payment) return null

  const isVoided = payment.status === 'Voided'

  return (
    <>
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
            maxWidth: '580px',
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
              background: isVoided ? 'rgba(225, 29, 72, 0.04)' : 'var(--surface-raised, #f8fafc)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--heading-text)', margin: 0 }}>
                  {payment.receiptNumber}
                </h2>
                <StatusPill status={payment.status} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted-text)', margin: '4px 0 0 0' }}>
                {t('cashIn.detail.title')} · {formatDate(payment.paymentDate, lang)}
              </p>
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
            {/* If Voided: Audit Banner */}
            {isVoided && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'rgba(225, 29, 72, 0.08)',
                  border: '1.5px solid rgba(225, 29, 72, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertOctagon size={18} style={{ color: 'var(--rose, #e11d48)' }} />
                  <strong style={{ fontSize: '13.5px', color: 'var(--rose, #e11d48)' }}>
                    {t('cashIn.detail.voidedBadge')}
                  </strong>
                </div>
                {payment.voidReason && (
                  <p style={{ fontSize: '12.5px', color: 'var(--heading-text)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--muted-text)' }}>{t('cashIn.detail.voidReason')}: </span>
                    <strong>{payment.voidReason}</strong>
                  </p>
                )}
                <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '4px' }}>
                  {payment.voidedBy && (
                    <span>
                      {t('cashIn.detail.voidedBy')}: <strong>{payment.voidedBy}</strong>
                    </span>
                  )}
                  {payment.voidedAt && (
                    <span>
                      {t('cashIn.detail.voidedAt')}: {formatDate(payment.voidedAt, lang)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Total Payment Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(27, 53, 84, 0.06), rgba(2, 132, 199, 0.08))',
                border: '1px solid var(--border-card, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('cashIn.table.amount')}
                </span>
                <strong
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: isVoided ? 'var(--muted-text)' : 'var(--navy, #1B3554)',
                    textDecoration: isVoided ? 'line-through' : 'none',
                  }}
                >
                  {formatCurrency(payment.amount, 'EGP', lang)}
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-subtle, #f1f5f9)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--heading-text)',
                }}
              >
                <CreditCard size={15} style={{ color: 'var(--sky, #0284c7)' }} />
                <span>{payment.paymentMethod}</span>
              </div>
            </div>

            {/* Meta Attributes Grid */}
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
                  <Building size={13} /> {t('cashIn.table.customer')}
                </span>
                <strong style={{ color: 'var(--heading-text)', display: 'block', marginTop: '3px' }}>
                  {lang === 'ar' && payment.customerName_ar ? payment.customerName_ar : payment.customerName}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} /> {t('cashIn.table.date')}
                </span>
                <span style={{ color: 'var(--heading-text)', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                  {formatDate(payment.paymentDate, lang)}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Hash size={13} /> {t('cashIn.table.reference')}
                </span>
                <span style={{ color: 'var(--heading-text)', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                  {payment.referenceNumber || '—'}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} /> {t('cashIn.table.receivedBy')}
                </span>
                <span style={{ color: 'var(--heading-text)', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                  {payment.receivedBy}
                </span>
              </div>
            </div>

            {/* Notes if present */}
            {payment.notes && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'var(--surface-raised, #f8fafc)',
                  border: '1px solid var(--border-subtle, #f1f5f9)',
                  fontSize: '12.5px',
                  color: 'var(--heading-text)',
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>
                  {t('cashIn.drawer.notes')}:
                </span>
                {payment.notes}
              </div>
            )}

            {/* Allocated Invoices List */}
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--heading-text)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FileText size={16} style={{ color: 'var(--sky, #0284c7)' }} />
                <span>{t('cashIn.detail.allocatedInvoices')}</span>
                <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 400 }}>
                  ({payment.allocations.length})
                </span>
              </strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payment.allocations.map((alloc, idx) => {
                  const inv = invoices.find((i) => i.id === alloc.invoiceId || i.invoiceNumber === alloc.invoiceNumber)

                  return (
                    <div
                      key={`${alloc.invoiceId}-${idx}`}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-card, #e2e8f0)',
                        background: 'var(--card-bg, #ffffff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                          {alloc.invoiceNumber}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                          {lang === 'ar' ? 'القيمة الأصلية للفاتورة:' : 'Original Total:'}{' '}
                          {formatCurrency(alloc.invoiceOriginalAmount, 'EGP', lang)}
                        </span>
                      </div>

                      <div style={{ textAlign: 'end' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                          {lang === 'ar' ? 'المخصص في هذا الإيصال' : 'Allocated in this Receipt'}
                        </span>
                        <strong
                          style={{
                            fontSize: '14.5px',
                            fontWeight: 700,
                            color: isVoided ? 'var(--muted-text)' : 'var(--emerald, #10b981)',
                            textDecoration: isVoided ? 'line-through' : 'none',
                          }}
                        >
                          {formatCurrency(alloc.allocatedAmount, 'EGP', lang)}
                        </strong>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '18px 24px',
              borderTop: '1px solid var(--border-card, #e2e8f0)',
              background: 'var(--surface-raised, #f8fafc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {!isVoided && canVoid && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsVoidModalOpen(true)}
                  style={{ background: 'rgba(225,29,72,0.08)', borderColor: 'rgba(225,29,72,0.3)', color: 'var(--rose, #e11d48)' }}
                >
                  <ShieldAlert size={15} style={{ marginInlineEnd: '6px' }} />
                  {t('cashIn.detail.voidAction')}
                </Button>
              )}
            </div>

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

      {/* Confirmation Modal to Void */}
      <VoidPaymentModal
        payment={payment}
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        onConfirmVoid={(receiptNo, reason) => {
          onVoidPayment(receiptNo, reason)
          onClose()
        }}
      />
    </>
  )
}
