'use client'

import { useState } from 'react'
import { User, Mail, Shield, Building, Phone, Save, Check } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { StatusPill } from '@/ui/design-system/components/StatusPill'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { settingsStore, updatePreferences } from '@/data/mock/settings'

export interface AccountProfileSectionProps {
  currentUserName?: string
  currentUserEmail?: string
  role?: 'admin' | 'rep'
  onAction?: (msg: string) => void
}

export function AccountProfileSection({
  currentUserName = 'Alex Morgan',
  currentUserEmail = 'alex.morgan@navigen.eg',
  role = 'admin',
  onAction,
}: AccountProfileSectionProps) {
  const { t, lang } = useT()
  const prefs = useStore(settingsStore)

  const [displayName, setDisplayName] = useState(prefs.displayName || currentUserName)
  const [organization, setOrganization] = useState(prefs.organizationName)
  const [phone, setPhone] = useState('01023456789')
  const [title, setTitle] = useState(role === 'admin' ? 'Head of Regional Distribution' : 'Field Medical Representative')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferences({
      displayName,
      organizationName: organization,
    }, currentUserName)

    setIsSaved(true)
    onAction?.(lang === 'ar' ? 'تم حفظ بيانات الملف الشخصي بنجاح' : 'Profile preferences saved successfully')
    window.setTimeout(() => setIsSaved(false), 3000)
  }

  const initials = currentUserName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile Overview Card */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--navy, #1B3554)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            fontSize: '22px',
            fontWeight: 800,
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--heading-text)', margin: 0 }}>
              {currentUserName}
            </h2>
            <StatusPill status={role === 'admin' ? 'Active' : 'Healthy'} />
          </div>
          <span style={{ fontSize: '13px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
            {currentUserEmail}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(2, 132, 199, 0.1)',
                color: 'var(--sky, #0284c7)',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              <Shield size={11} />
              {role === 'admin' ? (lang === 'ar' ? 'مسؤول النظام (Admin)' : 'Administrator') : (lang === 'ar' ? 'مندوب مبيعات (Rep)' : 'Representative')}
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--muted-text)' }}>
              {organization}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div
        style={{
          padding: '22px',
          borderRadius: '16px',
          border: '1px solid var(--border-card, #e2e8f0)',
          background: 'var(--card-bg, #ffffff)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'اسم العرض (Display Name)' : 'Display Name'}
          </label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'البريد الإلكتروني (حساب النظام)' : 'Email Address (System ID)'}
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <input
              type="email"
              value={currentUserEmail}
              disabled
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--surface-raised, #f8fafc)',
                color: 'var(--muted-text)',
                fontSize: '13.5px',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'المؤسسة / الشركة' : 'Organization'}
          </label>
          <div style={{ position: 'relative' }}>
            <Building size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-input, #cbd5e1)',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--heading-text)',
              fontSize: '13.5px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--muted-text)', marginBottom: '6px' }}>
            {lang === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}
          </label>
          <div style={{ position: 'relative' }}>
            <Phone size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '12px', color: 'var(--muted-text)' }} />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingInlineStart: '36px',
                paddingInlineEnd: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-input, #cbd5e1)',
                background: 'var(--card-bg, #ffffff)',
                color: 'var(--heading-text)',
                fontSize: '13.5px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 20px',
            height: '42px',
            fontWeight: 700,
          }}
        >
          {isSaved ? <Check size={16} /> : <Save size={16} />}
          <span>{isSaved ? (lang === 'ar' ? 'تم الحفظ' : 'Saved!') : (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')}</span>
        </Button>
      </div>
    </form>
  )
}
