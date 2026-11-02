import { useState, useMemo } from 'react'
import {
  Wallet,
  Plus,
  Receipt,
  AlertTriangle,
  Check,
  X,
  FileText,
  TrendingUp,
  PieChart,
  BarChart2,
  Calendar,
  Building,
  User,
} from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Modal } from '@/ui/design-system/components/Modal'
import { FieldError } from '@/ui/design-system/components/FieldError'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { Toast } from '@/ui/design-system/components/Toast'
import { useT } from '@/lib/i18n'
import { formatCurrency, formatDate } from '@/lib/format'
import { useStore } from '@/data/mock/store'
import {
  budgetsStore,
  expensesStore,
  approveExpense,
  rejectExpense,
  calculateBudgetMetrics,
  getBudgetAlerts,
  getSpendingByEmployee,
  getSpendingByCategory,
  getSpendingByTerritory,
  type ExpenseRecord,
} from '@/data/mock/budgets'
import { CreateBudgetDrawer } from './components/CreateBudgetDrawer'
import { RecordExpenseDrawer } from './components/RecordExpenseDrawer'

export interface BudgetsPageProps {
  role?: 'admin' | 'rep'
  currentUserName?: string
}

export default function BudgetsPage({
  role = 'admin',
  currentUserName = 'Alex Morgan',
}: BudgetsPageProps) {
  const { lang } = useT()
  const isManager = role === 'admin'

  const budgets = useStore(budgetsStore)
  const expenses = useStore(expensesStore)

  const [activeTab, setActiveTab] = useState<'allocation' | 'expenses' | 'reports'>('allocation')
  const [createBudgetOpen, setCreateBudgetOpen] = useState(false)
  const [recordExpenseOpen, setRecordExpenseOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Rejection modal state
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)

  // Status filter for expenses
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all')

  const notify = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  // Dashboard Aggregates
  const metrics = useMemo(() => calculateBudgetMetrics(), [budgets, expenses])
  const alerts = useMemo(() => getBudgetAlerts(), [budgets, expenses])

  // Filtered Expenses
  const displayedExpenses = useMemo(() => {
    let list = expenses
    if (role === 'rep') {
      list = list.filter((e) => e.employeeName.toLowerCase() === currentUserName.toLowerCase())
    }
    if (expenseStatusFilter !== 'all') {
      list = list.filter((e) => e.status === expenseStatusFilter)
    }
    return list
  }, [expenses, role, currentUserName, expenseStatusFilter])

  // Reports data
  const empSpending = useMemo(() => getSpendingByEmployee(), [expenses])
  const catSpending = useMemo(() => getSpendingByCategory(), [expenses])
  const terSpending = useMemo(() => getSpendingByTerritory(), [expenses])

  const handleApproveExpense = (id: string) => {
    try {
      approveExpense(id, currentUserName)
      notify(lang === 'ar' ? 'تمت الموافقة على النفقة بنجاح' : 'Expense approved successfully')
    } catch (err) {
      notify((err as Error).message)
    }
  }

  const handleConfirmReject = () => {
    if (!rejectExpenseId) return
    if (!rejectReason.trim()) {
      setRejectError(lang === 'ar' ? 'سبب الرفض مطلوب' : 'Rejection notes are required')
      return
    }
    try {
      rejectExpense(rejectExpenseId, rejectReason.trim(), currentUserName)
      setRejectExpenseId(null)
      setRejectReason('')
      setRejectError(null)
      notify(lang === 'ar' ? 'تم رفض المطالبة وحفظ السبب' : 'Expense claim rejected with notes')
    } catch (err) {
      setRejectError((err as Error).message)
    }
  }

  return (
    <section className="content">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            <Wallet /> {lang === 'ar' ? 'الميزانيات والنفقات' : 'BUDGET & EXPENSES'}
          </span>
          <h1>{lang === 'ar' ? 'إدارة الميزانية ومتابعة النفقات' : 'Budget & Expense Management'}</h1>
          <p className="story">
            {lang === 'ar'
              ? 'مراقبة الميزانيات التقديرية ومقارنتها بالإنفاق الفعلي ومراجعة مطالبات الموظفين.'
              : 'Monitor planned budgets versus actual expenditures, control limits, and review claims.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isManager && (
            <Button variant="secondary" onClick={() => setCreateBudgetOpen(true)}>
              <Plus data-icon="inline-start" /> {lang === 'ar' ? 'تخصيص ميزانية' : 'Allocate Budget'}
            </Button>
          )}
          <Button variant="primary" onClick={() => setRecordExpenseOpen(true)}>
            <Receipt data-icon="inline-start" /> {lang === 'ar' ? 'تسجيل نفقة' : 'Record Expense'}
          </Button>
        </div>
      </div>

      {/* KPI Capsules / Budget Dashboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '24px',
        }}
      >
        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
            {lang === 'ar' ? 'إجمالي الميزانية المخصصة' : 'Total Allocated Budget'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 700, margin: '6px 0 2px' }}>
            {formatCurrency(metrics.totalAllocated, 'EGP', lang)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {budgets.length} {lang === 'ar' ? 'ميزانيات معتمدة' : 'approved budgets'}
          </span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
            {lang === 'ar' ? 'إجمالي المنصرف الفعلي' : 'Total Actual Spent'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--heading-text)', margin: '6px 0 2px' }}>
            {formatCurrency(metrics.totalSpent, 'EGP', lang)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {metrics.utilizationPct}% {lang === 'ar' ? 'نسبة الاستهلاك الإجمالية' : 'overall utilization'}
          </span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
            {lang === 'ar' ? 'المتبقي من الميزانية' : 'Remaining Budget'}
          </span>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: metrics.remainingBudget > 0 ? '#059669' : '#dc2626',
              margin: '6px 0 2px',
            }}
          >
            {formatCurrency(metrics.remainingBudget, 'EGP', lang)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {lang === 'ar' ? 'متاح حتى نهاية الفترة' : 'available through end of cycle'}
          </span>
        </div>

        <div className="panel" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', fontWeight: 600 }}>
            {lang === 'ar' ? 'مطالبات قيد المراجعة' : 'Pending Expenses'}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#d97706', margin: '6px 0 2px' }}>
            {formatCurrency(metrics.pendingExpenses, 'EGP', lang)}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
            {expenses.filter((e) => e.status === 'Pending').length} {lang === 'ar' ? 'مطالبات تحتاج موافقة' : 'claims awaiting approval'}
          </span>
        </div>
      </div>

      {/* 5. Budget Alerts: Warning (>=80%) and Overspending (>100%) */}
      {alerts.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map((alt) => (
            <div
              key={alt.budgetId}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: alt.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${alt.severity === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle
                style={{
                  color: alt.severity === 'critical' ? '#dc2626' : '#d97706',
                  width: '20px',
                  height: '20px',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <strong
                  style={{
                    fontSize: '13px',
                    color: alt.severity === 'critical' ? '#dc2626' : '#b45309',
                    display: 'block',
                  }}
                >
                  {alt.severity === 'critical'
                    ? (lang === 'ar' ? 'تنبيه تجاوز الميزانية (تجاوز 100%)' : 'Critical: Budget Exceeded')
                    : (lang === 'ar' ? 'تحذير: اقتراب استهلاك الميزانية (أكثر من 80%)' : 'Warning: Approaching Budget Limit')}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--heading-text)' }}>
                  {alt.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 16px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('allocation')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'allocation' ? '1px solid #2563eb' : '1px solid var(--border-soft)',
            background: activeTab === 'allocation' ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface)',
            color: activeTab === 'allocation' ? '#2563eb' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Wallet size={15} />
          {lang === 'ar' ? 'تخصيص الميزانيات' : 'Budget Allocations'} ({budgets.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'expenses' ? '1px solid #059669' : '1px solid var(--border-soft)',
            background: activeTab === 'expenses' ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
            color: activeTab === 'expenses' ? '#059669' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Receipt size={15} />
          {lang === 'ar' ? 'مطالبات النفقات' : 'Expense Claims'} ({displayedExpenses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeTab === 'reports' ? '1px solid #7c3aed' : '1px solid var(--border-soft)',
            background: activeTab === 'reports' ? 'rgba(147, 51, 234, 0.1)' : 'var(--surface)',
            color: activeTab === 'reports' ? '#7c3aed' : 'var(--muted-text)',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BarChart2 size={15} />
          {lang === 'ar' ? 'تقارير الإنفاق الفعلي والمخطط' : 'Expenditure Reports'}
        </button>
      </div>

      {/* TAB 1: BUDGET ALLOCATIONS */}
      {activeTab === 'allocation' && (
        <div style={{ marginTop: '16px' }}>
          <div className="collection-list">
            {budgets.map((b) => {
              // Calculate spending for this specific budget
              const spent = expenses
                .filter((e) => {
                  if (e.status !== 'Approved') return false
                  if (b.type === 'employee') return e.employeeName.toLowerCase() === b.targetEntity.toLowerCase()
                  if (b.type === 'territory') return e.territory.toLowerCase() === b.targetEntity.toLowerCase()
                  if (b.type === 'activity') return e.category.toLowerCase().includes('promotional')
                  return true
                })
                .reduce((sum, e) => sum + e.amount, 0)

              const pct = b.allocatedAmount > 0 ? Math.round((spent / b.allocatedAmount) * 100) : 0
              const isOver = pct > 100

              return (
                <div
                  key={b.id}
                  className="collection-card"
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-soft)',
                    background: 'var(--surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ocean)' }}>
                          {b.id}
                        </span>
                        <strong style={{ fontSize: '15px' }}>{b.name}</strong>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
                        🎯 {b.type.toUpperCase()}: {b.targetEntity} · ⏱️ {b.period.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ textAlign: 'end' }}>
                      <strong style={{ fontSize: '16px', display: 'block' }}>
                        {formatCurrency(b.allocatedAmount, 'EGP', lang)}
                      </strong>
                      <span style={{ fontSize: '12px', color: isOver ? '#dc2626' : 'var(--muted-text)', fontWeight: 600 }}>
                        {spent.toLocaleString()} EGP {lang === 'ar' ? 'منصرف' : 'spent'} ({pct}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '6px',
                      borderRadius: '3px',
                      background: 'var(--surface-raised)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(pct, 100)}%`,
                        background: isOver ? '#dc2626' : pct >= 80 ? '#d97706' : '#2563eb',
                        borderRadius: '3px',
                      }}
                    />
                  </div>

                  {b.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--muted-text)', fontStyle: 'italic' }}>
                      &ldquo;{b.notes}&rdquo;
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE CLAIMS & APPROVAL WORKFLOW */}
      {activeTab === 'expenses' && (
        <div style={{ marginTop: '16px' }}>
          {/* Status filter chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setExpenseStatusFilter(st)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: expenseStatusFilter === st ? '1px solid var(--accent-primary, #2563eb)' : '1px solid var(--border-soft)',
                  background: expenseStatusFilter === st ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface)',
                  color: expenseStatusFilter === st ? 'var(--accent-primary, #2563eb)' : 'var(--muted-text)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : st}
              </button>
            ))}
          </div>

          <div className="collection-list">
            {displayedExpenses.length > 0 ? (
              displayedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="collection-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{exp.employeeName}</strong>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'var(--surface-raised)',
                          color: 'var(--muted-text)',
                          fontWeight: 600,
                        }}
                      >
                        {exp.category}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                        📍 {exp.territory}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--heading-text)', marginBottom: '2px' }}>
                      {exp.description}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                      📅 {formatDate(exp.date, lang)}
                      {exp.relatedVisitClient && ` · 🏥 ${exp.relatedVisitClient}`}
                      {exp.attachmentName && ` · 📎 ${exp.attachmentName}`}
                    </div>

                    {exp.status === 'Rejected' && exp.rejectionReason && (
                      <div style={{ fontSize: '11px', color: 'var(--rose-text, #dc2626)', marginTop: '4px' }}>
                        {lang === 'ar' ? 'سبب الرفض: ' : 'Rejection Reason: '}{exp.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <strong style={{ fontSize: '15px' }}>
                      {formatCurrency(exp.amount, 'EGP', lang)}
                    </strong>

                    <StatusPill status={exp.status} />

                    {/* Manager Approval/Rejection buttons for Pending claims */}
                    {isManager && exp.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                          onClick={() => {
                            setRejectExpenseId(exp.id)
                            setRejectReason('')
                            setRejectError(null)
                          }}
                        >
                          <X size={13} /> {lang === 'ar' ? 'رفض' : 'Reject'}
                        </Button>
                        <Button
                          variant="primary"
                          style={{ height: '28px', padding: '0 8px', fontSize: '12px' }}
                          onClick={() => handleApproveExpense(exp.id)}
                        >
                          <Check size={13} /> {lang === 'ar' ? 'موافقة' : 'Approve'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted-text)' }}>
                {lang === 'ar' ? 'لا توجد مطالبات نفقات مطابقة.' : 'No expense claims match this filter.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Spending by Category & Territory Grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* By Category */}
            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PieChart size={16} /> {lang === 'ar' ? 'الإنفاق الفعلي حسب البند' : 'Spending by Category'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {catSpending.map((c) => (
                  <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted-text)' }}>{c.category}</span>
                    <strong>{formatCurrency(c.spent, 'EGP', lang)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* By Territory */}
            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} /> {lang === 'ar' ? 'الإنفاق الفعلي حسب المنطقة' : 'Spending by Territory'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {terSpending.map((t) => (
                  <div key={t.territory} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted-text)' }}>{t.territory}</span>
                    <strong>{formatCurrency(t.spent, 'EGP', lang)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Planned vs Actual Table */}
          <div className="panel" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} /> {lang === 'ar' ? 'مقارنة الميزانية المخططة مقابل الإنفاق الفعلي' : 'Planned vs Actual Expenditure Breakdown'}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'start' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--muted-text)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'start' }}>Target Entity / Budget</th>
                    <th style={{ padding: '8px 10px', textAlign: 'start' }}>Type</th>
                    <th style={{ padding: '8px 10px', textAlign: 'end' }}>Planned (EGP)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'end' }}>Actual Spent (EGP)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'end' }}>Variance</th>
                    <th style={{ padding: '8px 10px', textAlign: 'end' }}>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map((b) => {
                    const spent = expenses
                      .filter((e) => {
                        if (e.status !== 'Approved') return false
                        if (b.type === 'employee') return e.employeeName.toLowerCase() === b.targetEntity.toLowerCase()
                        if (b.type === 'territory') return e.territory.toLowerCase() === b.targetEntity.toLowerCase()
                        if (b.type === 'activity') return e.category.toLowerCase().includes('promotional')
                        return true
                      })
                      .reduce((sum, e) => sum + e.amount, 0)

                    const variance = b.allocatedAmount - spent
                    const pct = b.allocatedAmount > 0 ? Math.round((spent / b.allocatedAmount) * 100) : 0

                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '10px' }}>
                          <strong>{b.name}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted-text)' }}>
                            {b.targetEntity}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: 'var(--muted-text)' }}>{b.type}</td>
                        <td style={{ padding: '10px', textAlign: 'end' }}>{b.allocatedAmount.toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'end' }}>{spent.toLocaleString()}</td>
                        <td
                          style={{
                            padding: '10px',
                            textAlign: 'end',
                            fontWeight: 600,
                            color: variance >= 0 ? '#059669' : '#dc2626',
                          }}
                        >
                          {variance >= 0 ? `+${variance.toLocaleString()}` : variance.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'end', fontWeight: 600 }}>{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Budget Drawer */}
      <CreateBudgetDrawer
        isOpen={createBudgetOpen}
        onClose={() => setCreateBudgetOpen(false)}
        onSaved={(newBudget) => {
          notify(lang === 'ar' ? `تم اعتماد ميزانية ${newBudget.name}` : `Budget ${newBudget.name} created`)
        }}
      />

      {/* Record Expense Drawer */}
      <RecordExpenseDrawer
        isOpen={recordExpenseOpen}
        onClose={() => setRecordExpenseOpen(false)}
        onSaved={(newExp) => {
          notify(lang === 'ar' ? `تم تسجيل مطالبة ${newExp.amount} ج.م` : `Expense claim of ${newExp.amount} EGP recorded`)
        }}
        currentUserName={currentUserName}
      />

      {/* Reject Expense Notes Modal */}
      <Modal isOpen={Boolean(rejectExpenseId)} onClose={() => setRejectExpenseId(null)}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>
            {lang === 'ar' ? 'رفض مطالبة النفقة' : 'Reject Expense Claim'}
          </h3>
          {rejectError && <FieldError message={rejectError} />}
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', display: 'block', margin: '10px 0 6px' }}>
            {lang === 'ar' ? 'سبب الرفض والملاحظات الإدارية' : 'Rejection Reason / Notes'} *
          </label>
          <textarea
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-soft)',
              background: 'var(--surface-raised)',
              fontSize: '13px',
              color: 'var(--heading-text)',
              minHeight: '70px',
              resize: 'vertical',
            }}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={lang === 'ar' ? 'أدخل ملاحظات الرفض الإداري...' : 'Provide notes detailing why this claim is rejected...'}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => setRejectExpenseId(null)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleConfirmReject}>
              {lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {toastMessage && <Toast message={toastMessage} />}
    </section>
  )
}
