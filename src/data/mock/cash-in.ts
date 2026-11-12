import { createStore } from './store'
import { addAuditLog } from './audit'
import { addNotification } from './notifications'
import { invoicesStore, type StoredInvoice, updateInvoice } from './invoices'

export interface CollectionInvoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerName_ar?: string
  warehouseId?: string
  warehouseName?: string
  warehouseName_ar?: string
  issueDate: string
  dueDate: string
  originalAmount: number
  repName: string
  repId?: string
  notes?: string
}

export interface InvoiceAllocation {
  invoiceId: string
  invoiceNumber: string
  allocatedAmount: number
  invoiceOriginalAmount: number
}

export type PaymentMethod = 'Cash'
export type PaymentStatus = 'Completed' | 'Voided'
export type InvoicePaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue'

export interface PaymentRecord {
  id: string
  receiptNumber: string
  customerId: string
  customerName: string
  customerName_ar?: string
  paymentDate: string
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber: string
  receivedBy: string
  status: PaymentStatus
  notes?: string
  allocations: InvoiceAllocation[]
  created_at: string
  voidedAt?: string
  voidedBy?: string
  voidReason?: string
}

export interface InvoiceCalculatedSummary {
  invoice: CollectionInvoice
  paidAmount: number
  remainingBalance: number
  paymentStatus: InvoicePaymentStatus
  isOverdue: boolean
  daysOverdue: number
  allocationsCount: number
}

export interface CashInKpis {
  totalInvoiced: number
  totalCollected: number
  outstandingBalance: number
  overdueAmount: number
  collectionsThisMonth: number
}

// Reference system date for simulation: October 26, 2026
export const SYSTEM_CURRENT_DATE = '2026-10-26'

export function toCollectionInvoice(inv: StoredInvoice): CollectionInvoice {
  const invoiceNumber = inv.invoiceNumber || inv.id || inv.name.split('·')[0].trim()
  const customerName = inv.customerName || (inv.name.includes('·') ? inv.name.split('·')[1].trim() : inv.name)

  let amount = inv.originalAmount || 0
  if (!amount && inv.meta) {
    const match = inv.meta.match(/EGP\s*([\d,]+(?:\.\d+)?)/)
    if (match) amount = Number(match[1].replace(/,/g, ''))
  }

  let customerId = inv.customerId
  if (!customerId) {
    const norm = customerName.toLowerCase()
    if (norm.includes('green cross')) customerId = 'c-2'
    else if (norm.includes('metro health') || norm.includes('city clinic')) customerId = 'c-6'
    else if (norm.includes('riverside')) customerId = 'c-9'
    else if (norm.includes('wellness')) customerId = 'c-4'
    else if (norm.includes('apex')) customerId = 'c-apex'
    else if (norm.includes('medplus')) customerId = 'c-medplus'
    else if (norm.includes('northstar')) customerId = 'c-northstar'
    else if (norm.includes('wellcare')) customerId = 'c-wellcare'
    else if (norm.includes('cairo central') || norm.includes('logistics hub')) customerId = 'wh-cai-01'
    else if (norm.includes('giza')) customerId = 'wh-gz-01'
    else customerId = `c-${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  }

  return {
    id: invoiceNumber,
    invoiceNumber,
    customerId,
    customerName,
    customerName_ar: inv.customerName_ar || (inv.name_ar?.includes('·') ? inv.name_ar.split('·')[1].trim() : undefined),
    warehouseId: inv.warehouseId || (customerId.startsWith('wh-') ? customerId : undefined),
    warehouseName: inv.warehouseName,
    warehouseName_ar: inv.warehouseName_ar,
    issueDate: inv.issueDate || '2026-10-15',
    dueDate: inv.dueDate || '2026-11-15',
    originalAmount: amount,
    repName: inv.repName || 'Alex Morgan',
    repId: inv.repName === 'Maya Patel' ? 'rep-maya' : inv.repName === 'Olivia Martin' ? 'rep-olivia' : inv.repName === 'Sofia Chen' ? 'rep-sofia' : inv.repName === 'James Wilson' ? 'rep-james' : 'u-admin-1',
    notes: inv.notes || inv.meta,
  }
}

export function getSharedCollectionInvoices(): CollectionInvoice[] {
  return invoicesStore.get().filter((i) => i.status !== 'Rejected').map(toCollectionInvoice)
}

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-088',
    receiptNumber: 'REC-2026-088',
    customerId: 'c-2',
    customerName: 'Green Cross Pharmacy',
    customerName_ar: 'صيدلية جرين كروس',
    paymentDate: '2026-10-24',
    amount: 12000,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-2401',
    receivedBy: 'Maya Patel',
    status: 'Completed',
    notes: 'Cash collected during field restock visit.',
    allocations: [
      {
        invoiceId: 'INV-1040',
        invoiceNumber: 'INV-1040',
        allocatedAmount: 8000,
        invoiceOriginalAmount: 16380,
      },
      {
        invoiceId: 'INV-1048',
        invoiceNumber: 'INV-1048',
        allocatedAmount: 4000,
        invoiceOriginalAmount: 8420,
      },
    ],
    created_at: '2026-10-24T14:30:00Z',
  },
  {
    id: 'pay-087',
    receiptNumber: 'REC-2026-087',
    customerId: 'c-6',
    customerName: 'Metro Health Center',
    customerName_ar: 'مركز مترو الصحي',
    paymentDate: '2026-10-22',
    amount: 15200,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-8849',
    receivedBy: 'Olivia Martin',
    status: 'Completed',
    notes: 'Cash payment confirmed.',
    allocations: [
      {
        invoiceId: 'INV-1039',
        invoiceNumber: 'INV-1039',
        allocatedAmount: 15200,
        invoiceOriginalAmount: 15200,
      },
    ],
    created_at: '2026-10-22T10:15:00Z',
  },
  {
    id: 'pay-086',
    receiptNumber: 'REC-2026-086',
    customerId: 'c-9',
    customerName: 'Riverside Pharmacy',
    customerName_ar: 'صيدلية ريفرسايد',
    paymentDate: '2026-10-20',
    amount: 9400,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-8821',
    receivedBy: 'Sofia Chen',
    status: 'Completed',
    notes: 'Cash receipt cleared.',
    allocations: [
      {
        invoiceId: 'INV-1041',
        invoiceNumber: 'INV-1041',
        allocatedAmount: 9400,
        invoiceOriginalAmount: 9400,
      },
    ],
    created_at: '2026-10-20T11:45:00Z',
  },
  {
    id: 'pay-085',
    receiptNumber: 'REC-2026-085',
    customerId: 'c-4',
    customerName: 'Wellness First',
    customerName_ar: 'ويلنس فيرست',
    paymentDate: '2026-10-18',
    amount: 7100,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-4019',
    receivedBy: 'Maya Patel',
    status: 'Completed',
    notes: 'Cash payment settlement.',
    allocations: [
      {
        invoiceId: 'INV-1042',
        invoiceNumber: 'INV-1042',
        allocatedAmount: 7100,
        invoiceOriginalAmount: 7100,
      },
    ],
    created_at: '2026-10-18T09:30:00Z',
  },
  {
    id: 'pay-084',
    receiptNumber: 'REC-2026-084',
    customerId: 'c-apex',
    customerName: 'Apex Pharma Distribution',
    customerName_ar: 'توزيع أبيكس فارما',
    paymentDate: '2026-10-15',
    amount: 25000,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-1092',
    receivedBy: 'James Wilson',
    status: 'Completed',
    notes: 'Partial cash settlement for Q3 bulk invoice.',
    allocations: [
      {
        invoiceId: 'INV-1036',
        invoiceNumber: 'INV-1036',
        allocatedAmount: 25000,
        invoiceOriginalAmount: 38500,
      },
    ],
    created_at: '2026-10-15T16:00:00Z',
  },
  {
    id: 'pay-083',
    receiptNumber: 'REC-2026-083',
    customerId: 'c-medplus',
    customerName: 'MedPlus',
    customerName_ar: 'صيدلية ميد بلس',
    paymentDate: '2026-10-10',
    amount: 4840,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-1029',
    receivedBy: 'Alex Morgan',
    status: 'Completed',
    notes: 'Full cash payment received at head office.',
    allocations: [
      {
        invoiceId: 'INV-1047',
        invoiceNumber: 'INV-1047',
        allocatedAmount: 4840,
        invoiceOriginalAmount: 4840,
      },
    ],
    created_at: '2026-10-10T13:20:00Z',
  },
  {
    id: 'pay-082',
    receiptNumber: 'REC-2026-082',
    customerId: 'c-2',
    customerName: 'Green Cross Pharmacy',
    customerName_ar: 'صيدلية جرين كروس',
    paymentDate: '2026-10-05',
    amount: 10000,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-7719',
    receivedBy: 'Maya Patel',
    status: 'Completed',
    notes: 'Cash collected during scheduled visit.',
    allocations: [
      {
        invoiceId: 'INV-1035',
        invoiceNumber: 'INV-1035',
        allocatedAmount: 10000,
        invoiceOriginalAmount: 12000,
      },
    ],
    created_at: '2026-10-05T12:00:00Z',
  },
  {
    id: 'pay-081',
    receiptNumber: 'REC-2026-081',
    customerId: 'c-6',
    customerName: 'Metro Health Center',
    customerName_ar: 'مركز مترو الصحي',
    paymentDate: '2026-09-28',
    amount: 3210,
    paymentMethod: 'Cash',
    referenceNumber: 'CSH-0981',
    receivedBy: 'Olivia Martin',
    status: 'Voided',
    notes: 'Payment record cancelled due to erroneous receipt duplicate.',
    voidedAt: '2026-09-29T11:00:00Z',
    voidedBy: 'Alex Morgan',
    voidReason: 'Client provided replacement cash slip instead of branch duplicate.',
    allocations: [
      {
        invoiceId: 'INV-1044',
        invoiceNumber: 'INV-1044',
        allocatedAmount: 3210,
        invoiceOriginalAmount: 3210,
      },
    ],
    created_at: '2026-09-28T15:00:00Z',
  },
]

// Stores
export const collectionInvoicesStore = createStore<CollectionInvoice[]>(
  'collection_invoices',
  getSharedCollectionInvoices(),
)

export const collectionsStore = createStore<PaymentRecord[]>(
  'collections',
  INITIAL_PAYMENTS,
)

export interface CollectionTargetSettings {
  monthlyTarget: number
  targetMonth: string
}

export const collectionTargetStore = createStore<CollectionTargetSettings>(
  'cash_in_target',
  {
    monthlyTarget: 100000,
    targetMonth: '2026-10',
  },
)

export function updateCollectionTarget(newTarget: number, actor: string = 'Alex Morgan') {
  collectionTargetStore.update((curr) => {
    const updated = { ...curr, monthlyTarget: newTarget }
    addAuditLog({
      action: 'Collection Target Updated',
      actor,
      time: 'Just now',
      module: 'Collections',
      actionType: 'update',
      affectedRecord: `Monthly Target (${curr.targetMonth})`,
      status: 'Success',
      details: `Updated monthly collection target to ${newTarget.toLocaleString()} EGP`,
    })
    return updated
  })
}

// Calculation Helpers
export function getInvoicePaymentSummary(
  invoice: CollectionInvoice,
  allPayments: PaymentRecord[],
  systemDate: string = SYSTEM_CURRENT_DATE,
): InvoiceCalculatedSummary {
  // Non-voided payments allocating to this invoice
  const validAllocations = allPayments
    .filter((p) => p.status !== 'Voided')
    .flatMap((p) =>
      p.allocations
        .filter((a) => a.invoiceId === invoice.id || a.invoiceNumber === invoice.invoiceNumber)
        .map((a) => a.allocatedAmount),
    )

  const paidAmount = validAllocations.reduce((sum, amt) => sum + amt, 0)
  const remainingBalance = Math.max(0, invoice.originalAmount - paidAmount)

  const isDueDatePassed = new Date(invoice.dueDate).getTime() < new Date(systemDate).getTime()
  const isOverdue = remainingBalance > 0 && isDueDatePassed

  let daysOverdue = 0
  if (isOverdue) {
    const diffTime = Math.abs(new Date(systemDate).getTime() - new Date(invoice.dueDate).getTime())
    daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  let paymentStatus: InvoicePaymentStatus = 'Unpaid'
  if (remainingBalance <= 0) {
    paymentStatus = 'Paid'
  } else if (isOverdue) {
    paymentStatus = 'Overdue'
  } else if (paidAmount > 0) {
    paymentStatus = 'Partially Paid'
  } else {
    paymentStatus = 'Unpaid'
  }

  return {
    invoice,
    paidAmount,
    remainingBalance,
    paymentStatus,
    isOverdue,
    daysOverdue,
    allocationsCount: validAllocations.length,
  }
}

export function calculateCashInKpis(
  invoices: CollectionInvoice[],
  payments: PaymentRecord[],
  systemDate: string = SYSTEM_CURRENT_DATE,
): CashInKpis {
  // 1. Total Invoiced Amount
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.originalAmount, 0)

  // 2. Total Collected Amount (from non-voided payments)
  const validPayments = payments.filter((p) => p.status !== 'Voided')
  const totalCollected = validPayments.reduce((sum, p) => sum + p.amount, 0)

  // 3. Outstanding Balance (sum of remaining balances across all invoices)
  let outstandingBalance = 0
  let overdueAmount = 0

  invoices.forEach((inv) => {
    const summary = getInvoicePaymentSummary(inv, payments, systemDate)
    outstandingBalance += summary.remainingBalance
    if (summary.isOverdue) {
      overdueAmount += summary.remainingBalance
    }
  })

  // 5. Collections This Month (payments in current month: 2026-10)
  const currentMonthPrefix = systemDate.slice(0, 7) // '2026-10'
  const collectionsThisMonth = validPayments
    .filter((p) => p.paymentDate.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + p.amount, 0)

  return {
    totalInvoiced,
    totalCollected,
    outstandingBalance,
    overdueAmount,
    collectionsThisMonth,
  }
}

// Add New Collection Action
export function addCollectionPayment(
  data: Omit<PaymentRecord, 'id' | 'created_at' | 'status'> & { status?: PaymentStatus },
): PaymentRecord {
  const all = collectionsStore.get()
  const nextNum = all.length + 89
  const receiptNumber = data.receiptNumber || `REC-2026-${String(nextNum).padStart(3, '0')}`
  const id = `pay-${String(nextNum).padStart(3, '0')}`

  const newPayment: PaymentRecord = {
    ...data,
    id,
    receiptNumber,
    paymentMethod: 'Cash',
    status: data.status || 'Completed',
    created_at: new Date().toISOString(),
  }

  collectionsStore.update((list) => [newPayment, ...list])

  // Also update balances in invoicesStore for allocated invoices
  const updatedAll = [newPayment, ...all]
  data.allocations.forEach((alloc) => {
    const inv = invoicesStore.get().find(
      (i) => i.name.includes(alloc.invoiceNumber) || i.name === alloc.invoiceId || (i as any).invoiceNumber === alloc.invoiceNumber,
    )
    if (inv) {
      const colInv = toCollectionInvoice(inv)
      const summary = getInvoicePaymentSummary(colInv, updatedAll)
      updateInvoice(inv.name, {
        paidAmount: summary.paidAmount,
        remainingBalance: summary.remainingBalance,
        paymentStatus: summary.paymentStatus,
      })
    }
  })

  addAuditLog({
    action: 'Payment Collected',
    actor: data.receivedBy,
    time: 'Just now',
    details: `Recorded receipt ${receiptNumber} for ${data.customerName} (${data.amount.toLocaleString()} EGP in cash)`,
  })

  addNotification({
    title: 'Payment Collected',
    title_ar: 'تم تسجيل تحصيل نقدي',
    message: `Receipt ${receiptNumber} collected from ${data.customerName} (EGP ${data.amount.toLocaleString()})`,
    message_ar: `تم تسجيل إيصال ${receiptNumber} من ${data.customerName_ar || data.customerName} (${data.amount.toLocaleString()} ج.م نقداً)`,
    category: 'collections',
    priority: 'info',
    time: 'Just now',
    targetPage: 'Cash In',
    actionLabel: 'View Collections',
    actionLabel_ar: 'عرض التحصيلات',
  })

  return newPayment
}

// Void Payment Action
export function voidCollectionPayment(
  receiptNumber: string,
  reason: string,
  actor: string,
): boolean {
  let success = false
  let targetPayment: PaymentRecord | undefined

  collectionsStore.update((list) =>
    list.map((p) => {
      if (p.receiptNumber === receiptNumber || p.id === receiptNumber) {
        success = true
        targetPayment = p
        return {
          ...p,
          status: 'Voided',
          voidedAt: new Date().toISOString(),
          voidedBy: actor,
          voidReason: reason,
        }
      }
      return p
    }),
  )

  if (success) {
    if (targetPayment) {
      const updatedPayments = collectionsStore.get()
      targetPayment.allocations.forEach((alloc) => {
        const inv = invoicesStore.get().find(
          (i) => i.name.includes(alloc.invoiceNumber) || i.name === alloc.invoiceId || (i as any).invoiceNumber === alloc.invoiceNumber,
        )
        if (inv) {
          const colInv = toCollectionInvoice(inv)
          const summary = getInvoicePaymentSummary(colInv, updatedPayments)
          updateInvoice(inv.name, {
            paidAmount: summary.paidAmount,
            remainingBalance: summary.remainingBalance,
            paymentStatus: summary.paymentStatus,
          })
        }
      })
    }

    addAuditLog({
      action: 'Payment Voided',
      actor,
      time: 'Just now',
      details: `Voided receipt ${receiptNumber}. Reason: ${reason}`,
    })

    addNotification({
      title: 'Receipt Voided for Audit',
      title_ar: 'إلغاء إيصال تحصيل مسجل',
      message: `Receipt ${receiptNumber} was voided by ${actor}. Reason: ${reason}`,
      message_ar: `تم إلغاء الإيصال ${receiptNumber} بواسطة ${actor} بسبب: ${reason}`,
      category: 'collections',
      priority: 'warning',
      time: 'Just now',
      targetPage: 'Cash In',
      actionLabel: 'Audit Cash In',
      actionLabel_ar: 'تدقيق التحصيلات',
    })
  }

  return success
}
