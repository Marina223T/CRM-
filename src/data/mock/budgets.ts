import { createStore } from './store'
import { addAuditLog } from './audit'

export type BudgetType = 'employee' | 'territory' | 'department' | 'activity'
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'
export type ExpenseCategory =
  | 'Transportation'
  | 'Business visits'
  | 'Approved promotional activities'
  | 'Operational expenses'
export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected'

export interface Budget {
  id: string
  name: string
  type: BudgetType
  targetEntity: string // e.g., 'Alex Morgan', 'North region', 'Field Sales', 'Bevato Launch Campaign'
  period: BudgetPeriod
  allocatedAmount: number
  notes?: string
  created_at: string
  updated_at?: string
}

export interface ExpenseRecord {
  id: string
  employeeName: string
  employeeId?: string
  territory: string
  category: ExpenseCategory
  amount: number
  date: string // YYYY-MM-DD
  description: string
  relatedVisitId?: string
  relatedVisitClient?: string
  attachmentName?: string
  status: ExpenseStatus
  rejectionReason?: string
  created_at: string
  updated_at?: string
}

const SEED_BUDGETS: Budget[] = [
  {
    id: 'BGT-2026-01',
    name: 'Alex Morgan — Q4 Travel & Field Visits',
    type: 'employee',
    targetEntity: 'Alex Morgan',
    period: 'quarterly',
    allocatedAmount: 45000,
    notes: 'Q4 field travel, clinic presentations, and key account meetings.',
    created_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'BGT-2026-02',
    name: 'Maya Patel — Q4 Pharmacy Distribution Budget',
    type: 'employee',
    targetEntity: 'Maya Patel',
    period: 'quarterly',
    allocatedAmount: 40000,
    notes: 'Pharmacy visits and consignment audits across West region.',
    created_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'BGT-2026-03',
    name: 'North Region Territory Operating Budget',
    type: 'territory',
    targetEntity: 'North region',
    period: 'quarterly',
    allocatedAmount: 70000,
    notes: 'Hospital accounts and cardiology symposia sponsorships.',
    created_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'BGT-2026-04',
    name: 'West Region Operating Budget',
    type: 'territory',
    targetEntity: 'West region',
    period: 'quarterly',
    allocatedAmount: 60000,
    notes: 'Covering Alexandria, Beheira, and West Nile accounts.',
    created_at: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 'BGT-2026-05',
    name: 'Bevato Clinical Promotion Campaign',
    type: 'activity',
    targetEntity: 'Approved promotional activities',
    period: 'quarterly',
    allocatedAmount: 50000,
    notes: 'KOL roundtables, printed monographs, and presentation collateral.',
    created_at: '2026-10-05T09:00:00.000Z',
  },
]

const SEED_EXPENSES: ExpenseRecord[] = [
  {
    id: 'EXP-101',
    employeeName: 'Alex Morgan',
    employeeId: 'u-admin-1',
    territory: 'North region',
    category: 'Transportation',
    amount: 1450,
    date: '2026-10-18',
    description: 'Highway tolls and fuel for North Medical Center clinical presentation visits',
    relatedVisitId: 'V-104',
    relatedVisitClient: 'Dr. Sarah Kim',
    attachmentName: 'fuel_receipt_1018.pdf',
    status: 'Approved',
    created_at: '2026-10-18T18:00:00.000Z',
  },
  {
    id: 'EXP-102',
    employeeName: 'Alex Morgan',
    employeeId: 'u-admin-1',
    territory: 'North region',
    category: 'Approved promotional activities',
    amount: 6200,
    date: '2026-10-21',
    description: 'Hospital cardiology department educational breakfast and product monographs',
    relatedVisitId: 'V-103',
    relatedVisitClient: 'St. Jude Medical Clinic',
    attachmentName: 'catering_invoice_oct21.pdf',
    status: 'Approved',
    created_at: '2026-10-21T16:00:00.000Z',
  },
  {
    id: 'EXP-103',
    employeeName: 'Maya Patel',
    employeeId: 'rep-maya',
    territory: 'West region',
    category: 'Transportation',
    amount: 2800,
    date: '2026-10-24',
    description: 'Intercity train & taxi travel for 3-day West territory pharmacy audit tour',
    relatedVisitClient: 'Green Cross Pharmacy',
    attachmentName: 'train_tickets_west.pdf',
    status: 'Approved',
    created_at: '2026-10-24T19:00:00.000Z',
  },
  {
    id: 'EXP-104',
    employeeName: 'Maya Patel',
    employeeId: 'rep-maya',
    territory: 'West region',
    category: 'Business visits',
    amount: 3900,
    date: '2026-10-27',
    description: 'Advisory dinner meeting with key West region clinical pharmacy heads',
    relatedVisitClient: 'Wellness First',
    attachmentName: 'dinner_voucher.pdf',
    status: 'Pending',
    created_at: '2026-10-27T21:00:00.000Z',
  },
  {
    id: 'EXP-105',
    employeeName: 'James Wilson',
    employeeId: 'rep-james',
    territory: 'Central region',
    category: 'Operational expenses',
    amount: 1200,
    date: '2026-10-29',
    description: 'Courier dispatch for urgent physician literature and sample coolers',
    attachmentName: 'courier_slip_441.pdf',
    status: 'Pending',
    created_at: '2026-10-29T10:00:00.000Z',
  },
  {
    id: 'EXP-106',
    employeeName: 'Olivia Martin',
    employeeId: 'rep-olivia',
    territory: 'North region',
    category: 'Transportation',
    amount: 3100,
    date: '2026-10-22',
    description: 'Vehicle maintenance and rental surcharge for coastal clinic coverage',
    status: 'Rejected',
    rejectionReason: 'Personal vehicle maintenance is covered under standard monthly allowance policy.',
    created_at: '2026-10-22T14:00:00.000Z',
    updated_at: '2026-10-23T09:00:00.000Z',
  },
]

export const budgetsStore = createStore<Budget[]>('budgets_v1', SEED_BUDGETS)
export const expensesStore = createStore<ExpenseRecord[]>('expenses_v1', SEED_EXPENSES)

const now = () => new Date().toISOString()

// 1. Budget Setup Functions
export function addBudget(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Budget {
  const budget: Budget = {
    ...data,
    id: `BGT-${Date.now().toString().slice(-4)}`,
    created_at: now(),
  }
  budgetsStore.update((list) => [budget, ...list])
  addAuditLog({
    action: 'Budget Created',
    actor: 'Manager',
    time: 'Just now',
    details: `Created budget: ${budget.name} (${budget.allocatedAmount.toLocaleString()} EGP)`,
  })
  return budget
}

export function updateBudget(id: string, patch: Partial<Budget>, actor: string = 'Manager'): Budget {
  let updated: Budget | undefined
  const at = now()
  budgetsStore.update((list) =>
    list.map((b) => {
      if (b.id === id) {
        updated = { ...b, ...patch, updated_at: at }
        return updated
      }
      return b
    })
  )
  if (!updated) throw new Error(`Budget ${id} not found.`)
  addAuditLog({
    action: 'Budget Updated',
    actor,
    time: 'Just now',
    details: `Updated budget ${updated.name}`,
  })
  return updated
}

// 2. Expense Records Functions
export function addExpenseRecord(
  data: Omit<ExpenseRecord, 'id' | 'created_at' | 'updated_at' | 'status'>
): ExpenseRecord {
  if (!data.amount || data.amount <= 0) {
    throw new Error('Expense amount must be greater than zero.')
  }
  if (!data.description.trim()) {
    throw new Error('Expense description is required.')
  }

  const record: ExpenseRecord = {
    ...data,
    id: `EXP-${Date.now().toString().slice(-4)}`,
    status: 'Pending',
    created_at: now(),
  }

  expensesStore.update((list) => [record, ...list])
  addAuditLog({
    action: 'Expense Submitted',
    actor: record.employeeName,
    time: 'Just now',
    details: `${record.employeeName} submitted ${record.category} expense of ${record.amount} EGP`,
  })
  return record
}

// 3. Approval Workflow (Rule: Prevent duplicate approvals, require notes on reject)
export function approveExpense(id: string, actor: string = 'Manager'): ExpenseRecord {
  const expense = expensesStore.get().find((e) => e.id === id)
  if (!expense) throw new Error(`Expense ${id} not found.`)
  if (expense.status === 'Approved') throw new Error(`Expense ${id} is already approved.`)
  if (expense.status !== 'Pending') throw new Error(`Only pending expenses can be approved.`)

  const at = now()
  let approvedRecord: ExpenseRecord | undefined

  expensesStore.update((list) =>
    list.map((e) => {
      if (e.id === id) {
        approvedRecord = { ...e, status: 'Approved', updated_at: at }
        return approvedRecord
      }
      return e
    })
  )

  addAuditLog({
    action: 'Expense Approved',
    actor,
    time: 'Just now',
    details: `Approved expense ${id} (${expense.amount} EGP) for ${expense.employeeName}`,
  })

  return approvedRecord!
}

export function rejectExpense(id: string, reason: string, actor: string = 'Manager'): ExpenseRecord {
  const expense = expensesStore.get().find((e) => e.id === id)
  if (!expense) throw new Error(`Expense ${id} not found.`)
  if (expense.status !== 'Pending') throw new Error(`Only pending expenses can be rejected.`)
  if (!reason.trim()) throw new Error('A rejection reason or note is required to reject an expense.')

  const at = now()
  let rejectedRecord: ExpenseRecord | undefined

  expensesStore.update((list) =>
    list.map((e) => {
      if (e.id === id) {
        rejectedRecord = { ...e, status: 'Rejected', rejectionReason: reason.trim(), updated_at: at }
        return rejectedRecord
      }
      return e
    })
  )

  addAuditLog({
    action: 'Expense Rejected',
    actor,
    time: 'Just now',
    details: `Rejected expense ${id} for ${expense.employeeName}: ${reason.trim()}`,
  })

  return rejectedRecord!
}

// 4. Calculations, Utilization & Dashboard Aggregates
export function calculateBudgetMetrics() {
  const budgets = budgetsStore.get()
  const expenses = expensesStore.get()

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0)
  const approvedExpenses = expenses.filter((e) => e.status === 'Approved')
  const totalSpent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingExpenses = expenses
    .filter((e) => e.status === 'Pending')
    .reduce((sum, e) => sum + e.amount, 0)
  const remainingBudget = Math.max(0, totalAllocated - totalSpent)
  const utilizationPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0

  return {
    totalAllocated,
    totalSpent,
    remainingBudget,
    pendingExpenses,
    utilizationPct,
  }
}

// 5. Budget Alerts: Approaching (>= 80%) and Overspending (> 100%)
export interface BudgetAlert {
  budgetId: string
  budgetName: string
  targetEntity: string
  allocated: number
  spent: number
  utilizationPct: number
  severity: 'critical' | 'warning'
  message: string
}

export function getBudgetAlerts(): BudgetAlert[] {
  const budgets = budgetsStore.get()
  const approvedExpenses = expensesStore.get().filter((e) => e.status === 'Approved')
  const alerts: BudgetAlert[] = []

  for (const b of budgets) {
    let spent = 0
    if (b.type === 'employee') {
      spent = approvedExpenses
        .filter((e) => e.employeeName.toLowerCase() === b.targetEntity.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0)
    } else if (b.type === 'territory') {
      spent = approvedExpenses
        .filter((e) => e.territory.toLowerCase() === b.targetEntity.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0)
    } else if (b.type === 'activity') {
      spent = approvedExpenses
        .filter((e) => e.category.toLowerCase().includes('promotional'))
        .reduce((sum, e) => sum + e.amount, 0)
    } else {
      spent = approvedExpenses.reduce((sum, e) => sum + e.amount, 0) / budgets.length
    }

    const pct = b.allocatedAmount > 0 ? Math.round((spent / b.allocatedAmount) * 100) : 0

    if (pct > 100) {
      alerts.push({
        budgetId: b.id,
        budgetName: b.name,
        targetEntity: b.targetEntity,
        allocated: b.allocatedAmount,
        spent,
        utilizationPct: pct,
        severity: 'critical',
        message: `Overspending detected: ${b.targetEntity} has exceeded budget by ${(spent - b.allocatedAmount).toLocaleString()} EGP (${pct}% utilization).`,
      })
    } else if (pct >= 80) {
      alerts.push({
        budgetId: b.id,
        budgetName: b.name,
        targetEntity: b.targetEntity,
        allocated: b.allocatedAmount,
        spent,
        utilizationPct: pct,
        severity: 'warning',
        message: `Budget threshold reached: ${b.targetEntity} is approaching limit at ${pct}% (${spent.toLocaleString()} / ${b.allocatedAmount.toLocaleString()} EGP).`,
      })
    }
  }

  return alerts
}

// 6. Reports Aggregators
export function getSpendingByEmployee() {
  const approved = expensesStore.get().filter((e) => e.status === 'Approved')
  const map = new Map<string, number>()
  for (const e of approved) {
    map.set(e.employeeName, (map.get(e.employeeName) ?? 0) + e.amount)
  }
  return Array.from(map.entries()).map(([employee, spent]) => ({ employee, spent }))
}

export function getSpendingByCategory() {
  const approved = expensesStore.get().filter((e) => e.status === 'Approved')
  const map = new Map<string, number>()
  for (const e of approved) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  }
  return Array.from(map.entries()).map(([category, spent]) => ({ category, spent }))
}

export function getSpendingByTerritory() {
  const approved = expensesStore.get().filter((e) => e.status === 'Approved')
  const map = new Map<string, number>()
  for (const e of approved) {
    map.set(e.territory, (map.get(e.territory) ?? 0) + e.amount)
  }
  return Array.from(map.entries()).map(([territory, spent]) => ({ territory, spent }))
}
