'use client'

import { useMemo } from 'react'
import { AlertCircle, Calendar, Building, CreditCard, Clock, User } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import {
  type CollectionInvoice,
  type PaymentRecord,
  getInvoicePaymentSummary,
} from '@/data/mock/cash-in'

export interface OverdueCollectionsViewProps {
  invoices: CollectionInvoice[]
  payments: PaymentRecord[]
  onCollectInvoice: (invoice: CollectionInvoice) => void
  searchQuery: string
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export function OverdueCollectionsView({
  invoices,
  payments,
  onCollectInvoice,
  searchQuery,
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: OverdueCollectionsViewProps) {
  const { t, lang } = useT()

  const overdueSummaries = useMemo(() => {
    return invoices
      .map((inv) => getInvoicePaymentSummary(inv, payments))
      .filter((s) => s.isOverdue)
      .filter((s) => {
        if (role === 'rep' && s.invoice.repName.toLowerCase() !== currentUserName.toLowerCase()) {
          return false
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          const matchNum = s.invoice.invoiceNumber.toLowerCase().includes(q)
          const matchCust = s.invoice.customerName.toLowerCase().includes(q) || (s.invoice.customerName_ar && s.invoice.customerName_ar.toLowerCase().includes(q))
          const matchRep = s.invoice.repName.toLowerCase().includes(q)
          if (!matchNum && !matchCust && !matchRep) return false
        }
        return true
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue) // Most overdue first
  }, [invoices, payments, searchQuery, role, currentUserName])

  const totalOverdue = useMemo(() => {
    return overdueSummaries.reduce((sum, s) => sum + s.remainingBalance, 0)
  }, [overdueSummaries])

  if (overdueSummaries.length === 0) {
    return (
      <EmptyState
        message={
          lang === 'ar'
            ? 'ممتاز! لا توجد متأخرات — سجل التحصيلات نظيف ولا توجد فواتير متأخرة عن تاريخ استحقاقها.'
            : 'Excellent! No overdue invoices — there are no receivable balances past their due dates in this scope.'
        }
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Alert Header Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'rgba(225, 29, 72, 0.08)',
          border: '1.5px solid rgba(225, 29, 72, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={22} style={{ color: 'var(--rose, #e11d48)' }} />
          <div>
            <strong style={{ fontSize: '14.5px', color: 'var(--rose, #e11d48)' }}>
              {lang === 'ar' ? 'تنبيه التحصيلات المتأخرة' : 'Overdue Receivables Alert'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
              {lang === 'ar'
                ? `${overdueSummaries.length} فواتير تجاوزت تواريخ استحقاقها وتحتاج إلى متابعة فورية`
                : `${overdueSummaries.length} invoice(s) have passed their agreed payment due dates and require immediate action`}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'end' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
            {t('cashIn.kpi.overdueAmount')}
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: 'var(--rose, #e11d48)' }}>
            {formatCurrency(totalOverdue, 'EGP', lang)}
          </strong>
        </div>
      </div>

      {/* Overdue Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {overdueSummaries.map((summary) => {
          const inv = summary.invoice
          const customerDisplay = lang === 'ar' && inv.customerName_ar ? inv.customerName_ar : inv.customerName

          return (
            <div
              key={inv.id}
              className="collection-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--card-bg, #ffffff)',
                border: '1px solid rgba(225, 29, 72, 0.22)',
                flexWrap: 'wrap',
                gap: '14px',
                transition: 'transform 0.15s ease',
              }}
            >
              {/* Invoice & Customer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
                <div
                  className="item-icon"
                  style={{ background: 'rgba(225, 29, 72, 0.1)', color: 'var(--rose, #e11d48)' }}
                >
                  <AlertCircle size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--heading-text)' }}>
                    {inv.invoiceNumber}
                  </strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--muted-text)', marginTop: '2px' }}>
                    {customerDisplay}
                  </span>
                </div>
              </div>

              {/* Overdue Days Badge */}
              <div style={{ flex: '1 1 180px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '99px',
                    background: 'rgba(225, 29, 72, 0.12)',
                    color: 'var(--rose, #e11d48)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <Clock size={13} />
                  <span>
                    +{summary.daysOverdue} {t('cashIn.outstanding.daysOverdue')}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'block', marginTop: '4px' }}>
                  {t('cashIn.outstanding.dueDate')}: {formatDate(inv.dueDate, lang)} · {inv.repName}
                </span>
              </div>

              {/* Overdue Balance */}
              <div style={{ textAlign: 'end', minWidth: '150px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                  {t('cashIn.kpi.overdueAmount')}
                </span>
                <strong style={{ fontSize: '16px', fontWeight: 800, color: 'var(--rose, #e11d48)', display: 'block' }}>
                  {formatCurrency(summary.remainingBalance, 'EGP', lang)}
                </strong>
                <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
                  {lang === 'ar' ? 'من أصل:' : 'Of total:'} {formatCurrency(inv.originalAmount, 'EGP', lang)}
                </span>
              </div>

              {/* Collect Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StatusPill status={summary.paymentStatus} />

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onCollectInvoice(inv)}
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    background: 'var(--rose, #e11d48)',
                    borderColor: 'var(--rose, #e11d48)',
                  }}
                >
                  <CreditCard size={13} style={{ marginInlineEnd: '5px' }} />
                  {t('cashIn.outstanding.actionPay')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
