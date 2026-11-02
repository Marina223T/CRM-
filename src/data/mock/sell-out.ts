import { createStore } from './store'
import { addAuditLog } from './audit'
import { addStockMovement } from './stockDerived'

export interface SellOutRecord {
  id: string
  productName: string
  batchNumber: string
  quantity: number
  date: string // YYYY-MM-DD
  customerId: string
  customerName: string
  repId: string
  repName: string
  notes?: string
}

const SEED_SELL_OUT: SellOutRecord[] = [
  {
    id: 'SO-DEMO-001',
    productName: 'Bevato',
    batchNumber: 'BV-2401',
    quantity: 1650,
    date: '2026-09-25',
    customerId: 'c-2',
    customerName: 'Green Cross Pharmacy',
    repId: 'rep-maya',
    repName: 'Maya Patel',
  },
  {
    id: 'SO-DEMO-002',
    productName: 'Bevato',
    batchNumber: 'BV-2402',
    quantity: 4120,
    date: '2026-10-01',
    customerId: 'c-7',
    customerName: 'St. Jude Medical',
    repId: 'u-admin-1',
    repName: 'Alex Morgan',
  },
  {
    id: 'SO-DEMO-003',
    productName: 'Naviro D3 50,000 IU',
    batchNumber: 'NV-5001',
    quantity: 3326,
    date: '2026-09-25',
    customerId: 'c-2',
    customerName: 'Green Cross Pharmacy',
    repId: 'rep-maya',
    repName: 'Maya Patel',
  },
  {
    id: 'SO-DEMO-004',
    productName: 'Naviro D3 10,000 IU',
    batchNumber: 'NV-1001',
    quantity: 2745,
    date: '2026-09-30',
    customerId: 'c-7',
    customerName: 'St. Jude Medical',
    repId: 'u-admin-1',
    repName: 'Alex Morgan',
  },
  {
    id: 'SO-DEMO-005',
    productName: 'Bevato',
    batchNumber: 'BV-2402',
    quantity: 2680,
    date: '2026-10-10',
    customerId: 'c-4',
    customerName: 'Wellness First',
    repId: 'rep-maya',
    repName: 'Maya Patel',
  },
]

export const sellOutStore = createStore<SellOutRecord[]>('sell_out_records', SEED_SELL_OUT)

export interface AddSellOutInput {
  productName: string
  batchNumber: string
  quantity: number
  date: string
  customerId: string
  customerName: string
  repId: string
  repName: string
  notes?: string
}

export function addSellOutRecord(input: AddSellOutInput): SellOutRecord {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Quantity must be greater than zero.')
  }
  if (!input.productName.trim()) {
    throw new Error('Product name is required.')
  }
  if (!input.customerName.trim()) {
    throw new Error('Customer is required.')
  }

  const record: SellOutRecord = {
    id: `SO-${Date.now()}`,
    productName: input.productName,
    batchNumber: input.batchNumber,
    quantity: input.quantity,
    date: input.date,
    customerId: input.customerId,
    customerName: input.customerName,
    repId: input.repId,
    repName: input.repName,
    notes: input.notes,
  }

  sellOutStore.update((list) => [record, ...list])

  // Record stock movement (sell_out is pharmacy→patient; does NOT deduct warehouse stock)
  addStockMovement({
    productName: input.productName,
    batchNumber: input.batchNumber,
    quantity: input.quantity,
    type: 'sell_out',
    date: input.date,
    customer_id: input.customerId,
    customerName: input.customerName,
    rep_id: input.repId,
    repName: input.repName,
    notes: input.notes,
  })

  addAuditLog({
    action: 'Sell-Out Recorded',
    actor: input.repName,
    time: 'Just now',
    details: `Recorded sell-out of ${input.quantity} units of ${input.productName} from ${input.customerName}`,
  })

  return record
}
