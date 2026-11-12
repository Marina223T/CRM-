import { createStore } from './store'
import { addAuditLog } from './audit'

export interface WarehouseBatchStock {
  batchNumber: string
  quantity: number
  expiryDate: string
  status: 'Healthy' | 'Low stock' | 'Expiring soon' | 'Expired'
}

export interface WarehouseProductStock {
  productName: string
  productName_ar?: string
  category: string
  quantity: number
  minThreshold: number
  batches: WarehouseBatchStock[]
  status: 'Healthy' | 'Low stock' | 'Critical' | 'Overstocked'
}

export interface Warehouse {
  id: string
  code: string
  name: string
  name_ar: string
  area: string
  area_ar: string
  governorate: string
  governorate_ar: string
  assignedRepName: string
  assignedRepName_ar?: string
  assignedRepId?: string
  status: 'Active' | 'Near Capacity' | 'Maintenance' | 'Inactive'
  capacityUnits: number
  currentStockUnits: number
  temperatureType: 'Ambient (15-25°C)' | 'Cold Chain (2-8°C)' | 'Dual Zone'
  address: string
  address_ar: string
  phone: string
  email: string
  products: WarehouseProductStock[]
  lastAuditDate: string
  updated_at?: string
}

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-cai-01',
    code: 'WH-CAI-01',
    name: 'Cairo Central Logistics Hub',
    name_ar: 'مستودع القاهرة المركزي اللوجستي',
    area: 'Cairo',
    area_ar: 'القاهرة',
    governorate: 'Cairo Governorate',
    governorate_ar: 'محافظة القاهرة',
    assignedRepName: 'James Wilson',
    assignedRepName_ar: 'جيمس ويلسون',
    assignedRepId: 'rep-james',
    status: 'Active',
    capacityUnits: 16000,
    currentStockUnits: 11480,
    temperatureType: 'Dual Zone',
    address: 'Zone 4, Badr Industrial City, Cairo',
    address_ar: 'المنطقة الصناعية الرابعة، مدينة بدر، القاهرة',
    phone: '+20 2 2849 5500',
    email: 'wh-cairo@navigenpharma.net',
    lastAuditDate: '2026-10-28',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 4200,
        minThreshold: 1000,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2402', quantity: 2400, expiryDate: '2027-02-28', status: 'Healthy' },
          { batchNumber: 'BV-2403', quantity: 1800, expiryDate: '2027-06-30', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 50,000 IU',
        productName_ar: 'نافيرو د3 50,000',
        category: 'Vitamin D Supplement',
        quantity: 3100,
        minThreshold: 800,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-5001', quantity: 1200, expiryDate: '2027-01-18', status: 'Healthy' },
          { batchNumber: 'NV-5002', quantity: 1900, expiryDate: '2027-08-20', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 10,000 IU',
        productName_ar: 'نافيرو د3 10,000',
        category: 'Vitamin D Supplement',
        quantity: 2280,
        minThreshold: 600,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-1001', quantity: 1000, expiryDate: '2027-05-15', status: 'Healthy' },
          { batchNumber: 'NV-1002', quantity: 1280, expiryDate: '2027-10-15', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 Drops',
        productName_ar: 'نافيرو د3 نقط',
        category: 'Pediatrics',
        quantity: 1900,
        minThreshold: 500,
        status: 'Healthy',
        batches: [
          { batchNumber: 'ND-2402', quantity: 1900, expiryDate: '2027-04-12', status: 'Healthy' },
        ],
      },
    ],
  },
  {
    id: 'wh-alx-01',
    code: 'WH-ALX-01',
    name: 'Alexandria Mediterranean Hub',
    name_ar: 'مستودع الإسكندرية والساحل',
    area: 'Alexandria',
    area_ar: 'الإسكندرية',
    governorate: 'Alexandria Governorate',
    governorate_ar: 'محافظة الإسكندرية',
    assignedRepName: 'Ahmed Samir',
    assignedRepName_ar: 'أحمد سمير',
    assignedRepId: 'u-rep-1',
    status: 'Active',
    capacityUnits: 10000,
    currentStockUnits: 6850,
    temperatureType: 'Cold Chain (2-8°C)',
    address: 'Borg El Arab Logistics City, Alexandria',
    address_ar: 'المنطقة اللوجستية، برج العرب الجديدة، الإسكندرية',
    phone: '+20 3 459 2210',
    email: 'wh-alex@navigenpharma.net',
    lastAuditDate: '2026-10-15',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 1850,
        minThreshold: 500,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2402', quantity: 850, expiryDate: '2027-02-28', status: 'Healthy' },
          { batchNumber: 'BV-2403', quantity: 1000, expiryDate: '2027-06-30', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 50,000 IU',
        productName_ar: 'نافيرو د3 50,000',
        category: 'Vitamin D Supplement',
        quantity: 2100,
        minThreshold: 600,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-5002', quantity: 2100, expiryDate: '2027-08-20', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 Drops',
        productName_ar: 'نافيرو د3 نقط',
        category: 'Pediatrics',
        quantity: 1500,
        minThreshold: 400,
        status: 'Healthy',
        batches: [
          { batchNumber: 'ND-2402', quantity: 1500, expiryDate: '2027-04-12', status: 'Healthy' },
        ],
      },
      {
        productName: 'Navigen Product 5',
        productName_ar: 'نافيجين منتج 5',
        category: 'General Health',
        quantity: 1400,
        minThreshold: 400,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NP-2401', quantity: 1400, expiryDate: '2027-09-30', status: 'Healthy' },
        ],
      },
    ],
  },
  {
    id: 'wh-gz-01',
    code: 'WH-GZ-01',
    name: 'Giza Western Depot',
    name_ar: 'مستودع الجيزة والقطاع الغربي',
    area: 'Giza',
    area_ar: 'الجيزة',
    governorate: 'Giza Governorate',
    governorate_ar: 'محافظة الجيزة',
    assignedRepName: 'Sara Ali',
    assignedRepName_ar: 'سارة علي',
    assignedRepId: 'u-rep-2',
    status: 'Active',
    capacityUnits: 8500,
    currentStockUnits: 5420,
    temperatureType: 'Ambient (15-25°C)',
    address: '6th of October Industrial Complex, Block 12, Giza',
    address_ar: 'المجمع الصناعي بالسادس من أكتوبر، القطعة 12، الجيزة',
    phone: '+20 2 3833 7741',
    email: 'wh-giza@navigenpharma.net',
    lastAuditDate: '2026-10-20',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 1620,
        minThreshold: 600,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2401', quantity: 420, expiryDate: '2026-11-06', status: 'Low stock' },
          { batchNumber: 'BV-2403', quantity: 1200, expiryDate: '2027-06-30', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 10,000 IU',
        productName_ar: 'نافيرو د3 10,000',
        category: 'Vitamin D Supplement',
        quantity: 1800,
        minThreshold: 500,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-1002', quantity: 1800, expiryDate: '2027-10-15', status: 'Healthy' },
        ],
      },
      {
        productName: 'Navigen Product 5',
        productName_ar: 'نافيجين منتج 5',
        category: 'General Health',
        quantity: 2000,
        minThreshold: 500,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NP-2401', quantity: 2000, expiryDate: '2027-09-30', status: 'Healthy' },
        ],
      },
    ],
  },
  {
    id: 'wh-dta-01',
    code: 'WH-DTA-01',
    name: 'Delta Regional Facility (Tanta)',
    name_ar: 'مستودع الدلتا الإقليمي (طنطا)',
    area: 'Tanta',
    area_ar: 'طنطا',
    governorate: 'Gharbia Governorate',
    governorate_ar: 'محافظة الغربية',
    assignedRepName: 'Olivia Martin',
    assignedRepName_ar: 'أوليفيا مارتن',
    assignedRepId: 'rep-olivia',
    status: 'Near Capacity',
    capacityUnits: 6000,
    currentStockUnits: 5580,
    temperatureType: 'Dual Zone',
    address: 'El Geish Street Logistics Center, Tanta',
    address_ar: 'المركز اللوجستي بشارع الجيش، طنطا، الغربية',
    phone: '+20 40 331 8890',
    email: 'wh-delta@navigenpharma.net',
    lastAuditDate: '2026-11-02',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 1450,
        minThreshold: 400,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2402', quantity: 1450, expiryDate: '2027-02-28', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 50,000 IU',
        productName_ar: 'نافيرو د3 50,000',
        category: 'Vitamin D Supplement',
        quantity: 1650,
        minThreshold: 400,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-5001', quantity: 650, expiryDate: '2027-01-18', status: 'Healthy' },
          { batchNumber: 'NV-5002', quantity: 1000, expiryDate: '2027-08-20', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 Drops',
        productName_ar: 'نافيرو د3 نقط',
        category: 'Pediatrics',
        quantity: 1280,
        minThreshold: 300,
        status: 'Healthy',
        batches: [
          { batchNumber: 'ND-2402', quantity: 1280, expiryDate: '2027-04-12', status: 'Healthy' },
        ],
      },
      {
        productName: 'Navigen Product 5',
        productName_ar: 'نافيجين منتج 5',
        category: 'General Health',
        quantity: 1200,
        minThreshold: 300,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NP-2401', quantity: 1200, expiryDate: '2027-09-30', status: 'Healthy' },
        ],
      },
    ],
  },
  {
    id: 'wh-asu-01',
    code: 'WH-ASU-01',
    name: 'Upper Egypt Fulfillment Hub (Assiut)',
    name_ar: 'مستودع صعيد مصر (أسيوط)',
    area: 'Assiut',
    area_ar: 'أسيوط',
    governorate: 'Assiut Governorate',
    governorate_ar: 'محافظة أسيوط',
    assignedRepName: 'James Wilson',
    assignedRepName_ar: 'جيمس ويلسون',
    assignedRepId: 'rep-james',
    status: 'Active',
    capacityUnits: 5000,
    currentStockUnits: 2940,
    temperatureType: 'Ambient (15-25°C)',
    address: 'Arab El Awamer Industrial Area, Assiut',
    address_ar: 'منطقة عرب العوامر الصناعية، أسيوط',
    phone: '+20 88 238 4100',
    email: 'wh-assiut@navigenpharma.net',
    lastAuditDate: '2026-10-18',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 720,
        minThreshold: 300,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2403', quantity: 720, expiryDate: '2027-06-30', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 50,000 IU',
        productName_ar: 'نافيرو د3 50,000',
        category: 'Vitamin D Supplement',
        quantity: 820,
        minThreshold: 300,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-5001', quantity: 820, expiryDate: '2027-01-18', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 10,000 IU',
        productName_ar: 'نافيرو د3 10,000',
        category: 'Vitamin D Supplement',
        quantity: 600,
        minThreshold: 300,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-1001', quantity: 600, expiryDate: '2027-05-15', status: 'Healthy' },
        ],
      },
      {
        productName: 'Navigen Product 5',
        productName_ar: 'نافيجين منتج 5',
        category: 'General Health',
        quantity: 800,
        minThreshold: 250,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NP-2401', quantity: 800, expiryDate: '2027-09-30', status: 'Healthy' },
        ],
      },
    ],
  },
  {
    id: 'wh-ism-01',
    code: 'WH-ISM-01',
    name: 'Canal Zone & East Hub (Ismailia)',
    name_ar: 'مستودع القناة والشرقية (الإسماعيلية)',
    area: 'Ismailia',
    area_ar: 'الإسماعيلية',
    governorate: 'Ismailia Governorate',
    governorate_ar: 'محافظة الإسماعيلية',
    assignedRepName: 'Sofia Chen',
    assignedRepName_ar: 'صوفيا تشين',
    assignedRepId: 'rep-sofia',
    status: 'Active',
    capacityUnits: 4000,
    currentStockUnits: 2150,
    temperatureType: 'Ambient (15-25°C)',
    address: 'Free Zone Commercial Complex, Ismailia',
    address_ar: 'المجمع التجاري بالمنطقة الحرة، الإسماعيلية',
    phone: '+20 64 391 6620',
    email: 'wh-canal@navigenpharma.net',
    lastAuditDate: '2026-10-24',
    products: [
      {
        productName: 'Bevato',
        productName_ar: 'بيفاتو',
        category: 'Cardiovascular',
        quantity: 650,
        minThreshold: 200,
        status: 'Healthy',
        batches: [
          { batchNumber: 'BV-2402', quantity: 650, expiryDate: '2027-02-28', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 50,000 IU',
        productName_ar: 'نافيرو د3 50,000',
        category: 'Vitamin D Supplement',
        quantity: 500,
        minThreshold: 200,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NV-5002', quantity: 500, expiryDate: '2027-08-20', status: 'Healthy' },
        ],
      },
      {
        productName: 'Naviro D3 Drops',
        productName_ar: 'نافيرو د3 نقط',
        category: 'Pediatrics',
        quantity: 500,
        minThreshold: 150,
        status: 'Healthy',
        batches: [
          { batchNumber: 'ND-2402', quantity: 500, expiryDate: '2027-04-12', status: 'Healthy' },
        ],
      },
      {
        productName: 'Navigen Product 5',
        productName_ar: 'نافيجين منتج 5',
        category: 'General Health',
        quantity: 500,
        minThreshold: 150,
        status: 'Healthy',
        batches: [
          { batchNumber: 'NP-2401', quantity: 500, expiryDate: '2027-09-30', status: 'Healthy' },
        ],
      },
    ],
  },
]

export const warehousesStore = createStore<Warehouse[]>('warehouses', INITIAL_WAREHOUSES)

const now = () => new Date().toISOString()

export function addWarehouse(
  warehouse: Omit<Warehouse, 'id' | 'updated_at'> & { id?: string },
  actor: string = 'Alex Morgan'
): Warehouse {
  const updatedAt = now()
  const newWarehouse: Warehouse = {
    ...warehouse,
    id: warehouse.id || `wh-${Date.now()}`,
    updated_at: updatedAt,
  }

  warehousesStore.update((list) => [newWarehouse, ...list])

  addAuditLog({
    action: 'Warehouse Added',
    actor,
    time: 'Just now',
    details: `Added warehouse ${newWarehouse.name} (${newWarehouse.code}) by ${actor}`,
  })

  return newWarehouse
}

export function updateWarehouse(
  id: string,
  patch: Partial<Warehouse>,
  actor: string = 'Alex Morgan'
): Warehouse | undefined {
  const updatedAt = now()
  let updatedItem: Warehouse | undefined

  warehousesStore.update((list) =>
    list.map((w) => {
      if (w.id === id) {
        updatedItem = { ...w, ...patch, updated_at: updatedAt }
        return updatedItem
      }
      return w
    })
  )

  if (updatedItem) {
    addAuditLog({
      action: 'Warehouse Updated',
      actor,
      time: 'Just now',
      details: `Updated warehouse ${updatedItem.name} (${updatedItem.code}) by ${actor}`,
    })
  }

  return updatedItem
}

export function deleteWarehouse(id: string, actor: string = 'Alex Morgan') {
  const target = warehousesStore.get().find((w) => w.id === id)
  warehousesStore.update((list) => list.filter((w) => w.id !== id))

  if (target) {
    addAuditLog({
      action: 'Warehouse Deleted',
      actor,
      time: 'Just now',
      details: `Deleted warehouse ${target.name} (${target.code}) by ${actor}`,
    })
  }
}
