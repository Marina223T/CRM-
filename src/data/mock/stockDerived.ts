import { createStore, useStore } from './store'
import { addAuditLog } from './audit'

export type MovementType =
  | 'receipt'
  | 'sell_in'
  | 'sell_out'
  | 'sample'
  | 'return'
  | 'adjustment'
  | 'transfer_rep'

export interface StockMovement {
  id: string
  order_id?: string
  product_id?: string
  productName: string
  batch_id?: string
  batchNumber?: string
  quantity: number // positive for flow, signed for adjustment
  type: MovementType
  date: string // YYYY-MM-DD
  customer_id?: string
  customerName?: string
  rep_id?: string
  repName?: string
  reason?: string
  notes?: string
  return_condition?: 'sellable' | 'damaged' | 'expired'
  updated_at?: string
}

export interface BatchRecord {
  id: string
  batch_no: string
  product_id?: string
  productName: string
  expiry_date: string // YYYY-MM-DD
  initial_qty: number
  updated_at?: string
}

// ── Seed Batches ─────────────────────────────────────────────────────────────
export const SEED_BATCHES: BatchRecord[] = [
  // Bevato
  { id: 'b-bv-01', batch_no: 'BV-2401', productName: 'Bevato', expiry_date: '2026-11-06', initial_qty: 3000 },
  { id: 'b-bv-02', batch_no: 'BV-2402', productName: 'Bevato', expiry_date: '2027-02-28', initial_qty: 6000 },
  { id: 'b-bv-03', batch_no: 'BV-2403', productName: 'Bevato', expiry_date: '2027-06-30', initial_qty: 8000 },

  // Naviro D3 50,000 IU
  { id: 'b-nv50-01', batch_no: 'NV-5001', productName: 'Naviro D3 50,000 IU', expiry_date: '2027-01-18', initial_qty: 5000 },
  { id: 'b-nv50-02', batch_no: 'NV-5002', productName: 'Naviro D3 50,000 IU', expiry_date: '2027-08-20', initial_qty: 7000 },

  // Naviro D3 10,000 IU
  { id: 'b-nv10-01', batch_no: 'NV-1001', productName: 'Naviro D3 10,000 IU', expiry_date: '2027-05-15', initial_qty: 6000 },
  { id: 'b-nv10-02', batch_no: 'NV-1002', productName: 'Naviro D3 10,000 IU', expiry_date: '2027-10-15', initial_qty: 5000 },

  // Naviro D3 Drops
  { id: 'b-nd-01', batch_no: 'ND-2401', productName: 'Naviro D3 Drops', expiry_date: '2026-10-10', initial_qty: 1500 }, // Expired
  { id: 'b-nd-02', batch_no: 'ND-2402', productName: 'Naviro D3 Drops', expiry_date: '2027-04-12', initial_qty: 8000 },

  // Navigen Product 5
  { id: 'b-np5-01', batch_no: 'NP-2401', productName: 'Navigen Product 5', expiry_date: '2027-09-30', initial_qty: 8000 },
]

// ── Seed Movements ───────────────────────────────────────────────────────────
export const SEED_MOVEMENTS: StockMovement[] = [
  // 1. Receipts into warehouse
  { id: 'sm-rec-01', productName: 'Bevato', batchNumber: 'BV-2401', quantity: 3000, type: 'receipt', date: '2026-08-01' },
  { id: 'sm-rec-02', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 6000, type: 'receipt', date: '2026-08-15' },
  { id: 'sm-rec-03', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 8000, type: 'receipt', date: '2026-09-01' },
  { id: 'sm-rec-04', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5001', quantity: 5000, type: 'receipt', date: '2026-08-05' },
  { id: 'sm-rec-05', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5002', quantity: 7000, type: 'receipt', date: '2026-09-10' },
  { id: 'sm-rec-06', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1001', quantity: 6000, type: 'receipt', date: '2026-08-20' },
  { id: 'sm-rec-07', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1002', quantity: 5000, type: 'receipt', date: '2026-09-25' },
  { id: 'sm-rec-08', productName: 'Naviro D3 Drops', batchNumber: 'ND-2401', quantity: 1500, type: 'receipt', date: '2026-06-01' },
  { id: 'sm-rec-09', productName: 'Naviro D3 Drops', batchNumber: 'ND-2402', quantity: 8000, type: 'receipt', date: '2026-09-01' },
  { id: 'sm-rec-10', productName: 'Navigen Product 5', batchNumber: 'NP-2401', quantity: 8000, type: 'receipt', date: '2026-09-05' },

  // 2. Sell-in (Warehouse to customers / pharmacies)
  { id: 'sm-si-01', productName: 'Bevato', batchNumber: 'BV-2401', quantity: 1920, type: 'sell_in', date: '2026-09-10', customer_id: 'c-2', customerName: 'Green Cross Pharmacy', rep_id: 'rep-maya', repName: 'Maya Patel' },
  { id: 'sm-si-02', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 4800, type: 'sell_in', date: '2026-09-15', customer_id: 'c-7', customerName: 'St. Jude Medical', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
  { id: 'sm-si-03', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 3120, type: 'sell_in', date: '2026-09-20', customer_id: 'c-4', customerName: 'Wellness First', rep_id: 'rep-maya', repName: 'Maya Patel' },
  { id: 'sm-si-04', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 3000, type: 'sell_in', date: '2026-10-02', customer_id: 'c-2', customerName: 'Green Cross Pharmacy', rep_id: 'rep-maya', repName: 'Maya Patel' },
  
  { id: 'sm-si-05', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5001', quantity: 4620, type: 'sell_in', date: '2026-09-12', customer_id: 'c-2', customerName: 'Green Cross Pharmacy', rep_id: 'rep-maya', repName: 'Maya Patel' },
  { id: 'sm-si-06', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5002', quantity: 4000, type: 'sell_in', date: '2026-09-28', customer_id: 'c-4', customerName: 'Wellness First', rep_id: 'rep-maya', repName: 'Maya Patel' },
  
  { id: 'sm-si-07', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1001', quantity: 4290, type: 'sell_in', date: '2026-09-14', customer_id: 'c-7', customerName: 'St. Jude Medical', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
  { id: 'sm-si-08', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1002', quantity: 3000, type: 'sell_in', date: '2026-10-05', customer_id: 'c-2', customerName: 'Green Cross Pharmacy', rep_id: 'rep-maya', repName: 'Maya Patel' },

  { id: 'sm-si-09', productName: 'Naviro D3 Drops', batchNumber: 'ND-2401', quantity: 1080, type: 'sell_in', date: '2026-08-10', customer_id: 'c-4', customerName: 'Wellness First', rep_id: 'rep-maya', repName: 'Maya Patel' },
  { id: 'sm-si-10', productName: 'Naviro D3 Drops', batchNumber: 'ND-2402', quantity: 4330, type: 'sell_in', date: '2026-09-22', customer_id: 'c-2', customerName: 'Green Cross Pharmacy', rep_id: 'rep-maya', repName: 'Maya Patel' },

  { id: 'sm-si-11', productName: 'Navigen Product 5', batchNumber: 'NP-2401', quantity: 4110, type: 'sell_in', date: '2026-09-18', customer_id: 'c-4', customerName: 'Wellness First', rep_id: 'rep-maya', repName: 'Maya Patel' },

  // 3. Sell-out (Pharmacies to patients)
  { id: 'sm-so-01', productName: 'Bevato', batchNumber: 'BV-2401', quantity: 1650, type: 'sell_out', date: '2026-09-25', customer_id: 'c-2', customerName: 'Green Cross Pharmacy' },
  { id: 'sm-so-02', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 4120, type: 'sell_out', date: '2026-10-01', customer_id: 'c-7', customerName: 'St. Jude Medical' },
  { id: 'sm-so-03', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 2680, type: 'sell_out', date: '2026-10-10', customer_id: 'c-4', customerName: 'Wellness First' },
  { id: 'sm-so-04', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 2730, type: 'sell_out', date: '2026-10-18', customer_id: 'c-2', customerName: 'Green Cross Pharmacy' },

  { id: 'sm-so-05', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5001', quantity: 3326, type: 'sell_out', date: '2026-09-25', customer_id: 'c-2', customerName: 'Green Cross Pharmacy' },
  { id: 'sm-so-06', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5002', quantity: 2880, type: 'sell_out', date: '2026-10-12', customer_id: 'c-4', customerName: 'Wellness First' },

  { id: 'sm-so-07', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1001', quantity: 2745, type: 'sell_out', date: '2026-09-30', customer_id: 'c-7', customerName: 'St. Jude Medical' },
  { id: 'sm-so-08', productName: 'Naviro D3 10,000 IU', batchNumber: 'NV-1002', quantity: 1920, type: 'sell_out', date: '2026-10-14', customer_id: 'c-2', customerName: 'Green Cross Pharmacy' },

  { id: 'sm-so-09', productName: 'Naviro D3 Drops', batchNumber: 'ND-2401', quantity: 518, type: 'sell_out', date: '2026-09-15', customer_id: 'c-4', customerName: 'Wellness First' },
  { id: 'sm-so-10', productName: 'Naviro D3 Drops', batchNumber: 'ND-2402', quantity: 2078, type: 'sell_out', date: '2026-10-15', customer_id: 'c-2', customerName: 'Green Cross Pharmacy' },

  { id: 'sm-so-11', productName: 'Navigen Product 5', batchNumber: 'NP-2401', quantity: 1602, type: 'sell_out', date: '2026-10-12', customer_id: 'c-4', customerName: 'Wellness First' },

  // 4. Transfers to Reps
  { id: 'sm-tr-01', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 620, type: 'transfer_rep', date: '2026-10-01', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
  { id: 'sm-tr-02', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 450, type: 'transfer_rep', date: '2026-10-02', rep_id: 'rep-olivia', repName: 'Olivia Martin' },
  { id: 'sm-tr-03', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 380, type: 'transfer_rep', date: '2026-10-03', rep_id: 'rep-maya', repName: 'Maya Patel' },
  { id: 'sm-tr-04', productName: 'Bevato', batchNumber: 'BV-2403', quantity: 210, type: 'transfer_rep', date: '2026-10-04', rep_id: 'rep-james', repName: 'James Wilson' },

  // 5. Samples given by reps during visits
  { id: 'sm-smp-01', productName: 'Bevato', batchNumber: 'BV-2401', quantity: 35, type: 'sample', date: '2026-10-18', customer_id: 'c-1', customerName: 'Dr. Sarah Kim', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
  { id: 'sm-smp-02', productName: 'Bevato', batchNumber: 'BV-2402', quantity: 20, type: 'sample', date: '2026-10-21', customer_id: 'c-7', customerName: 'St. Jude Medical Clinic', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
  { id: 'sm-smp-03', productName: 'Naviro D3 50,000 IU', batchNumber: 'NV-5001', quantity: 15, type: 'sample', date: '2026-10-22', customer_id: 'c-5', customerName: 'Dr. Emily Watson', rep_id: 'u-admin-1', repName: 'Alex Morgan' },
]

// ── Stores ───────────────────────────────────────────────────────────────────
export const batchesStore = createStore<BatchRecord[]>('batches_v2', SEED_BATCHES)
export const stockMovementsStore = createStore<StockMovement[]>('stock_movements_v2', SEED_MOVEMENTS)

const now = () => new Date().toISOString()

export function addBatch(data: Omit<BatchRecord, 'id' | 'updated_at'>) {
  const batch: BatchRecord = {
    ...data,
    id: `b-${Date.now()}`,
    updated_at: now(),
  }
  batchesStore.update((list) => [batch, ...list])
  return batch
}

export function getReturnCondition(
  movement: StockMovement,
  batchExpiryDate?: string,
): 'sellable' | 'damaged' | 'expired' {
  if (movement.return_condition) {
    return movement.return_condition
  }
  const reasonLower = `${movement.reason || ''} ${movement.notes || ''}`.toLowerCase()
  if (
    reasonLower.includes('damage') ||
    reasonLower.includes('defect') ||
    reasonLower.includes('broken') ||
    reasonLower.includes('tore') ||
    reasonLower.includes('compromised')
  ) {
    return 'damaged'
  }
  if (reasonLower.includes('expired')) {
    return 'expired'
  }
  if (batchExpiryDate && computeDaysToExpiry(batchExpiryDate) <= 0) {
    return 'expired'
  }
  return 'sellable'
}

export function addStockMovement(data: Omit<StockMovement, 'id' | 'updated_at' | 'date'> & { id?: string; date?: string }) {
  if (!Number.isFinite(data.quantity)) {
    throw new Error('Stock movement quantity must be a valid number.')
  }
  if (data.type !== 'adjustment' && (!Number.isInteger(data.quantity) || data.quantity <= 0)) {
    throw new Error('Stock movement quantity must be a positive integer.')
  }
  if (data.type === 'adjustment' && (!Number.isInteger(data.quantity) || data.quantity === 0)) {
    throw new Error('Stock adjustment quantity must be a non-zero integer.')
  }

  const at = now()
  const movement: StockMovement = {
    ...data,
    id: data.id ?? `SM-${Date.now()}`,
    date: data.date ?? at.split('T')[0],
    updated_at: at,
  }
  stockMovementsStore.update((list) => [movement, ...list])
  return movement
}

// ── Expiry calculations ──────────────────────────────────────────────────────
export type BatchExpiryStatus = 'expired' | 'critical' | 'warning' | 'healthy'

export function computeDaysToExpiry(expiryDateStr: string): number {
  if (!expiryDateStr) return 0
  const parts = expiryDateStr.split('-').map(Number)
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    const target = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0).getTime()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.round((target - today.getTime()) / (1000 * 60 * 60 * 24))
  }
  const target = new Date(expiryDateStr).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

export function getBatchStatus(days: number): {
  status: BatchExpiryStatus
  label: string
  color: 'grey' | 'rose' | 'amber' | 'green'
} {
  if (days <= 0) {
    return { status: 'expired', label: 'Expired', color: 'grey' }
  }
  if (days <= 90) {
    return { status: 'critical', label: `< 3 months (${days}d)`, color: 'rose' }
  }
  if (days <= 180) {
    const mo = Math.ceil(days / 30)
    return { status: 'warning', label: `3-6 months (${mo}mo)`, color: 'amber' }
  }
  const mo = Math.ceil(days / 30)
  return { status: 'healthy', label: `> 6 months (${mo}mo)`, color: 'green' }
}

// ── Derived Batch ────────────────────────────────────────────────────────────
export interface DerivedBatch {
  id: string
  batch_no: string
  productName: string
  expiry_date: string
  initial_qty: number
  qty_remaining: number
  days_to_expiry: number
  status: BatchExpiryStatus
  status_label: string
  status_color: 'grey' | 'rose' | 'amber' | 'green'
  is_fefo_first: boolean
  is_expired: boolean
}

export function deriveBatches(
  batches: BatchRecord[],
  movements: StockMovement[],
  productNameFilter?: string
): DerivedBatch[] {
  const filteredBatches = productNameFilter
    ? batches.filter((b) => b.productName.toLowerCase() === productNameFilter.toLowerCase())
    : batches

  const results: DerivedBatch[] = filteredBatches.map((b) => {
    // Receipts for this batch
    const receipts = movements
      .filter((m) => m.type === 'receipt' && (m.batchNumber === b.batch_no || m.batch_id === b.id))
      .reduce((sum, m) => sum + m.quantity, 0)

    const initial = receipts > 0 ? receipts : b.initial_qty

    // Deductions: sell_in, direct warehouse samples (without rep), transfer_rep
    // Rep samples are fulfilled out of the rep's buffer (transfers_rep) so they
    // must NOT be deducted twice from warehouse batch balances.
    const deductions = movements
      .filter(
        (m) =>
          (m.type === 'sell_in' ||
            (m.type === 'sample' && !m.repName && !m.rep_id) ||
            m.type === 'transfer_rep') &&
          (m.batchNumber === b.batch_no || m.batch_id === b.id)
      )
      .reduce((sum, m) => sum + m.quantity, 0)

    // Adjustments for this batch
    const adjustments = movements
      .filter((m) => m.type === 'adjustment' && (m.batchNumber === b.batch_no || m.batch_id === b.id))
      .reduce((sum, m) => sum + m.quantity, 0)

    // Sellable returns: damaged and expired returned products do not return to sellable inventory
    const sellableReturns = movements
      .filter(
        (m) =>
          m.type === 'return' &&
          getReturnCondition(m, b.expiry_date) === 'sellable' &&
          (m.batchNumber === b.batch_no || m.batch_id === b.id)
      )
      .reduce((sum, m) => sum + m.quantity, 0)

    const remaining = Math.max(0, initial - deductions + adjustments + sellableReturns)
    const days = computeDaysToExpiry(b.expiry_date)
    const statusInfo = getBatchStatus(days)

    return {
      id: b.id,
      batch_no: b.batch_no,
      productName: b.productName,
      expiry_date: b.expiry_date,
      initial_qty: initial,
      qty_remaining: remaining,
      days_to_expiry: days,
      status: statusInfo.status,
      status_label: statusInfo.label,
      status_color: statusInfo.color,
      is_fefo_first: false,
      is_expired: days <= 0,
    }
  })

  // Sort by earliest expiry (FEFO)
  results.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime())

  // Mark "Sell this batch first" on earliest non-expired batch with remaining > 0
  const firstEligible = results.find((b) => !b.is_expired && b.qty_remaining > 0)
  if (firstEligible) {
    firstEligible.is_fefo_first = true
  }

  return results
}

// ── FEFO Allocation (shared by order approval & warehouse fulfillment) ─────────
export interface FefoAllocation {
  productName: string
  batchId: string
  batchNumber: string
  quantity: number
}

// Greedily allocates `quantity` of a product across its non-expired batches,
// earliest expiry first. Throws when the quantity cannot be covered, so
// callers never persist movements for an unallocatable amount.
export function allocateFefo(
  productName: string,
  quantity: number,
  batches: BatchRecord[],
  movements: StockMovement[],
): FefoAllocation[] {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Invalid quantity for ${productName}.`)
  }

  const allocations: FefoAllocation[] = []
  let needed = quantity

  const availableBatches = deriveBatches(batches, movements, productName)
    .filter((b) => !b.is_expired && b.qty_remaining > 0)

  for (const batch of availableBatches) {
    const take = Math.min(needed, batch.qty_remaining)
    if (take <= 0) continue

    allocations.push({
      productName,
      batchId: batch.id,
      batchNumber: batch.batch_no,
      quantity: take,
    })

    needed -= take
    if (needed === 0) break
  }

  if (needed > 0) {
    throw new Error(`Insufficient unexpired stock for ${productName}.`)
  }

  return allocations
}

// ── Rep Sample Custody & Allocation ──────────────────────────────────────────
export interface RepSampleBatch {
  productName: string
  batchId: string
  batchNumber: string
  expiryDate: string
  isExpired: boolean
  remainingQty: number
}

export function getRepSampleBatches(
  repName: string,
  productName: string,
  batches: BatchRecord[],
  movements: StockMovement[]
): RepSampleBatch[] {
  const normRep = repName.trim().toLowerCase()
  const normProd = productName.trim().toLowerCase()

  const repTransfers = movements.filter(
    (m) =>
      m.type === 'transfer_rep' &&
      m.repName?.trim().toLowerCase() === normRep &&
      m.productName.trim().toLowerCase() === normProd
  )

  const repSamples = movements.filter(
    (m) =>
      m.type === 'sample' &&
      m.repName?.trim().toLowerCase() === normRep &&
      m.productName.trim().toLowerCase() === normProd
  )

  const transferredByBatch = new Map<string, number>()
  for (const t of repTransfers) {
    const key = t.batchNumber || t.batch_id || 'UNKNOWN'
    transferredByBatch.set(key, (transferredByBatch.get(key) ?? 0) + t.quantity)
  }

  const sampledByBatch = new Map<string, number>()
  for (const s of repSamples) {
    const key = s.batchNumber || s.batch_id || 'UNKNOWN'
    sampledByBatch.set(key, (sampledByBatch.get(key) ?? 0) + s.quantity)
  }

  const list: RepSampleBatch[] = []
  for (const [batchNo, transferred] of transferredByBatch.entries()) {
    const sampled = sampledByBatch.get(batchNo) ?? 0
    const remaining = Math.max(0, transferred - sampled)
    if (remaining <= 0) continue

    const batchRecord = batches.find(
      (b) => b.batch_no === batchNo && b.productName.trim().toLowerCase() === normProd
    )
    const expiryDate = batchRecord?.expiry_date || '2099-12-31'
    const days = computeDaysToExpiry(expiryDate)

    list.push({
      productName,
      batchId: batchRecord?.id || batchNo,
      batchNumber: batchNo,
      expiryDate,
      isExpired: days <= 0,
      remainingQty: remaining,
    })
  }

  list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
  return list
}

export function getRepAvailableSampleStock(
  repName: string,
  productName: string,
  batches: BatchRecord[],
  movements: StockMovement[]
): number {
  const sampleBatches = getRepSampleBatches(repName, productName, batches, movements)
  return sampleBatches
    .filter((b) => !b.isExpired)
    .reduce((sum, b) => sum + b.remainingQty, 0)
}

export function allocateRepSampleFefo(
  repName: string,
  productName: string,
  quantity: number,
  batches: BatchRecord[],
  movements: StockMovement[]
): FefoAllocation[] {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Invalid sample quantity for ${productName}.`)
  }

  const sampleBatches = getRepSampleBatches(repName, productName, batches, movements)
    .filter((b) => !b.isExpired && b.remainingQty > 0)

  const allocations: FefoAllocation[] = []
  let needed = quantity

  for (const b of sampleBatches) {
    const take = Math.min(needed, b.remainingQty)
    if (take <= 0) continue

    allocations.push({
      productName,
      batchId: b.batchId,
      batchNumber: b.batchNumber,
      quantity: take,
    })

    needed -= take
    if (needed === 0) break
  }

  if (needed > 0) {
    throw new Error(`Insufficient sample stock for representative ${repName} (${productName}).`)
  }

  return allocations
}

// ── Derived Product Metrics ──────────────────────────────────────────────────
export interface DerivedProductStock {
  name: string
  received: number
  sell_in: number
  sell_out: number
  in_warehouse: number
  in_market: number // sell_in - sell_out - returns
  samples: number
  returns: number
  sellable_returns: number
  damaged_returns: number
  expired_returns: number
  adjustments: number
  transfers_rep: number
  sell_through_pct: number
  available_qty: number // warehouse qty excluding expired
  expired_qty: number // expired qty in warehouse
  expiring_90d_qty: number // qty expiring within 90 days
  nearest_expiry_date: string | null
  batches: DerivedBatch[]
}

export function deriveProductStock(
  productName: string,
  movements: StockMovement[],
  batches: BatchRecord[],
  role: 'admin' | 'rep' = 'admin',
  currentUserName: string = 'Alex Morgan'
): DerivedProductStock {
  const pMovements = movements.filter(
    (m) => m.productName.toLowerCase() === productName.toLowerCase()
  )

  const received = pMovements
    .filter((m) => m.type === 'receipt')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Sell-in (warehouse to customer)
  const sell_in = pMovements
    .filter((m) => m.type === 'sell_in')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Sell-out (customer to patient)
  const sell_out = pMovements
    .filter((m) => m.type === 'sell_out')
    .reduce((sum, m) => sum + m.quantity, 0)

  // All samples (rep and direct)
  const samples = pMovements
    .filter((m) => m.type === 'sample')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Direct warehouse samples (not dispatched via a rep)
  const direct_samples = pMovements
    .filter((m) => m.type === 'sample' && !m.repName && !m.rep_id)
    .reduce((sum, m) => sum + m.quantity, 0)

  // Total returns
  const returns = pMovements
    .filter((m) => m.type === 'return')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Sellable returns (returned in good condition, unexpired)
  const sellable_returns = pMovements
    .filter((m) => m.type === 'return' && getReturnCondition(m) === 'sellable')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Damaged returned products
  const damaged_returns = pMovements
    .filter((m) => m.type === 'return' && getReturnCondition(m) === 'damaged')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Expired returned products
  const expired_returns = pMovements
    .filter((m) => m.type === 'return' && getReturnCondition(m) === 'expired')
    .reduce((sum, m) => sum + m.quantity, 0)

  const adjustments = pMovements
    .filter((m) => m.type === 'adjustment')
    .reduce((sum, m) => sum + m.quantity, 0)

  const transfers_rep = pMovements
    .filter((m) => m.type === 'transfer_rep')
    .reduce((sum, m) => sum + m.quantity, 0)

  // Derived batches for this product (uses the same sellable returns and un-duplicated deductions)
  const derivedB = deriveBatches(batches, movements, productName)

  // In warehouse now: total remaining quantity across all warehouse batches
  // Formula: received - sell_in - direct_samples + sellable_returns + adjustments - transfers_rep
  const in_warehouse = derivedB.reduce((sum, b) => sum + b.qty_remaining, 0)

  // In market: sell_in minus sell_out minus returns
  const in_market = Math.max(0, sell_in - sell_out - returns)

  // Sell-through %: ratio of products dispensed to patients over sell-in
  const sell_through_pct = sell_in > 0 ? Math.round((sell_out / sell_in) * 100) : 0

  const available_qty = derivedB
    .filter((b) => !b.is_expired)
    .reduce((sum, b) => sum + b.qty_remaining, 0)

  const expired_qty = derivedB
    .filter((b) => b.is_expired)
    .reduce((sum, b) => sum + b.qty_remaining, 0)

  const expiring_90d_qty = derivedB
    .filter((b) => !b.is_expired && b.days_to_expiry <= 90)
    .reduce((sum, b) => sum + b.qty_remaining, 0)

  const firstValidBatch = derivedB.find((b) => !b.is_expired && b.qty_remaining > 0)
  const nearest_expiry_date = firstValidBatch ? firstValidBatch.expiry_date : null

  // If role === 'rep', custody is transfers_rep minus samples given by this rep
  if (role === 'rep') {
    const repAvailableSamples = getRepAvailableSampleStock(
      currentUserName,
      productName,
      batches,
      movements
    )

    const repTransfers = pMovements
      .filter(
        (m) =>
          m.type === 'transfer_rep' &&
          m.repName?.toLowerCase() === currentUserName.toLowerCase()
      )
      .reduce((sum, m) => sum + m.quantity, 0)

    const repSamples = pMovements
      .filter(
        (m) =>
          m.type === 'sample' &&
          m.repName?.toLowerCase() === currentUserName.toLowerCase()
      )
      .reduce((sum, m) => sum + m.quantity, 0)

    const repCustody = Math.max(0, repTransfers - repSamples)

    return {
      name: productName,
      received: repTransfers,
      sell_in,
      sell_out,
      in_warehouse: repCustody,
      in_market,
      samples: repSamples,
      returns: 0,
      sellable_returns: 0,
      damaged_returns: 0,
      expired_returns: 0,
      adjustments: 0,
      transfers_rep: repTransfers,
      sell_through_pct,
      available_qty: repAvailableSamples,
      expired_qty: 0,
      expiring_90d_qty,
      nearest_expiry_date,
      batches: derivedB,
    }
  }

  return {
    name: productName,
    received,
    sell_in,
    sell_out,
    in_warehouse,
    in_market,
    samples,
    returns,
    sellable_returns,
    damaged_returns,
    expired_returns,
    adjustments,
    transfers_rep,
    sell_through_pct,
    available_qty,
    expired_qty,
    expiring_90d_qty,
    nearest_expiry_date,
    batches: derivedB,
  }
}

// ── Overall helpers for Home & Reports ───────────────────────────────────────
export function getAllDerivedBatches(movements: StockMovement[], batches: BatchRecord[]): DerivedBatch[] {
  return deriveBatches(batches, movements)
}

export function getBatchesNearExpiry(movements: StockMovement[], batches: BatchRecord[], daysThreshold = 90): DerivedBatch[] {
  const all = deriveBatches(batches, movements)
  return all.filter((b) => !b.is_expired && b.days_to_expiry <= daysThreshold && b.qty_remaining > 0)
}

export function getExpiredBatches(movements: StockMovement[], batches: BatchRecord[]): DerivedBatch[] {
  const all = deriveBatches(batches, movements)
  return all.filter((b) => b.is_expired && b.qty_remaining > 0)
}
