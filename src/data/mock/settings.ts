import { createStore } from './store'
import { addAuditLog } from './audit'

export interface UserPreferences {
  displayName: string
  organizationName: string
  timezone: string
  currency: string
  dateFormat: string
  tableDensity: 'comfortable' | 'compact'
  notifyInvoices: boolean
  notifyCollections: boolean
  notifyWarehouses: boolean
  notifySellOut: boolean
  notifySystem: boolean
  toastNotifications: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: 'Alex Morgan',
  organizationName: 'Navigen Pharma (Egypt)',
  timezone: 'Africa/Cairo (UTC+2)',
  currency: 'EGP',
  dateFormat: 'YYYY-MM-DD',
  tableDensity: 'comfortable',
  notifyInvoices: true,
  notifyCollections: true,
  notifyWarehouses: true,
  notifySellOut: true,
  notifySystem: true,
  toastNotifications: true,
}

export const settingsStore = createStore<UserPreferences>(
  'user_preferences',
  DEFAULT_PREFERENCES,
)

export function updatePreferences(patch: Partial<UserPreferences>, actor: string = 'User') {
  settingsStore.update((curr) => {
    const updated = { ...curr, ...patch }
    addAuditLog({
      action: 'System Preferences Updated',
      actor,
      time: 'Just now',
      module: 'System',
      actionType: 'update',
      affectedRecord: 'User Settings & Configuration',
      status: 'Success',
      details: `Updated preferences: ${Object.keys(patch).join(', ')}`,
    })
    return updated
  })
}
