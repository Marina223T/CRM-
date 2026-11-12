import { visitsMockData, type VisitRecord } from '@/ui/pages/visits/mock-data'
import { addAuditLog } from './audit'
import { createStore } from './store'

export type StoredVisit = VisitRecord & { updated_at?: string; doctorId?: string }

export const visitsStore = createStore<StoredVisit[]>('visits', visitsMockData as StoredVisit[])

const now = () => new Date().toISOString()

export function addVisit(data: Omit<StoredVisit, 'updated_at' | 'id'> & { id?: string }) {
  const visit: StoredVisit = {
    ...data,
    id: data.id ?? `V-${Date.now()}`,
    updated_at: now(),
  }
  visitsStore.update((list) => [visit, ...list])
  addAuditLog({
    action: 'Visit Added',
    actor: visit.repName || 'User',
    time: 'Just now',
    details: `Visit ${visit.id} with ${visit.clientName}`,
  })
  return visit
}

export const ALLOWED_VISIT_STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Planned', 'Cancelled'],
  Planned: ['In Progress', 'Completed', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [], // Final status
  Cancelled: [], // Final status
}

export function updateVisit(id: string, patch: Partial<StoredVisit>) {
  visitsStore.update((list) =>
    list.map((v) => (v.id === id ? { ...v, ...patch, updated_at: now() } : v)),
  )
}

export function updateVisitStatus(id: string, newStatus: string, actor: string) {
  const visit = visitsStore.get().find((v) => v.id === id)
  if (!visit) {
    throw new Error(`Visit ${id} not found.`)
  }
  const current = visit.status
  const allowed = ALLOWED_VISIT_STATUS_TRANSITIONS[current] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid visit status transition from ${current} to ${newStatus}.`)
  }
  updateVisit(id, { status: newStatus })
  addAuditLog({
    action: 'Visit Status Updated',
    actor,
    time: 'Just now',
    details: `Visit ${id} status changed from ${current} to ${newStatus}`,
  })
}
