
import { createStore } from './store'
import { customersStore } from './customers'
import { productsStore } from './products'
import { addAuditLog } from './audit'
import { addInvoice, generateInvoiceName, invoicesStore } from './invoices'
import {
  batchesStore,
  stockMovementsStore,
  addStockMovement,
  allocateFefo,
} from './stockDerived'

export type SalesOrderStatus = 'Pending' | 'Approved' | 'Rejected'

export type SalesOrderDiscountType = 'percentage' | 'fixed'

export interface SalesOrderItem {
  productCode: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface SalesOrder {
  id: string
  customerId: string
  customerName: string
  repId: string
  repName: string
  items: SalesOrderItem[]
  subtotal: number
  // Discount fields are optional so orders created before discounts existed
  // stay valid — treat a missing discount as zero (see discountAmountOf).
  discountType?: SalesOrderDiscountType
  // percentage: 0-100 · fixed: absolute EGP amount
  discountValue?: number
  // Resolved EGP amount actually deducted from the subtotal.
  discountAmount?: number
  total: number
  status: SalesOrderStatus
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}

export function discountAmountOf(order: Pick<SalesOrder, 'subtotal' | 'discountType' | 'discountValue'>): number {
  if (!order.discountType || order.discountValue === undefined) return 0
  if (order.discountType === 'percentage') {
    return Math.round(order.subtotal * (Math.min(Math.max(order.discountValue, 0), 100) / 100) * 100) / 100
  }
  return Math.round(Math.min(Math.max(order.discountValue, 0), order.subtotal) * 100) / 100
}

export const salesOrdersStore = createStore<SalesOrder[]>(
  'sales_orders',
  [],
)

type CreateSalesOrderInput = {
  customerId: string
  repId: string
  repName: string
  items: {
    productCode: string
    quantity: number
  }[]
  discount?: {
    type: SalesOrderDiscountType
    value: number
  }
}

export function addSalesOrder(input: CreateSalesOrderInput) {
  const customer = customersStore.get().find(
    (item) => item.id === input.customerId,
  )

  if (!customer || customer.deleted_at || customer.active === false) {
    throw new Error('Customer is unavailable.')
  }

  if (!input.repId.trim() || !input.repName.trim()) {
    throw new Error('Select a sales representative.')
  }

  if (!input.items.length) {
    throw new Error('Add at least one product.')
  }

  const items: SalesOrderItem[] = input.items.map((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('Product quantity must be a positive integer.')
    }

    const product = productsStore.get().find(
      (product) => product.code === item.productCode,
    )

    if (!product) {
      throw new Error(`Product ${item.productCode} was not found.`)
    }

    const unitPrice = Number(product.price)

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error(`Invalid price for ${product.name}.`)
    }

    return {
      productCode: product.code,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
      total: item.quantity * unitPrice,
    }
  })

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const now = new Date().toISOString()

  // Optional discount: validated against the subtotal so an order can never
  // total below zero. Zero-value discounts are stored as "no discount".
  let discountType: SalesOrderDiscountType | undefined
  let discountValue: number | undefined
  let discountAmount = 0

  if (input.discount) {
    const { type, value } = input.discount
    if (type !== 'percentage' && type !== 'fixed') {
      throw new Error('Invalid discount type.')
    }
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('Discount must be zero or positive.')
    }
    if (type === 'percentage' && value > 100) {
      throw new Error('Percentage discount must be between 0 and 100.')
    }
    if (type === 'fixed' && value > subtotal) {
      throw new Error('Fixed discount cannot exceed the order subtotal.')
    }
    if (value > 0) {
      discountType = type
      discountValue = value
      discountAmount =
        type === 'percentage'
          ? Math.round(subtotal * (value / 100) * 100) / 100
          : Math.round(value * 100) / 100
    }
  }

  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const order: SalesOrder = {
    id: `SO-${Date.now()}`,
    customerId: customer.id!,
    customerName: customer.name,
    repId: input.repId,
    repName: input.repName,
    items,
    subtotal,
    ...(discountType
      ? { discountType, discountValue, discountAmount }
      : {}),
    total,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  }

  salesOrdersStore.update((orders) => [order, ...orders])

  addAuditLog({
    action: 'Sales Order Created',
    actor: input.repName,
    time: 'Just now',
    details: `Created ${order.id} for ${customer.name}. Total: ${order.total}`,
  })

  return order
}

export function approveSalesOrder(orderId: string, actor: string) {
  const order = salesOrdersStore.get().find((item) => item.id === orderId)

  if (!order) {
    throw new Error('Sales order was not found.')
  }

  // Prevent duplicate stock deductions when an approval action is repeated
  if (order.status === 'Approved') {
    return orderId
  }

  if (order.status !== 'Pending') {
    throw new Error('Only pending orders can be approved.')
  }

  const batches = batchesStore.get()
  const movements = stockMovementsStore.get()

  // Consolidate required quantity per product line
  const requiredQtyByProduct = new Map<string, number>()
  for (const item of order.items) {
    requiredQtyByProduct.set(
      item.productName,
      (requiredQtyByProduct.get(item.productName) ?? 0) + item.quantity,
    )
  }

  // Check already deducted quantities for this specific order
  const alreadyDeductedByProduct = new Map<string, number>()
  for (const movement of movements) {
    if (movement.order_id === orderId && movement.type === 'sell_in') {
      alreadyDeductedByProduct.set(
        movement.productName,
        (alreadyDeductedByProduct.get(movement.productName) ?? 0) + movement.quantity,
      )
    }
  }

  // Compute remaining needed quantities per product.
  // Partial movements cannot cause an order to be treated as fully processed:
  // any unfulfilled line item must be allocated and moved.
  const neededByProduct = new Map<string, number>()
  for (const [productName, reqQty] of requiredQtyByProduct.entries()) {
    const alreadyDeducted = alreadyDeductedByProduct.get(productName) ?? 0
    const needed = Math.max(0, reqQty - alreadyDeducted)
    if (needed > 0) {
      neededByProduct.set(productName, needed)
    }
  }

  // If any quantity remains to be deducted, allocate FEFO across unexpired batches.
  // If any product lacks unexpired batch stock, allocateFefo throws and approval aborts.
  if (neededByProduct.size > 0) {
    const allocations = [...neededByProduct.entries()].flatMap(
      ([productName, quantity]) => allocateFefo(productName, quantity, batches, movements),
    )

    for (const allocation of allocations) {
      addStockMovement({
        order_id: orderId,
        productName: allocation.productName,
        batch_id: allocation.batchId,
        batchNumber: allocation.batchNumber,
        quantity: allocation.quantity,
        type: 'sell_in',
        date: new Date().toISOString().slice(0, 10),
        customer_id: order.customerId,
        customerName: order.customerName,
        rep_id: order.repId,
        repName: order.repName,
        reason: 'Approved sales order',
        notes: `Sales order ${orderId}`,
      })
    }
  }

  // One invoice per order; created after stock is secured so a failure
  // above never leaves an invoice without its movements.
  const existingInvoice = invoicesStore.get().find(
    (invoice) => invoice.order_id === orderId,
  )
  if (!existingInvoice) {
    addInvoice({
      name: generateInvoiceName(order.customerName),
      meta: `${order.items.length} items · EGP ${order.total.toLocaleString('en-US')}`,
      meta_ar: `${order.items.length} أصناف · ${order.total.toLocaleString('en-US')} ج.م`,
      status: 'Pending',
      source: 'Sales order',
      dateRange: 'Today',
      repName: order.repName,
      order_id: orderId,
    })
  }

  const updatedAt = new Date().toISOString()

  salesOrdersStore.update((orders) =>
    orders.map((item) =>
      item.id === orderId
        ? { ...item, status: 'Approved', updatedAt }
        : item,
    ),
  )

  addAuditLog({
    action: 'Sales Order Approved',
    actor,
    time: 'Just now',
    details: `Approved ${orderId} for ${order.customerName}`,
  })

  return orderId
}

export function rejectSalesOrder(
  orderId: string,
  reason: string,
  actor: string,
) {
  const order = salesOrdersStore.get().find((item) => item.id === orderId)

  if (!order) {
    throw new Error('Sales order was not found.')
  }

  if (order.status !== 'Pending') {
    throw new Error('Only pending orders can be rejected.')
  }

  if (!reason.trim()) {
    throw new Error('A rejection reason is required.')
  }

  const updatedAt = new Date().toISOString()

  salesOrdersStore.update((orders) =>
    orders.map((item) =>
      item.id === orderId
        ? {
            ...item,
            status: 'Rejected',
            rejectionReason: reason.trim(),
            updatedAt,
          }
        : item,
    ),
  )

  addAuditLog({
    action: 'Sales Order Rejected',
    actor,
    time: 'Just now',
    details: `Rejected ${orderId}: ${reason.trim()}`,
  })

  return orderId
}
