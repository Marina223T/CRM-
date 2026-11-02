import { invoicesMockData, type InvoiceRecord } from '@/ui/pages/invoices/mock-data'
import { addAuditLog } from './audit'
import { createStore } from './store'

export type ApprovalHistoryEntry = {
  action: 'Approved' | 'Rejected' | 'Resubmitted'
  actor: string
  timestamp: string
  reason?: string
}

export type StoredInvoice = InvoiceRecord & {
  updated_at?: string
  // Sales order that produced this invoice (optional: legacy demo
  // invoices were uploaded independently and have no origin order).
  order_id?: string
  rejection_reason?: string
  approval_history?: ApprovalHistoryEntry[]
}

export const invoicesStore = createStore<StoredInvoice[]>('invoices', invoicesMockData as StoredInvoice[])

const now = () => new Date().toISOString()

// Continues the INV-#### numbering found in existing records.
export function generateInvoiceName(customerName: string): string {
  const max = invoicesStore.get().reduce((latest, invoice) => {
    const match = invoice.name.match(/INV-(\d+)/)
    return match ? Math.max(latest, Number(match[1])) : latest
  }, 1040)
  return `INV-${max + 1} · ${customerName}`
}

export function addInvoice(data: Omit<StoredInvoice, 'updated_at'>) {
  const invoice: StoredInvoice = { ...data, updated_at: now() }
  invoicesStore.update((list) => [invoice, ...list])
  addAuditLog({
    action: 'Invoice Added',
    actor: invoice.repName || 'User',
    time: 'Just now',
    details: `Added ${invoice.name}`,
  })
  return invoice
}

export function updateInvoice(name: string, patch: Partial<StoredInvoice>) {
  invoicesStore.update((list) =>
    list.map((inv) => (inv.name === name ? { ...inv, ...patch, updated_at: now() } : inv)),
  )
}
