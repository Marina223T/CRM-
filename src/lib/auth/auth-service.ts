import { MOCK_USERS, findUserByEmail, getStoredUsers, saveStoredUsers, updateStoredUser, saveUserOverride } from './mock-users'
import type { User, AuthSession, UserStatus } from './types'
import { getDefaultPermissions } from './permissions'

const STORAGE_KEY = 'navigen_session'
const MOCK_VERIFY_CODE = '123456'

// ─── Sign In ─────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const cleanEmail = email.trim().toLowerCase()
  const found = findUserByEmail(cleanEmail)

  if (!found || found.passwordHash !== password) {
    throw new Error('Wrong email or password')
  }

  const status = (found.status || 'active') as UserStatus

  if (!found.emailVerified) {
    throw new Error('VERIFY_EMAIL')
  }
  if (status === 'pending') {
    throw new Error('PENDING_APPROVAL')
  }
  if (status === 'rejected') {
    throw new Error('REJECTED')
  }
  if (status === 'disabled') {
    throw new Error('DISABLED')
  }

  const { passwordHash: _, ...user } = found
  const session: AuthSession = {
    user,
    token: `token-${user.id}-${Date.now()}`,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }

  return user
}

// ─── Sign Up ─────────────────────────────────────────────
export interface SignUpData {
  name: string
  email: string
  phone?: string
  password: string
}

export async function signUp(data: SignUpData): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const cleanEmail = data.email.trim().toLowerCase()
  const existing = findUserByEmail(cleanEmail)
  if (existing) {
    throw new Error('An account with this email already exists')
  }

  const newUser = {
    id: `u-rep-${Date.now()}`,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone?.trim() || undefined,
    requestedDate: new Date().toISOString().slice(0, 10),
    role: 'rep' as const,
    status: 'pending' as const,
    emailVerified: false,
    permissions: getDefaultPermissions('rep'),
    passwordHash: data.password,
  }

  const stored = getStoredUsers()
  stored.push(newUser)
  saveStoredUsers(stored)

  const { passwordHash: _, ...user } = newUser
  return user
}

// ─── Email Verification ──────────────────────────────────
export async function verifyEmail(email: string, code: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (code !== MOCK_VERIFY_CODE) {
    throw new Error('Invalid verification code')
  }

  const found = findUserByEmail(email)
  if (!found) {
    throw new Error('Account not found')
  }

  updateStoredUser(email, { emailVerified: true })
  // Also update in-memory for built-in users
  found.emailVerified = true
}

export async function resendCode(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const found = findUserByEmail(email)
  if (!found) {
    throw new Error('Account not found')
  }
  // Mock: code is always 123456
}

// ─── Password Reset ──────────────────────────────────────
export async function requestPasswordReset(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const found = findUserByEmail(email)
  if (!found) {
    throw new Error('No account found with this email')
  }
  // Mock: code is always 123456
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (code !== MOCK_VERIFY_CODE) {
    throw new Error('Invalid reset code')
  }

  const found = findUserByEmail(email)
  if (!found) {
    throw new Error('Account not found')
  }

  // Update password in built-in users
  const builtIn = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (builtIn) {
    builtIn.passwordHash = newPassword
  }

  // Update password in stored users
  updateStoredUser(email, { passwordHash: newPassword } as Partial<typeof found>)
}

// ─── Email Link Sign-In ──────────────────────────────────
export async function signInWithEmailLink(email: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const found = findUserByEmail(email)
  if (!found) {
    throw new Error('No account found with this email')
  }

  if (!found.emailVerified) {
    throw new Error('VERIFY_EMAIL')
  }

  const status = (found.status || 'active') as UserStatus
  if (status !== 'active') {
    throw new Error(status === 'pending' ? 'PENDING_APPROVAL' : status === 'rejected' ? 'REJECTED' : 'DISABLED')
  }

  const { passwordHash: _, ...user } = found
  const session: AuthSession = {
    user,
    token: `token-${user.id}-${Date.now()}`,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }

  return user
}

// ─── Session Management (unchanged) ─────────────────────
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function setSessionUser(user: User): void {
  if (typeof window === 'undefined') return
  const session = getSession()
  if (session) {
    session.user = user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
}

export function updateMockUser(updatedUser: Partial<User> & { id?: string; email?: string }): void {
  const cleanEmail = updatedUser.email?.trim().toLowerCase()
  const userId = updatedUser.id

  if (userId) {
    saveUserOverride(userId, updatedUser)
  }
  if (cleanEmail) {
    saveUserOverride(cleanEmail, updatedUser)
  }

  const found = MOCK_USERS.find(
    (u) => (userId && u.id === userId) || (cleanEmail && u.email.toLowerCase() === cleanEmail)
  )
  if (found) {
    Object.assign(found, updatedUser)
  }

  const session = getSession()
  if (
    session?.user &&
    ((userId && session.user.id === userId) ||
      (cleanEmail && session.user.email.toLowerCase() === cleanEmail))
  ) {
    const newSessionUser = {
      ...session.user,
      ...updatedUser,
      permissions: updatedUser.permissions ? { ...updatedUser.permissions } : session.user.permissions,
    } as User
    setSessionUser(newSessionUser)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('navigen_user_updated', { detail: newSessionUser }))
    }
  }
}
