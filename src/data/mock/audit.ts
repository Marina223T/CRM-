import { adminAuditLogMockData, type AuditRecord } from '@/ui/pages/admin/audit-log/mock-data'
import { createStore } from './store'

export const auditStore = createStore<AuditRecord[]>('audit', adminAuditLogMockData)

export function addAuditLog(entry: Partial<AuditRecord> & { action: string; actor: string; details: string }) {
  auditStore.update((list) => {
    const id = entry.id ?? `LOG-${list.length + 416}`
    const newRecord: AuditRecord = {
      id,
      action: entry.action,
      action_ar: entry.action_ar,
      actor: entry.actor,
      actorRole: entry.actorRole || (entry.actor === 'Alex Morgan' ? 'System Administrator' : 'Medical Representative'),
      time: entry.time || 'Just now',
      timestamp: entry.timestamp || new Date().toISOString(),
      module: entry.module || 'System',
      actionType: entry.actionType || 'create',
      affectedRecord: entry.affectedRecord || entry.details.slice(0, 30),
      status: entry.status || 'Success',
      details: entry.details,
      details_ar: entry.details_ar,
      ipAddress: entry.ipAddress || '192.168.1.104',
      beforeAfter: entry.beforeAfter,
    }
    return [newRecord, ...list]
  })
}
