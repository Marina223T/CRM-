'use client'

import { useState } from 'react'
import { AlertTriangle, X, ShieldAlert } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'
import type { PaymentRecord } from '@/data/mock/cash-in'

export interface VoidPaymentModalProps {
  payment: PaymentRecord | null
  isOpen: boolean
  onClose: () => void
  onConfirmVoid: (receiptNumber: string, reason: string) => void
}

export function VoidPaymentModal({
  payment,
  isOpen,
  onClose,
  onConfirmVoid,
}: VoidPaymentModalProps) {
  const { t, lang } = useT()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !payment) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(lang === 'ar' ? 'يرجى تقديم سبب إلزامي للإلغاء في سجل التدقيق' : 'Please provide a mandatory reason for voiding in the audit log')
      return
    }

    onConfirmVoid(payment.receiptNumber, reason.trim())
    setReason('')
    setError(null)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-raised, 0 20px 45px rgba(0,0,0,0.2))',
          border: '1px solid var(--border-card, #e2e8f0)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(225, 29, 72, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--rose, #e11d48)' }} />
            <strong style={{ fontSize: '15px', color: 'var(--rose, #e11d48)' }}>
              {t('cashIn.voidModal.title')}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted-text)', margin: 0, lineHeight: 1.5 }}>
            {t('cashIn.voidModal.warning')}
          </p>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              fontSize: '12.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div>
              <span style={{ color: 'var(--muted-text)' }}>{lang === 'ar' ? 'الإيصال:' : 'Receipt:'} </span>
              <strong>{payment.receiptNumber}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted-text)' }}>{lang === 'ar' ? 'العميل:' : 'Customer:'} </span>
              <strong>{lang === 'ar' && payment.customerName_ar ? payment.customerName_ar : payment.customerName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--muted-text)' }}>{lang === 'ar' ? 'المبلغ:' : 'Amount:'} </span>
              <strong style={{ color: 'var(--rose, #e11d48)' }}>{formatCurrency(payment.amount, 'EGP', lang)}</strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(225, 29, 72, 0.1)',
                color: 'var(--rose, #e11d48)',
                fontSize: '12.5px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', marginBottom: '6px' }}>
              {t('cashIn.voidModal.reasonLabel')} <span style={{ color: 'var(--rose)' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError(null)
              }}
              placeholder={t('cashIn.voidModal.reasonPlaceholder')}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-input, #cbd5e1)',
                fontSize: '13px',
                color: 'var(--heading-text)',
                background: 'var(--card-bg, #ffffff)',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              {lang === 'ar' ? 'تراجع' : 'Cancel'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleConfirm}
              style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'rgba(225,29,72,0.35)', color: 'var(--rose, #e11d48)', fontWeight: 700 }}
            >
              {t('cashIn.voidModal.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
