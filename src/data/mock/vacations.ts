import { createStore } from './store'
import { addAuditLog } from './audit'
import { visitsStore, updateVisit, type StoredVisit } from './visits'

export type VacationType = 'Annual' | 'Sick' | 'Emergency' | 'Unpaid' | 'Training'
export type VacationStatus = 'Pending' | 'Approved' | 'Rejected'

export interface VacationRequest {
  id: string
  employeeName: string
  employeeId: string
  employeeRole?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  vacationType: VacationType
  reason: string
  status: VacationStatus
  rejectionReason?: string
  created_at: string
  updated_at?: string
}

const SEED_VACATIONS: VacationRequest[] = [
  {
    id: 'VAC-201',
    employeeName: 'Maya Patel',
    employeeId: 'rep-maya',
    employeeRole: 'rep',
    startDate: '2026-11-20',
    endDate: '2026-11-25',
    vacationType: 'Annual',
    reason: 'Family holiday travel',
    status: 'Approved',
    created_at: '2026-10-15T09:00:00.000Z',
    updated_at: '2026-10-16T11:00:00.000Z',
  },
  {
    id: 'VAC-202',
    employeeName: 'James Wilson',
    employeeId: 'rep-james',
    employeeRole: 'rep',
    startDate: '2026-11-08',
    endDate: '2026-11-10',
    vacationType: 'Emergency',
    reason: 'Family emergency care',
    status: 'Pending',
    created_at: '2026-10-28T14:30:00.000Z',
  },
  {
    id: 'VAC-203',
    employeeName: 'Olivia Martin',
    employeeId: 'rep-olivia',
    employeeRole: 'rep',
    startDate: '2026-10-01',
    endDate: '2026-10-03',
    vacationType: 'Sick',
    reason: 'Medical recovery',
    status: 'Approved',
    created_at: '2026-09-30T08:00:00.000Z',
    updated_at: '2026-09-30T10:00:00.000Z',
  },
]

export const vacationsStore = createStore<VacationRequest[]>('vacations_v1', SEED_VACATIONS)

const now = () => new Date().toISOString()

// Helper: Checks if two date ranges [s1, e1] and [s2, e2] overlap
export function isDateRangeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 <= end2 && end1 >= start2
}

// Rule D1: Prevent overlapping approved vacations for the same employee
export function hasOverlappingApprovedVacation(
  employeeName: string,
  startDate: string,
  endDate: string,
  excludeVacationId?: string
): VacationRequest | undefined {
  const normName = employeeName.trim().toLowerCase()
  return vacationsStore
    .get()
    .find(
      (v) =>
        v.id !== excludeVacationId &&
        v.employeeName.trim().toLowerCase() === normName &&
        v.status === 'Approved' &&
        isDateRangeOverlap(startDate, endDate, v.startDate, v.endDate)
    )
}

// Helper: Parse visit date format into YYYY-MM-DD
function normalizeVisitDate(dateStr: string): string {
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return dateStr
}

// Rule D2: Find scheduled visits during vacation dates
export function getAffectedVisitsForVacation(
  employeeName: string,
  startDate: string,
  endDate: string
): StoredVisit[] {
  const normName = employeeName.trim().toLowerCase()
  return visitsStore.get().filter((v) => {
    if (!v.repName || v.repName.trim().toLowerCase() !== normName) return false
    // Only pending/scheduled/planned/in-progress visits are affected (not completed or cancelled)
    if (v.status === 'Completed' || v.status === 'Cancelled') return false
    const vDate = normalizeVisitDate(v.date)
    return vDate >= startDate && vDate <= endDate
  })
}

export interface AddVacationInput {
  employeeName: string
  employeeId: string
  employeeRole?: string
  startDate: string
  endDate: string
  vacationType: VacationType
  reason: string
}

export function addVacationRequest(input: AddVacationInput): { vacation: VacationRequest; warning?: string } {
  if (!input.startDate || !input.endDate) {
    throw new Error('Start date and end date are required.')
  }
  if (input.startDate > input.endDate) {
    throw new Error('Start date cannot be after end date.')
  }

  // Check for overlapping approved vacations
  const overlap = hasOverlappingApprovedVacation(input.employeeName, input.startDate, input.endDate)
  if (overlap) {
    throw new Error(
      `An approved vacation already exists for ${input.employeeName} from ${overlap.startDate} to ${overlap.endDate}.`
    )
  }

  const vacation: VacationRequest = {
    id: `VAC-${Date.now().toString().slice(-4)}`,
    employeeName: input.employeeName,
    employeeId: input.employeeId,
    employeeRole: input.employeeRole || 'rep',
    startDate: input.startDate,
    endDate: input.endDate,
    vacationType: input.vacationType,
    reason: input.reason.trim(),
    status: 'Pending',
    created_at: now(),
  }

  vacationsStore.update((list) => [vacation, ...list])

  addAuditLog({
    action: 'Vacation Requested',
    actor: input.employeeName,
    time: 'Just now',
    details: `${input.employeeName} requested ${input.vacationType} vacation from ${input.startDate} to ${input.endDate}`,
  })

  // Check if rep has scheduled visits
  const affected = getAffectedVisitsForVacation(input.employeeName, input.startDate, input.endDate)
  let warning: string | undefined
  if (affected.length > 0) {
    warning = `Warning: ${input.employeeName} has ${affected.length} scheduled visit(s) during this period.`
  }

  return { vacation, warning }
}

export function approveVacation(
  id: string,
  actor: string
): { affectedVisits: StoredVisit[]; warning?: string } {
  const req = vacationsStore.get().find((v) => v.id === id)
  if (!req) throw new Error(`Vacation request ${id} not found.`)
  if (req.status !== 'Pending') throw new Error(`Only pending vacation requests can be approved.`)

  // Ensure no overlapping approved vacation exists
  const overlap = hasOverlappingApprovedVacation(req.employeeName, req.startDate, req.endDate, req.id)
  if (overlap) {
    throw new Error(
      `Cannot approve: Overlaps with existing approved vacation from ${overlap.startDate} to ${overlap.endDate}.`
    )
  }

  // Rule D2: Warn if rep has scheduled visits (do NOT auto-delete)
  const affectedVisits = getAffectedVisitsForVacation(req.employeeName, req.startDate, req.endDate)
  const at = now()

  vacationsStore.update((list) =>
    list.map((v) => (v.id === id ? { ...v, status: 'Approved', updated_at: at } : v))
  )

  let warning: string | undefined
  if (affectedVisits.length > 0) {
    warning = `${affectedVisits.length} visit(s) are scheduled during ${req.employeeName}'s approved vacation. Review and reschedule them.`
  }

  addAuditLog({
    action: 'Vacation Approved',
    actor,
    time: 'Just now',
    details: `Approved vacation ${id} for ${req.employeeName} (${req.startDate} to ${req.endDate}). ${affectedVisits.length} visits affected.`,
  })

  return { affectedVisits, warning }
}

export function rejectVacation(id: string, reason: string, actor: string) {
  const req = vacationsStore.get().find((v) => v.id === id)
  if (!req) throw new Error(`Vacation request ${id} not found.`)
  if (req.status !== 'Pending') throw new Error(`Only pending vacation requests can be rejected.`)
  if (!reason.trim()) throw new Error('A rejection reason is required.')

  const at = now()

  vacationsStore.update((list) =>
    list.map((v) =>
      v.id === id ? { ...v, status: 'Rejected', rejectionReason: reason.trim(), updated_at: at } : v
    )
  )

  addAuditLog({
    action: 'Vacation Rejected',
    actor,
    time: 'Just now',
    details: `Rejected vacation ${id} for ${req.employeeName}: ${reason.trim()}`,
  })
}

// Rule D4: Allow managers to review and reschedule affected visits
export function rescheduleAffectedVisit(visitId: string, newDate: string, actor: string = 'Manager') {
  const visit = visitsStore.get().find((v) => v.id === visitId)
  if (!visit) throw new Error(`Visit ${visitId} not found.`)

  updateVisit(visitId, { date: newDate })

  addAuditLog({
    action: 'Visit Rescheduled',
    actor,
    time: 'Just now',
    details: `Rescheduled visit ${visitId} with ${visit.clientName} to ${newDate}`,
  })
}
