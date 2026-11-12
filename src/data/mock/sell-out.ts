import { createStore } from './store'
import { addAuditLog } from './audit'
import { addStockMovement } from './stockDerived'

// Legacy single-item interface preserved for backward compatibility
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

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: Warehouse-Level Sell-Out Reporting Models
// ─────────────────────────────────────────────────────────────────────────────

export interface SellOutReportItem {
  productName: string
  productName_ar?: string
  quantity: number // boxes sold
}

export interface WarehouseSellOutReport {
  id: string
  reportingMonth: string // e.g. "2026-10"
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  warehouseName_ar?: string
  area: string // e.g. "Gharbia", "Cairo", "Alexandria", "Giza", "Assiut", "Ismailia"
  area_ar?: string
  governorate: string
  governorate_ar?: string
  repId: string
  repName: string
  repName_ar?: string
  items: SellOutReportItem[]
  notes?: string
  submissionDate: string // YYYY-MM-DD
  updatedAt?: string
}

export const SEED_WAREHOUSE_SELL_OUT: WarehouseSellOutReport[] = [
  // ── October 2026 (Current Period: 5 of 6 Reported) ───────────────────────
  {
    id: 'so-rep-202610-dta',
    reportingMonth: '2026-10',
    warehouseId: 'wh-dta-01',
    warehouseCode: 'WH-DTA-01',
    warehouseName: 'Delta Regional Facility (Tanta)',
    warehouseName_ar: 'مستودع الدلتا الإقليمي (طنطا)',
    area: 'Gharbia',
    area_ar: 'الغربية',
    governorate: 'Gharbia Governorate',
    governorate_ar: 'محافظة الغربية',
    repId: 'rep-olivia',
    repName: 'Olivia Martin',
    repName_ar: 'أوليفيا مارتن',
    submissionDate: '2026-10-29',
    notes: 'Verified via monthly physical audit in Tanta. Strong prescription demand for Bevato and pediatric drops.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 580 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 490 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 430 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 390 },
    ],
  },
  {
    id: 'so-rep-202610-cai',
    reportingMonth: '2026-10',
    warehouseId: 'wh-cai-01',
    warehouseCode: 'WH-CAI-01',
    warehouseName: 'Cairo Central Logistics Hub',
    warehouseName_ar: 'مستودع القاهرة المركزي اللوجستي',
    area: 'Cairo',
    area_ar: 'القاهرة',
    governorate: 'Cairo Governorate',
    governorate_ar: 'محافظة القاهرة',
    repId: 'rep-james',
    repName: 'James Wilson',
    repName_ar: 'جيمس ويلسون',
    submissionDate: '2026-10-30',
    notes: 'Badr City Hub sell-out consolidated across Greater Cairo hospitals and retail pharmacy networks.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 1420 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 980 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 750 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 620 },
    ],
  },
  {
    id: 'so-rep-202610-alx',
    reportingMonth: '2026-10',
    warehouseId: 'wh-alx-01',
    warehouseCode: 'WH-ALX-01',
    warehouseName: 'Alexandria Mediterranean Hub',
    warehouseName_ar: 'مستودع الإسكندرية والساحل',
    area: 'Alexandria',
    area_ar: 'الإسكندرية',
    governorate: 'Alexandria Governorate',
    governorate_ar: 'محافظة الإسكندرية',
    repId: 'u-rep-1',
    repName: 'Ahmed Samir',
    repName_ar: 'أحمد سمير',
    submissionDate: '2026-10-27',
    notes: 'Borg El Arab Hub report. Consistent cold-chain movement.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 850 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 640 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 520 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 410 },
    ],
  },
  {
    id: 'so-rep-202610-gz',
    reportingMonth: '2026-10',
    warehouseId: 'wh-gz-01',
    warehouseCode: 'WH-GZ-01',
    warehouseName: 'Giza Western Depot',
    warehouseName_ar: 'مستودع الجيزة والقطاع الغربي',
    area: 'Giza',
    area_ar: 'الجيزة',
    governorate: 'Giza Governorate',
    governorate_ar: 'محافظة الجيزة',
    repId: 'u-rep-2',
    repName: 'Sara Ali',
    repName_ar: 'سارة علي',
    submissionDate: '2026-10-28',
    notes: '6th of October Depot sell-out report. Healthy distribution pace.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 760 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 610 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 680 },
    ],
  },
  {
    id: 'so-rep-202610-asu',
    reportingMonth: '2026-10',
    warehouseId: 'wh-asu-01',
    warehouseCode: 'WH-ASU-01',
    warehouseName: 'Upper Egypt Fulfillment Hub (Assiut)',
    warehouseName_ar: 'مستودع صعيد مصر (أسيوط)',
    area: 'Assiut',
    area_ar: 'أسيوط',
    governorate: 'Assiut Governorate',
    governorate_ar: 'محافظة أسيوط',
    repId: 'rep-james',
    repName: 'James Wilson',
    repName_ar: 'جيمس ويلسون',
    submissionDate: '2026-10-29',
    notes: 'Assiut and Upper Egypt regional distribution report.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 340 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 310 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 220 },
    ],
  },

  // ── September 2026 (Historical Period: 6 of 6 Reported - 100%) ───────────
  {
    id: 'so-rep-202609-dta',
    reportingMonth: '2026-09',
    warehouseId: 'wh-dta-01',
    warehouseCode: 'WH-DTA-01',
    warehouseName: 'Delta Regional Facility (Tanta)',
    warehouseName_ar: 'مستودع الدلتا الإقليمي (طنطا)',
    area: 'Gharbia',
    area_ar: 'الغربية',
    governorate: 'Gharbia Governorate',
    governorate_ar: 'محافظة الغربية',
    repId: 'rep-olivia',
    repName: 'Olivia Martin',
    repName_ar: 'أوليفيا مارتن',
    submissionDate: '2026-09-29',
    notes: 'September warehouse visit report completed.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 510 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 440 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 380 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 350 },
    ],
  },
  {
    id: 'so-rep-202609-cai',
    reportingMonth: '2026-09',
    warehouseId: 'wh-cai-01',
    warehouseCode: 'WH-CAI-01',
    warehouseName: 'Cairo Central Logistics Hub',
    warehouseName_ar: 'مستودع القاهرة المركزي اللوجستي',
    area: 'Cairo',
    area_ar: 'القاهرة',
    governorate: 'Cairo Governorate',
    governorate_ar: 'محافظة القاهرة',
    repId: 'rep-james',
    repName: 'James Wilson',
    repName_ar: 'جيمس ويلسون',
    submissionDate: '2026-09-30',
    notes: 'September Badr City hub record.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 1350 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 920 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 710 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 590 },
    ],
  },
  {
    id: 'so-rep-202609-alx',
    reportingMonth: '2026-09',
    warehouseId: 'wh-alx-01',
    warehouseCode: 'WH-ALX-01',
    warehouseName: 'Alexandria Mediterranean Hub',
    warehouseName_ar: 'مستودع الإسكندرية والساحل',
    area: 'Alexandria',
    area_ar: 'الإسكندرية',
    governorate: 'Alexandria Governorate',
    governorate_ar: 'محافظة الإسكندرية',
    repId: 'u-rep-1',
    repName: 'Ahmed Samir',
    repName_ar: 'أحمد سمير',
    submissionDate: '2026-09-28',
    notes: 'September Borg El Arab record.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 810 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 600 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 480 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 390 },
    ],
  },
  {
    id: 'so-rep-202609-gz',
    reportingMonth: '2026-09',
    warehouseId: 'wh-gz-01',
    warehouseCode: 'WH-GZ-01',
    warehouseName: 'Giza Western Depot',
    warehouseName_ar: 'مستودع الجيزة والقطاع الغربي',
    area: 'Giza',
    area_ar: 'الجيزة',
    governorate: 'Giza Governorate',
    governorate_ar: 'محافظة الجيزة',
    repId: 'u-rep-2',
    repName: 'Sara Ali',
    repName_ar: 'سارة علي',
    submissionDate: '2026-09-29',
    notes: 'September Giza depot record.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 720 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 580 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 630 },
    ],
  },
  {
    id: 'so-rep-202609-asu',
    reportingMonth: '2026-09',
    warehouseId: 'wh-asu-01',
    warehouseCode: 'WH-ASU-01',
    warehouseName: 'Upper Egypt Fulfillment Hub (Assiut)',
    warehouseName_ar: 'مستودع صعيد مصر (أسيوط)',
    area: 'Assiut',
    area_ar: 'أسيوط',
    governorate: 'Assiut Governorate',
    governorate_ar: 'محافظة أسيوط',
    repId: 'rep-james',
    repName: 'James Wilson',
    repName_ar: 'جيمس ويلسون',
    submissionDate: '2026-09-27',
    notes: 'September Assiut report.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 310 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 290 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 200 },
    ],
  },
  {
    id: 'so-rep-202609-ism',
    reportingMonth: '2026-09',
    warehouseId: 'wh-ism-01',
    warehouseCode: 'WH-ISM-01',
    warehouseName: 'Canal Zone & East Hub (Ismailia)',
    warehouseName_ar: 'مستودع القناة والشرقية (الإسماعيلية)',
    area: 'Ismailia',
    area_ar: 'الإسماعيلية',
    governorate: 'Ismailia Governorate',
    governorate_ar: 'محافظة الإسماعيلية',
    repId: 'rep-sofia',
    repName: 'Sofia Chen',
    repName_ar: 'صوفيا تشين',
    submissionDate: '2026-09-28',
    notes: 'September Ismailia Free Zone warehouse sell-out report.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 290 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 260 },
      { productName: 'Navigen Product 5', productName_ar: 'نافيجين منتج 5', quantity: 240 },
    ],
  },

  // ── August 2026 (Historical Period) ──────────────────────────────────────
  {
    id: 'so-rep-202608-dta',
    reportingMonth: '2026-08',
    warehouseId: 'wh-dta-01',
    warehouseCode: 'WH-DTA-01',
    warehouseName: 'Delta Regional Facility (Tanta)',
    warehouseName_ar: 'مستودع الدلتا الإقليمي (طنطا)',
    area: 'Gharbia',
    area_ar: 'الغربية',
    governorate: 'Gharbia Governorate',
    governorate_ar: 'محافظة الغربية',
    repId: 'rep-olivia',
    repName: 'Olivia Martin',
    repName_ar: 'أوليفيا مارتن',
    submissionDate: '2026-08-30',
    notes: 'August report for Delta region.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 480 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 410 },
      { productName: 'Naviro D3 Drops', productName_ar: 'نافيرو د3 نقط', quantity: 350 },
    ],
  },
  {
    id: 'so-rep-202608-cai',
    reportingMonth: '2026-08',
    warehouseId: 'wh-cai-01',
    warehouseCode: 'WH-CAI-01',
    warehouseName: 'Cairo Central Logistics Hub',
    warehouseName_ar: 'مستودع القاهرة المركزي اللوجستي',
    area: 'Cairo',
    area_ar: 'القاهرة',
    governorate: 'Cairo Governorate',
    governorate_ar: 'محافظة القاهرة',
    repId: 'rep-james',
    repName: 'James Wilson',
    repName_ar: 'جيمس ويلسون',
    submissionDate: '2026-08-31',
    notes: 'August Cairo Central report.',
    items: [
      { productName: 'Bevato', productName_ar: 'بيفاتو', quantity: 1280 },
      { productName: 'Naviro D3 50,000 IU', productName_ar: 'نافيرو د3 50,000', quantity: 880 },
      { productName: 'Naviro D3 10,000 IU', productName_ar: 'نافيرو د3 10,000', quantity: 680 },
    ],
  },
]

export const warehouseSellOutStore = createStore<WarehouseSellOutReport[]>(
  'warehouse_sell_out_reports',
  SEED_WAREHOUSE_SELL_OUT
)

const now = () => new Date().toISOString()

export interface AddOrUpdateReportInput {
  id?: string
  reportingMonth: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  warehouseName_ar?: string
  area: string
  area_ar?: string
  governorate: string
  governorate_ar?: string
  repId: string
  repName: string
  repName_ar?: string
  items: SellOutReportItem[]
  notes?: string
}

/**
 * Creates or updates a warehouse sell-out report.
 * Merges products for the same warehouse + reportingMonth to prevent duplicate reports.
 */
export function addOrUpdateWarehouseSellOutReport(
  input: AddOrUpdateReportInput,
  actor: string = 'Alex Morgan'
): WarehouseSellOutReport {
  // Validation
  if (!input.reportingMonth.trim()) {
    throw new Error('Reporting month is required.')
  }
  if (!input.warehouseId.trim()) {
    throw new Error('Warehouse is required.')
  }
  if (!input.items || input.items.length === 0) {
    throw new Error('At least one product item is required.')
  }
  for (const item of input.items) {
    if (!item.productName.trim()) {
      throw new Error('Product name is required for all line items.')
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error('Quantity sold must be greater than zero.')
    }
  }

  const reports = warehouseSellOutStore.get()
  const today = now().split('T')[0]

  // Check if an existing report matches either by ID or by (warehouseId + reportingMonth)
  const existing = input.id
    ? reports.find((r) => r.id === input.id)
    : reports.find(
        (r) => r.warehouseId === input.warehouseId && r.reportingMonth === input.reportingMonth
      )

  if (existing) {
    // Update existing report cleanly
    const updated: WarehouseSellOutReport = {
      ...existing,
      ...input,
      id: existing.id,
      submissionDate: existing.submissionDate || today,
      updatedAt: now(),
    }

    warehouseSellOutStore.update((list) =>
      list.map((r) => (r.id === existing.id ? updated : r))
    )

    addAuditLog({
      action: 'Warehouse Sell-out Updated',
      actor,
      time: 'Just now',
      details: `Updated sell-out report for ${updated.warehouseName} (${updated.reportingMonth}) with ${updated.items.length} products by ${actor}`,
    })

    return updated
  } else {
    // Create new report
    const newReport: WarehouseSellOutReport = {
      ...input,
      id: input.id || `so-rep-${Date.now()}`,
      submissionDate: today,
      updatedAt: now(),
    }

    warehouseSellOutStore.update((list) => [newReport, ...list])

    addAuditLog({
      action: 'Warehouse Sell-out Recorded',
      actor,
      time: 'Just now',
      details: `Recorded sell-out report for ${newReport.warehouseName} (${newReport.reportingMonth}) with ${newReport.items.length} products by ${actor}`,
    })

    return newReport
  }
}

export function deleteWarehouseSellOutReport(id: string, actor: string = 'Alex Morgan') {
  const target = warehouseSellOutStore.get().find((r) => r.id === id)
  warehouseSellOutStore.update((list) => list.filter((r) => r.id !== id))

  if (target) {
    addAuditLog({
      action: 'Warehouse Sell-out Deleted',
      actor,
      time: 'Just now',
      details: `Deleted sell-out report for ${target.warehouseName} (${target.reportingMonth}) by ${actor}`,
    })
  }
}
