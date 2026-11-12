import { useState } from 'react'
import {
  Boxes, FileText, Warehouse, Activity, TrendingUp, ArrowRight,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, BadgeDollarSign
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { invoicesStore } from '@/data/mock/invoices'
import { salesOrdersStore, type SalesOrder } from '@/data/mock/sales-orders'
import { useStore } from '@/data/mock/store'
import { useT } from '@/lib/i18n'
import { formatCurrency } from '@/lib/format'

export interface DistributionOverviewProps {
  onNavigate: (page: string, options?: { filter?: string; overlay?: string }) => void
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export default function DistributionOverviewPage({
  onNavigate,
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: DistributionOverviewProps) {
  const { t, lang } = useT()
  const invoices = useStore(invoicesStore)
  const salesOrders = useStore(salesOrdersStore)

  const pendingInvoices = invoices.filter((i) => i.status === 'Pending')
  const totalOrdersAmount = salesOrders.reduce((sum: number, order: SalesOrder) => sum + (order.total || 0), 0)

  const quickLinks = [
    {
      title: t('nav.invoicesSellIn'),
      desc: lang === 'ar' ? 'متابعة أوامر البيع ومطابقة الفواتير' : 'Track orders & reconcile partner invoices',
      page: 'Invoices & Sell-in',
      icon: FileText,
      badge: pendingInvoices.length > 0 ? `${pendingInvoices.length} pending` : undefined,
      color: '#1B3554',
    },
    {
      title: t('nav.warehouses'),
      desc: lang === 'ar' ? 'إدارة المخزون والمستودعات الإقليمية' : 'Fulfillment hubs, stock balance & batch tracking',
      page: 'Warehouses',
      icon: Warehouse,
      color: '#059669',
    },
    {
      title: t('nav.sellOut'),
      desc: lang === 'ar' ? 'حركة المبيعات في الصيدليات ومعدل الدوران' : 'Pharmacy sell-out velocity & prescription demand',
      page: 'Sell-out',
      icon: Activity,
      color: '#2563eb',
    },
    {
      title: t('nav.performanceAnalytics'),
      desc: lang === 'ar' ? 'مقارنة المبيعات المباشرة بالاستهلاك الفعلي' : 'Sell-in vs Sell-out correlation & trend analytics',
      page: 'Performance Analytics',
      icon: TrendingUp,
      color: '#7c3aed',
    },
    {
      title: t('nav.cashIn'),
      desc: lang === 'ar' ? 'التحصيلات النقدية وتخصيص الفواتير وكشوف الحسابات' : 'Customer collections, invoice allocations & statement ledger',
      page: 'Cash In',
      icon: BadgeDollarSign,
      color: '#0284c7',
    },
  ]

  return (
    <section className="content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Intro */}
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <Boxes /> {t('distributionOverview.eyebrow')}
          </span>
          <h1>{t('distributionOverview.title')}</h1>
          <p className="story">{t('distributionOverview.story')}</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
              {t('distributionOverview.totalSellIn')}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy, #1B3554)' }}>
            {formatCurrency(totalOrdersAmount || 1245000)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {salesOrders.length} {lang === 'ar' ? 'أمر بيع مسجل' : 'sales orders in pipeline'}
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
              {t('distributionOverview.pendingInvoices')}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy, #1B3554)' }}>
            {pendingInvoices.length}
          </div>
          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
            {lang === 'ar' ? 'بانتظار التحقق والاعتماد' : 'Awaiting compliance review'}
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
              {t('distributionOverview.warehousesCount')}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
              <Warehouse size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy, #1B3554)' }}>
            3
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'القاهرة المركزية، الجيزة، الإسكندرية' : 'Cairo Central, Giza Hub, Alex'}
          </span>
        </div>

        <div
          style={{
            background: 'var(--surface, #ffffff)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
              {t('distributionOverview.totalSellOut')}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <Activity size={16} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy, #1B3554)' }}>
            $842,500
          </div>
          <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            +14.2% {lang === 'ar' ? 'مقارنة بالشهر السابق' : 'vs last period'}
          </span>
        </div>
      </div>

      {/* Quick Access Section */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px', color: 'var(--navy, #1B3554)' }}>
          {lang === 'ar' ? 'وحدات إدارة التوزيع' : 'Distribution Workspaces'}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.page}
                type="button"
                onClick={() => onNavigate(link.page)}
                style={{
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'start',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(27, 53, 84, 0.08)',
                      display: 'grid',
                      placeItems: 'center',
                      color: link.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  {link.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: 'var(--amber, #f59e0b)',
                        color: '#000F22',
                      }}
                    >
                      {link.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'var(--navy, #1B3554)' }}>
                    {link.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted-text)', margin: 0, lineHeight: 1.4 }}>
                    {link.desc}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--navy, #1B3554)',
                    marginTop: 'auto',
                    paddingTop: '8px',
                  }}
                >
                  <span>{lang === 'ar' ? 'فتح الوحدة' : 'Open Workspace'}</span>
                  <ArrowRight size={14} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
