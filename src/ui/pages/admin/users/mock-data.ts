import type { UserPermissions, UserRole } from '@/lib/auth'
import { getDefaultPermissions } from '@/lib/auth/permissions'

export interface AdminUserRecord {
  id: string
  name: string
  name_ar?: string
  email: string
  role: string
  roleType: UserRole
  region: string
  status: string
  permissions?: UserPermissions
}

export const adminUsersMockData: AdminUserRecord[] = [
  {
    id: 'u-admin-1',
    name: 'Alex Morgan',
    name_ar: 'أليكس مورجان',
    email: 'admin@navigenpharma.net',
    role: 'Admin',
    roleType: 'admin',
    region: 'HQ - Global',
    status: 'Active',
    permissions: getDefaultPermissions('admin'),
  },
  {
    id: 'u-rep-1',
    name: 'Ahmed Samir',
    name_ar: 'أحمد سمير',
    email: 'ahmed@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'North region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
  {
    id: 'u-rep-2',
    name: 'Sara Ali',
    name_ar: 'سارة علي',
    email: 'sara@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'West region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
  {
    id: 'u-rep-olivia',
    name: 'Olivia Martin',
    name_ar: 'أوليفيا مارتن',
    email: 'olivia.martin@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'North region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
  {
    id: 'u-rep-maya',
    name: 'Maya Patel',
    name_ar: 'مايا باتيل',
    email: 'maya.patel@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'West region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
  {
    id: 'u-rep-james',
    name: 'James Wilson',
    name_ar: 'جيمس ويلسون',
    email: 'james.wilson@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'Central region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
  {
    id: 'u-rep-sofia',
    name: 'Sofia Chen',
    name_ar: 'صوفيا تشين',
    email: 'sofia.chen@navigenpharma.net',
    role: 'Medical Representative',
    roleType: 'rep',
    region: 'East region',
    status: 'Active',
    permissions: getDefaultPermissions('rep'),
  },
]
