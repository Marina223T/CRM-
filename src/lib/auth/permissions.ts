import type { User, UserPermissions, UserRole } from './types'

export const ALL_STANDARD_PAGES = [
  'Dashboard',
  'Clients',
  'Invoices',
  'Stock',
  'Sell-in',
  'Sell-out',
  'Distribution Overview',
  'Invoices & Sell-in',
  'Warehouses',
  'Performance Analytics',
  'Cash In',
  'Returns',
  'Targets',
  'Visits',
  'Visit plan',
  'Budgets',
  'Reports',
]

export const ALL_ADMIN_PAGES = [
  'Admin',
  'Users',
  'Products & Batches',
  'Territories',
  'Audit log',
  'Settings',
]

export const ALL_PAGES = [...ALL_STANDARD_PAGES, ...ALL_ADMIN_PAGES]

export function getDefaultPermissions(role: UserRole): UserPermissions {
  if (role === 'admin') {
    return {
      pages: [...ALL_PAGES, 'Home'],
      canEditPrices: true,
      canApproveInvoices: true,
      canExport: true,
      canDeleteData: true,
    }
  }
  return {
    pages: [...ALL_STANDARD_PAGES, 'Home'],
    canEditPrices: false,
    canApproveInvoices: false,
    canExport: false,
    canDeleteData: false,
  }
}

export function getUserPermissions(user?: User | null, fallbackRole: UserRole = 'rep'): UserPermissions {
  const role = user?.role || fallbackRole
  const defaults = getDefaultPermissions(role)
  if (!user?.permissions) return defaults

  return {
    pages: user.permissions.pages ?? defaults.pages,
    canEditPrices: user.permissions.canEditPrices ?? defaults.canEditPrices,
    canApproveInvoices: user.permissions.canApproveInvoices ?? defaults.canApproveInvoices,
    canExport: user.permissions.canExport ?? defaults.canExport,
    canDeleteData: user.permissions.canDeleteData ?? defaults.canDeleteData,
  }
}

export function canAccessPage(
  page: string,
  roleOrUser?: UserRole | User | null,
  maybeUser?: User | null
): boolean {
  let role: UserRole = 'rep'
  let user: User | null = null

  if (typeof roleOrUser === 'string') {
    role = roleOrUser
    user = maybeUser || null
  } else if (roleOrUser && typeof roleOrUser === 'object') {
    user = roleOrUser
    role = user.role || 'rep'
  }

  const permissions = getUserPermissions(user, role)
  const targetPage = page === 'Home' ? 'Dashboard' : page

  if (targetPage === 'Invoices & Sell-in') {
    return (
      permissions.pages.includes('Invoices & Sell-in') ||
      permissions.pages.includes('Invoices') ||
      permissions.pages.includes('Sell-in')
    )
  }

  return (
    permissions.pages.includes(targetPage) ||
    (targetPage === 'Dashboard' && permissions.pages.includes('Home'))
  )
}

export function canPerformAction(
  action: keyof Omit<UserPermissions, 'pages'>,
  roleOrUser?: UserRole | User | null,
  maybeUser?: User | null
): boolean {
  let role: UserRole = 'rep'
  let user: User | null = null

  if (typeof roleOrUser === 'string') {
    role = roleOrUser
    user = maybeUser || null
  } else if (roleOrUser && typeof roleOrUser === 'object') {
    user = roleOrUser
    role = user.role || 'rep'
  }

  const permissions = getUserPermissions(user, role)
  return Boolean(permissions[action])
}
