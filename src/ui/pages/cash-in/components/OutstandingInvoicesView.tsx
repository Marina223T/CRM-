'use client'

import { useState, useMemo } from 'react'
import { FileText, Calendar, Building, CreditCard, ChevronRight, User, AlertTriangle } from 'lucide-react'
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

export interface OutstandingInvoicesViewProps {
  invoices: CollectionInvoice[]
  payments: PaymentRecord[]
  onCollectInvoice: (invoice: CollectionInvoice) => void
  searchQuery: string
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export function OutstandingInvoicesView({
  invoices,
  payments,
  onCollectInvoice,
  searchQuery,
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: OutstandingInvoicesViewProps) {
  const { t, lang } = useT()

  // Calculate summaries for each invoice
  const openInvoiceSummaries = useMemo(() => {
    return invoices
      .map((inv) => getInvoicePaymentSummary(inv, payments))
      .filter((s) => s.remainingBalance > 0)
      .filter((s) => {
        // Role Scoping
        if (role === 'rep' && s.invoice.repName.toLowerCase() !== currentUserName.toLowerCase()) {
          return false
        }
        // Search Query
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          const matchNum = s.invoice.invoiceNumber.toLowerCase().includes(q)
          const matchCust = s.invoice.customerName.toLowerCase().includes(q) || (s.invoice.customerName_ar && s.invoice.customerName_ar.toLowerCase().includes(q))
          const matchRep = s.invoice.repName.toLowerCase().includes(q)
          if (!matchNum && !matchCust && !matchRep) return false
        }
        return true
      })
      .sort((a, b) => new Date(a.invoice.dueDate).getTime() - new Date(b.invoice.dueDate).getTime())
  }, [invoices, payments, searchQuery, role, currentUserName])

  if (openInvoiceSummaries.length === 0) {
    return (
      <EmptyState
        message={
          lang === 'ar'
            ? 'لا توجد فواتير مستحقة — جميع الفواتير في النطاق المحدد مسددة بالكامل.'
            : 'No outstanding invoices — all invoices in this scope are fully settled or do not match your filter criteria.'
        }
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {openInvoiceSummaries.map((summary) => {
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
              border: summary.isOverdue
                ? '1px solid rgba(225, 29, 72, 0.3)'
                : '1px solid var(--border-card, #e2e8f0)',
              flexWrap: 'wrap',
              gap: '14px',
              transition: 'transform 0.15s ease',
            }}
          >
            {/* Invoice & Customer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
              <div
                className="item-icon"
                style={{
                  background: summary.isOverdue ? 'rgba(225, 29, 72, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                  color: summary.isOverdue ? 'var(--rose, #e11d48)' : 'var(--sky, #0284c7)',
                }}
              >
                <FileText size={18} />
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

            {/* Rep & Due Date */}
            <div style={{ flex: '1 1 180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} style={{ color: summary.isOverdue ? 'var(--rose, #e11d48)' : 'var(--muted-text)' }} />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: summary.isOverdue ? 'var(--rose, #e11d48)' : 'var(--heading-text)' }}>
                  {t('cashIn.outstanding.dueDate')}: {formatDate(inv.dueDate, lang)}
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                {inv.repName} {summary.isOverdue && `· +${summary.daysOverdue} ${t('cashIn.outstanding.daysOverdue')}`}
              </span>
            </div>

            {/* Balances */}
            <div style={{ textAlign: 'end', minWidth: '150px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                {t('cashIn.drawer.remainingBalance')} / {t('cashIn.drawer.originalAmount')}
              </span>
              <strong
                style={{
                  fontSize: '15px',
                  color: summary.isOverdue ? 'var(--rose, #e11d48)' : 'var(--navy, #1B3554)',
                  display: 'block',
                }}
              >
                {formatCurrency(summary.remainingBalance, 'EGP', lang)}
              </strong>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
                {lang === 'ar' ? 'سدد:' : 'Paid:'} {formatCurrency(summary.paidAmount, 'EGP', lang)} ({formatCurrency(inv.originalAmount, 'EGP', lang)})
              </span>
            </div>

            {/* Status & Quick Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <StatusPill status={summary.paymentStatus} />

              <Button
                type="button"
                variant="secondary"
                onClick={() => onCollectInvoice(inv)}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
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
  )
}
