import { createStore } from './store'
import { addAuditLog } from './audit'

export interface VisitPlanStop {
  id: string
  clientName: string
  clientId?: string
  address: string
  priority: string
  purpose: string
  plannedTime: string
  plannedDate?: string // YYYY-MM-DD
}

export type VisitPlanStatus = 'Draft' | 'Active' | 'Completed' | 'Suspended'
export type VisitFrequency = 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly'

export interface VisitPlan {
  id: string
  name: string
  repName: string
  repId?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  frequency: VisitFrequency
  targetClients: string[]
  plannedProducts: string[]
  status: VisitPlanStatus
  stops: VisitPlanStop[]
  notes?: string
  updated_at?: string
}

const SEED_VISIT_PLANS: VisitPlan[] = [
  {
    id: 'VP-2401',
    name: 'North Territory Cardiology & Hospital Campaign',
    repName: 'Alex Morgan',
    repId: 'u-admin-1',
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    frequency: 'Weekly',
    targetClients: ['Dr. Sarah Kim', 'Dr. Marcus Lee', 'Nile Hospital'],
    plannedProducts: ['Bevato', 'Naviro D3 50,000 IU'],
    status: 'Active',
    notes: 'Q4 focus on hospital formulary inclusion and clinical presentation of Bevato.',
    stops: [
      {
        id: 'stop-1',
        clientName: 'Dr. Sarah Kim',
        clientId: 'c-1',
        address: 'North Medical Center, Suite 402',
        priority: 'Class A',
        purpose: 'Bevato clinical review & sample delivery',
        plannedTime: '09:00 AM',
        plannedDate: '2026-11-04',
      },
      {
        id: 'stop-2',
        clientName: 'Nile Hospital',
        clientId: 'c-7',
        address: '88 Nile Corniche, North District',
        priority: 'Class A',
        purpose: 'Pharmacy committee formulary review',
        plannedTime: '11:30 AM',
        plannedDate: '2026-11-04',
      },
      {
        id: 'stop-3',
        clientName: 'Dr. Marcus Lee',
        clientId: 'c-3',
        address: 'City Cardiology Associates',
        priority: 'Class B',
        purpose: 'Follow up on reconnect notice & dosage guidelines',
        plannedTime: '02:00 PM',
        plannedDate: '2026-11-05',
      },
    ],
  },
  {
    id: 'VP-2402',
    name: 'West Region Pharmacy Restock & Consignment Audit',
    repName: 'Maya Patel',
    repId: 'rep-maya',
    startDate: '2026-10-15',
    endDate: '2026-12-15',
    frequency: 'Bi-weekly',
    targetClients: ['Green Cross Pharmacy', 'Wellness First', 'Pharm. Tarek Youssef'],
    plannedProducts: ['Naviro D3 Drops', 'Bevato'],
    status: 'Active',
    notes: 'Ensure pharmacy shelf availability and audit batch expiries.',
    stops: [
      {
        id: 'stop-4',
        clientName: 'Green Cross Pharmacy',
        clientId: 'c-2',
        address: '44 El Tahrir St, West District',
        priority: 'Class A',
        purpose: 'Restock validation & stock movement check',
        plannedTime: '10:00 AM',
        plannedDate: '2026-11-06',
      },
      {
        id: 'stop-5',
        clientName: 'Wellness First',
        clientId: 'c-4',
        address: '20 Corniche Road, West District',
        priority: 'Class B',
        purpose: 'Consignment inventory reconciliation',
        plannedTime: '01:30 PM',
        plannedDate: '2026-11-06',
      },
    ],
  },
  {
    id: 'VP-2403',
    name: 'Central Pediatrics & Clinic Onboarding Plan',
    repName: 'Alex Morgan',
    repId: 'u-admin-1',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    frequency: 'Monthly',
    targetClients: ['Dr. Emily Watson', 'Nasr City Pediatric Clinic', 'Dr. Amina Khalil'],
    plannedProducts: ['Naviro D3 Drops', 'Naviro D3 10,000 IU'],
    status: 'Draft',
    notes: 'Pediatric expansion plan and introduction of vitamin drops.',
    stops: [
      {
        id: 'stop-6',
        clientName: 'Nasr City Pediatric Clinic',
        clientId: 'c-10',
        address: '15 Nasr City Blvd, Central District',
        priority: 'Class A',
        purpose: 'Initial introduction and sample trial drop-off',
        plannedTime: '11:00 AM',
        plannedDate: '2026-11-10',
      },
    ],
  },
]

export const visitPlansStore = createStore<VisitPlan[]>('visit_plans_v1', SEED_VISIT_PLANS)

const now = () => new Date().toISOString()

export function addVisitPlan(data: Omit<VisitPlan, 'id' | 'updated_at'> & { id?: string }): VisitPlan {
  const plan: VisitPlan = {
    ...data,
    id: data.id ?? `VP-${Date.now().toString().slice(-4)}`,
    updated_at: now(),
  }
  visitPlansStore.update((list) => [plan, ...list])
  addAuditLog({
    action: 'Visit Plan Created',
    actor: plan.repName || 'User',
    time: 'Just now',
    details: `Created visit plan: ${plan.name} (${plan.status})`,
  })
  return plan
}

export function updateVisitPlan(id: string, patch: Partial<VisitPlan>, actor: string = 'User'): VisitPlan {
  const at = now()
  let updatedPlan: VisitPlan | undefined

  visitPlansStore.update((list) =>
    list.map((p) => {
      if (p.id === id) {
        updatedPlan = { ...p, ...patch, updated_at: at }
        return updatedPlan
      }
      return p
    })
  )

  if (!updatedPlan) {
    throw new Error(`Visit plan ${id} not found.`)
  }

  addAuditLog({
    action: 'Visit Plan Updated',
    actor,
    time: 'Just now',
    details: `Updated visit plan: ${updatedPlan.name} (${updatedPlan.status})`,
  })

  return updatedPlan
}

export function deleteVisitPlan(id: string, actor: string = 'User') {
  const plan = visitPlansStore.get().find((p) => p.id === id)
  visitPlansStore.update((list) => list.filter((p) => p.id !== id))
  if (plan) {
    addAuditLog({
      action: 'Visit Plan Deleted',
      actor,
      time: 'Just now',
      details: `Deleted visit plan: ${plan.name}`,
    })
  }
}
