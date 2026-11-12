'use client'

import { useState, useMemo } from 'react'
import { Building, FileText, ArrowDownLeft, ArrowUpRight, Calendar, Calculator, CheckCircle2, AlertTriangle, Printer } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import type { CollectionInvoice, PaymentRecord } from '@/data/mock/cash-in'

export interface CustomerStatementViewProps {
  invoices: CollectionInvoice[]
  payments: PaymentRecord[]
  availableCustomers: { id: string; name: string; name_ar?: string }[]
  initialCustomerId?: string | null
  onCollectPayment?: (customerId: string) => void
}

interface StatementEntry {
  id: string
  date: string
  type: 'Invoice' | 'Payment'
  reference: string
  debit: number // Invoiced amount
  credit: number // Paid amount
  runningBalance: number
  status: string
  notes?: string
}

export function CustomerStatementView({
  invoices,
  payments,
  availableCustomers,
  initialCustomerId = null,
  onCollectPayment,
}: CustomerStatementViewProps) {
  const { t, lang } = useT()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || availableCustomers[0]?.id || '',
  )

  const currentCustomer = useMemo(() => {
    return availableCustomers.find((c) => c.id === selectedCustomerId)
  }, [availableCustomers, selectedCustomerId])

  // Customer Invoices & Payments sorted chronologically
  const statementEntries = useMemo(() => {
    if (!selectedCustomerId) return []

    const customerInvoices = invoices.filter((i) => i.customerId === selectedCustomerId)
    const customerPayments = payments.filter((p) => p.customerId === selectedCustomerId)

    const rawList: Array<{
      id: string
      date: string
      type: 'Invoice' | 'Payment'
      reference: string
      amount: number
      status: string
      notes?: string
    }> = []

    customerInvoices.forEach((inv) => {
      rawList.push({
        id: inv.id,
        date: inv.issueDate,
        type: 'Invoice',
        reference: inv.invoiceNumber,
        amount: inv.originalAmount,
        status: 'Issued',
        notes: inv.notes,
      })
    })

    customerPayments.forEach((p) => {
      rawList.push({
        id: p.id,
        date: p.paymentDate,
        type: 'Payment',
        reference: p.receiptNumber,
        amount: p.amount,
        status: p.status,
        notes: `${p.paymentMethod} · ${p.referenceNumber} ${p.notes ? `(${p.notes})` : ''}`,
      })
    })

    // Sort ascending by date
    rawList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate running balance: +Invoice, -Payment (if not voided)
    let running = 0
    const entries: StatementEntry[] = rawList.map((item) => {
      let debit = 0
      let credit = 0

      if (item.type === 'Invoice') {
        debit = item.amount
        running += debit
      } else {
        if (item.status !== 'Voided') {
          credit = item.amount
          running = Math.max(0, running - credit)
        }
      }

      return {
        id: item.id,
        date: item.date,
        type: item.type,
        reference: item.reference,
        debit,
        credit,
        runningBalance: running,
        status: item.status,
        notes: item.notes,
      }
    })

    return entries
  }, [selectedCustomerId, invoices, payments])

  // Totals
  const totalBilled = useMemo(() => {
    return statementEntries.reduce((sum, e) => sum + e.debit, 0)
  }, [statementEntries])

  const totalPaid = useMemo(() => {
    return statementEntries.reduce((sum, e) => sum + e.credit, 0)
  }, [statementEntries])

  const netBalance = Math.max(0, totalBilled - totalPaid)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Customer Selector & Quick Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-card, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          <Building size={20} style={{ color: 'var(--sky, #0284c7)' }} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '4px' }}>
              {t('cashIn.statement.selectCustomer')}
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '40px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '0 12px',
              }}
            >
              {availableCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'ar' && c.name_ar ? c.name_ar : c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {netBalance > 0 && onCollectPayment && (
          <Button
            type="button"
            variant="primary"
            onClick={() => onCollectPayment(selectedCustomerId)}
          >
            {t('cashIn.outstanding.actionPay')}
          </Button>
        )}
      </div>

      {/* Account Statement Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block' }}>
            {t('cashIn.statement.summaryTotalBilled')}
          </span>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: 'var(--heading-text)', display: 'block', marginTop: '4px' }}>
            {formatCurrency(totalBilled, 'EGP', lang)}
          </strong>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block' }}>
            {t('cashIn.statement.summaryTotalPaid')}
          </span>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: 'var(--emerald, #10b981)', display: 'block', marginTop: '4px' }}>
            {formatCurrency(totalPaid, 'EGP', lang)}
          </strong>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: netBalance > 0 ? 'rgba(225, 29, 72, 0.04)' : 'rgba(16, 185, 129, 0.04)',
            border: netBalance > 0 ? '1.5px solid rgba(225, 29, 72, 0.3)' : '1.5px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', display: 'block' }}>
            {t('cashIn.statement.summaryNetBalance')}
          </span>
          <strong
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: netBalance > 0 ? 'var(--rose, #e11d48)' : 'var(--emerald, #10b981)',
              display: 'block',
              marginTop: '4px',
            }}
          >
            {formatCurrency(netBalance, 'EGP', lang)}
          </strong>
        </div>
      </div>

      {/* Statement Ledger Table */}
      <div
        style={{
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-raised, #f8fafc)',
          }}
        >
          <strong style={{ fontSize: '14.5px', color: 'var(--heading-text)' }}>
            {t('cashIn.statement.ledger')} ·{' '}
            {lang === 'ar' && currentCustomer?.name_ar ? currentCustomer.name_ar : currentCustomer?.name}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
            {statementEntries.length} {lang === 'ar' ? 'معاملات' : 'transactions'}
          </span>
        </div>

        {statementEntries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted-text)', fontSize: '13.5px' }}>
            {lang === 'ar' ? 'لا توجد حركات مسجلة لهذا العميل.' : 'No transactions recorded for this customer.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card, #e2e8f0)', background: 'var(--surface-raised, #f8fafc)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {t('cashIn.statement.date')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {t('cashIn.statement.type')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {lang === 'ar' ? 'المرجع / المستند' : 'Reference / Doc #'}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)', textAlign: 'end' }}>
                    {t('cashIn.statement.debit')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)', textAlign: 'end' }}>
                    {t('cashIn.statement.credit')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)', textAlign: 'end' }}>
                    {t('cashIn.statement.runningBalance')}
                  </th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--muted-text)' }}>
                    {t('cashIn.table.status')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {statementEntries.map((entry) => {
                  const isVoided = entry.status === 'Voided'
                  const isInvoice = entry.type === 'Invoice'

                  return (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: '1px solid var(--border-card, #f1f5f9)',
                        opacity: isVoided ? 0.6 : 1,
                        background: isVoided ? 'rgba(0,0,0,0.02)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 16px', color: 'var(--heading-text)', whiteSpace: 'nowrap' }}>
                        {formatDate(entry.date, lang)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            background: isInvoice ? 'rgba(2, 132, 199, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isInvoice ? 'var(--sky, #0284c7)' : 'var(--emerald, #10b981)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                          }}
                        >
                          {isInvoice ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                          {isInvoice ? (lang === 'ar' ? 'فاتورة' : 'Invoice') : (lang === 'ar' ? 'سداد' : 'Payment')}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: 'var(--heading-text)' }}>{entry.reference}</strong>
                        {entry.notes && (
                          <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                            {entry.notes}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'end', fontWeight: 600, color: 'var(--heading-text)' }}>
                        {entry.debit > 0 ? formatCurrency(entry.debit, 'EGP', lang) : '—'}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'end', fontWeight: 600, color: 'var(--emerald, #10b981)' }}>
                        {entry.credit > 0 ? (
                          <span style={{ textDecoration: isVoided ? 'line-through' : 'none' }}>
                            {formatCurrency(entry.credit, 'EGP', lang)}
                          </span>
                        ) : '—'}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'end', fontWeight: 700, color: 'var(--navy, #1B3554)' }}>
                        {formatCurrency(entry.runningBalance, 'EGP', lang)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <StatusPill status={entry.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
