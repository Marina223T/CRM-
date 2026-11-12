'use client'

import { useState } from 'react'
import { Shield, KeyRound, Lock, Laptop, CheckCircle2, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { useT } from '@/lib/i18n'
import { getUserPermissions } from '@/lib/auth/permissions'

export interface SecurityAccessSectionProps {
  currentUserName?: string
  role?: 'admin' | 'rep'
  onAction?: (msg: string) => void
}

export function SecurityAccessSection({
  currentUserName = 'Alex Morgan',
  role = 'admin',
  onAction,
}: SecurityAccessSectionProps) {
  const { t, lang } = useT()
  const permissions = getUserPermissions(null, role)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError(lang === 'ar' ? 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل' : 'Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'New passwords do not match')
      return
    }

    setPasswordSuccess(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    onAction?.(lang === 'ar' ? 'تم تحديث كلمة المرور للحساب المحلي' : 'Local account password updated successfully')
    window.setTimeout(() => setPasswordSuccess(false), 3500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Role & Permissions Card */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'الدور الوظيفي وصلاحيات الوصول' : 'Role & Access Permissions Matrix'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar'
                ? `الصلاحيات الفعالة الممنوحة لحسابك الحالي (${currentUserName})`
                : `Active privilege scopes granted to your current session (${currentUserName})`}
            </span>
          </div>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              background: role === 'admin' ? 'rgba(2, 132, 199, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: role === 'admin' ? 'var(--sky, #0284c7)' : 'var(--emerald, #10b981)',
            }}
          >
            {role === 'admin' ? (lang === 'ar' ? 'مسؤول كامل (Admin)' : 'Full Administrator') : (lang === 'ar' ? 'مندوب مبيعات (Rep Scope)' : 'Field Representative')}
          </span>
        </div>

        {/* Permissions Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: permissions.canApproveInvoices ? 'var(--emerald, #10b981)' : '#94a3b8' }} />
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', display: 'block' }}>
                {lang === 'ar' ? 'اعتماد واعتماد الفواتير' : 'Approve Invoices'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                {permissions.canApproveInvoices ? (lang === 'ar' ? 'مسموح به' : 'Authorized') : (lang === 'ar' ? 'غير مصرح' : 'Restricted')}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: permissions.canEditPrices ? 'var(--emerald, #10b981)' : '#94a3b8' }} />
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', display: 'block' }}>
                {lang === 'ar' ? 'تعديل أسعار المنتجات' : 'Price Adjustments'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                {permissions.canEditPrices ? (lang === 'ar' ? 'مسموح به' : 'Authorized') : (lang === 'ar' ? 'غير مصرح' : 'Restricted')}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: permissions.canExport ? 'var(--emerald, #10b981)' : '#94a3b8' }} />
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', display: 'block' }}>
                {lang === 'ar' ? 'تصدير التقارير والبيانات' : 'Export Analytics'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                {permissions.canExport ? (lang === 'ar' ? 'مسموح به' : 'Authorized') : (lang === 'ar' ? 'غير مصرح' : 'Restricted')}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'var(--surface-raised, #f8fafc)',
              border: '1px solid var(--border-subtle, #f1f5f9)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: permissions.canDeleteData ? 'var(--emerald, #10b981)' : '#94a3b8' }} />
            <div>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--heading-text)', display: 'block' }}>
                {lang === 'ar' ? 'إلغاء وحذف السجلات' : 'Void & Delete Records'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                {permissions.canDeleteData ? (lang === 'ar' ? 'مسموح به' : 'Authorized') : (lang === 'ar' ? 'غير مصرح' : 'Restricted')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
            {lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
            {lang === 'ar'
              ? 'تحديث بيانات تسجيل الدخول المحلية (بيئة محاكاة واجهة المستخدم)'
              : 'Update your login credentials for this browser profile session'}
          </span>
        </div>

        {passwordError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(225, 29, 72, 0.1)',
              color: 'var(--rose, #e11d48)',
              fontSize: '12.5px',
            }}
          >
            <AlertTriangle size={15} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--emerald, #10b981)',
              fontSize: '12.5px',
            }}
          >
            <Check size={15} />
            <span>{lang === 'ar' ? 'تم تحديث كلمة المرور بنجاح!' : 'Password updated successfully!'}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
              {lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
              {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '5px' }}>
              {lang === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button type="submit" variant="primary" style={{ height: '38px', padding: '0 16px', fontSize: '12.5px' }}>
              {lang === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Active Session Info */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '14px',
          background: 'var(--surface-raised, #f8fafc)',
          border: '1px solid var(--border-card, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Laptop size={18} style={{ color: 'var(--sky, #0284c7)' }} />
          <div>
            <strong style={{ fontSize: '13px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'الجلسة النشطة الحالية' : 'Current Active Device Session'}
            </strong>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
              Windows OS · Chrome Browser · IP: 192.168.1.104
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '11.5px',
            color: 'var(--emerald, #10b981)',
            fontWeight: 600,
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '3px 8px',
            borderRadius: '6px',
          }}
        >
          {lang === 'ar' ? 'جلسة مشفرة ونشطة' : 'Encrypted & Active'}
        </span>
      </div>
    </div>
  )
}
