'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Receipt,
  Calendar,
  Building,
  Warehouse,
  Search,
  X,
  ChevronRight,
  ShieldCheck,
  FileText,
  Filter,
} from 'lucide-react'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import type { StoredInvoice } from '@/data/mock/invoices'
import type { InvoiceCalculatedSummary } from '@/data/mock/cash-in'

export interface PaidInvoiceRecord {
  invoice: StoredInvoice
  summary: InvoiceCalculatedSummary
}

export interface PaidInvoicesViewProps {
  paidInvoices: PaidInvoiceRecord[]
  onItemInvoice?: (invoice: StoredInvoice) => void
  role?: 'admin' | 'rep'
}

export function PaidInvoicesView({
  paidInvoices,
  onItemInvoice,
  role = 'admin',
}: PaidInvoicesViewProps) {
  const { t, lang } = useT()

  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'All time' | 'Today' | 'Last 7 days' | 'This month' | 'Last month'>('All time')
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')

  // Filtered paid invoices
  const filteredInvoices = useMemo(() => {
    return paidInvoices.filter(({ invoice, summary }) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const invNum = (invoice.invoiceNumber || invoice.name).toLowerCase()
        const custName = (invoice.customerName || invoice.name).toLowerCase()
        const custNameAr = (invoice.customerName_ar || invoice.name_ar || '').toLowerCase()
        const whName = (invoice.warehouseName || '').toLowerCase()
        const rep = (invoice.repName || '').toLowerCase()

        if (!invNum.includes(q) && !custName.includes(q) && !custNameAr.includes(q) && !whName.includes(q) && !rep.includes(q)) {
          return false
        }
      }

      // 2. Date Range Filter
      if (dateFilter !== 'All time') {
        if (invoice.dateRange !== dateFilter) {
          return false
        }
      }

      return true
    })
  }, [paidInvoices, searchQuery, dateFilter])

  // Summary Metrics
  const totalSettledAmount = useMemo(() => {
    return paidInvoices.reduce((sum, item) => sum + item.summary.paidAmount, 0)
  }, [paidInvoices])

  const totalOriginalAmount = useMemo(() => {
    return paidInvoices.reduce((sum, item) => sum + item.summary.invoice.originalAmount, 0)
  }, [paidInvoices])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Metric 1: Fully Paid Count */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {lang === 'ar' ? 'إجمالي الفواتير المسددة' : 'Total Paid Invoices'}
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--emerald, #10b981)' }} />
          </div>
          <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--emerald, #10b981)', display: 'block' }}>
            {paidInvoices.length}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {lang === 'ar' ? 'فواتير تم سدادها بالكامل (رصيد متبقي: صفر)' : 'Fully settled invoices (Remaining: EGP 0)'}
          </span>
        </div>

        {/* Metric 2: Settled Cash Value */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {lang === 'ar' ? 'إجمالي القيمة المحصلة' : 'Total Settled Amount'}
            </span>
            <Receipt size={18} style={{ color: 'var(--sky, #0284c7)' }} />
          </div>
          <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--heading-text)', display: 'block' }}>
            {formatCurrency(totalSettledAmount, 'EGP', lang)}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {lang === 'ar' ? 'مبالغ مدفوعة ومطابقة بنسبة 100%' : '100% matched collections'}
          </span>
        </div>

        {/* Metric 3: Settlement Rate */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-card, #e2e8f0)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)' }}>
              {lang === 'ar' ? 'حالة التسوية' : 'Settlement Status'}
            </span>
            <ShieldCheck size={18} style={{ color: 'var(--emerald, #10b981)' }} />
          </div>
          <strong style={{ fontSize: '24px', fontWeight: 800, color: 'var(--emerald, #10b981)', display: 'block' }}>
            100%
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
            {lang === 'ar' ? 'تسوية مالية كاملة ومؤكدة' : 'Complete financial clearance'}
          </span>
        </div>
      </div>

      {/* Toolbar / Search & Filter */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '440px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineStart: '14px',
              color: 'var(--muted-text)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'البحث برقم الفاتورة أو العميل أو المستودع...'
                : 'Search by invoice #, customer, warehouse...'
            }
            style={{
              width: '100%',
              height: '42px',
              paddingInlineStart: '38px',
              paddingInlineEnd: searchQuery ? '36px' : '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-input, #cbd5e1)',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--heading-text)',
              fontSize: '13.5px',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                insetInlineEnd: '10px',
                border: 0,
                background: 'transparent',
                color: 'var(--muted-text)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {(['All time', 'Today', 'Last 7 days', 'This month', 'Last month'] as const).map((period) => {
            const isActive = dateFilter === period
            const labelMap: Record<string, { en: string; ar: string }> = {
              'All time': { en: 'All time', ar: 'كل الأوقات' },
              'Today': { en: 'Today', ar: 'اليوم' },
              'Last 7 days': { en: 'Last 7 days', ar: 'آخر 7 أيام' },
              'This month': { en: 'This month', ar: 'هذا الشهر' },
              'Last month': { en: 'Last month', ar: 'الشهر الماضي' },
            }
            return (
              <button
                key={period}
                type="button"
                onClick={() => setDateFilter(period)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: isActive ? '1px solid var(--emerald, #10b981)' : '1px solid var(--border-soft, #e2e8f0)',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'var(--card-bg, #ffffff)',
                  color: isActive ? 'var(--emerald, #10b981)' : 'var(--muted-text)',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {lang === 'ar' ? labelMap[period].ar : labelMap[period].en}
              </button>
            )
          })}
        </div>
      </div>

      {/* Invoices List / Grid */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          message={
            lang === 'ar'
              ? 'لا توجد فواتير مسددة بالكامل تطابق معايير البحث الحالية.'
              : 'No fully paid invoices match your current search and filter criteria.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredInvoices.map(({ invoice, summary }) => {
            const invoiceNumber = invoice.invoiceNumber || invoice.id || invoice.name.split('·')[0].trim()
            const customerName = lang === 'ar' && invoice.customerName_ar ? invoice.customerName_ar : (invoice.customerName || invoice.name.split('·')[1]?.trim() || invoice.name)
            const isWarehouse = invoice.warehouseId || invoice.customerId?.startsWith('wh-')
            const issueDate = invoice.issueDate || '2026-10-15'
            const originalAmount = summary.invoice.originalAmount || invoice.originalAmount || 0
            const paidAmount = summary.paidAmount

            return (
              <div
                key={invoice.name}
                onClick={() => onItemInvoice?.(invoice)}
                role="button"
                tabIndex={0}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-card, #e2e8f0)',
                  transition: 'all 0.15s ease',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* 1. Invoice Number & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 220px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.10)',
                      color: 'var(--emerald, #10b981)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
                      {invoiceNumber}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      {lang === 'ar' ? 'تاريخ الإصدار:' : 'Issued:'} {formatDate(issueDate, lang)}
                    </span>
                  </div>
                </div>

                {/* 2. Customer / Warehouse */}
                <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isWarehouse ? (
                      <Warehouse size={14} style={{ color: 'var(--sky, #0284c7)' }} />
                    ) : (
                      <Building size={14} style={{ color: 'var(--navy, #1B3554)' }} />
                    )}
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--heading-text)' }}>
                      {customerName}
                    </span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                    {isWarehouse ? (lang === 'ar' ? 'مستودع جملة / لوجستي' : 'Wholesale / Hub') : (lang === 'ar' ? 'صيدلية / مركز طبي' : 'Pharmacy / Medical')}
                    {invoice.repName ? ` · ${invoice.repName}` : ''}
                  </span>
                </div>

                {/* 3. Original Amount */}
                <div style={{ minWidth: '120px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                    {lang === 'ar' ? 'القيمة الأصلية' : 'Original Amount'}
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--heading-text)' }}>
                    {formatCurrency(originalAmount, 'EGP', lang)}
                  </strong>
                </div>

                {/* 4. Paid Amount & Clearance Badge */}
                <div style={{ minWidth: '140px', textAlign: 'end' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)', display: 'block' }}>
                    {lang === 'ar' ? 'المبلغ المسدد' : 'Paid Amount'}
                  </span>
                  <strong style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--emerald, #10b981)' }}>
                    {formatCurrency(paidAmount, 'EGP', lang)}
                  </strong>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: 'var(--emerald, #10b981)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      marginInlineStart: '6px',
                    }}
                  >
                    {lang === 'ar' ? '100% مسدد' : '100% Settled'}
                  </span>
                </div>

                {/* 5. Status Pill & Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StatusPill status="Paid" />
                  <ChevronRight size={18} style={{ color: 'var(--muted-text)' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
