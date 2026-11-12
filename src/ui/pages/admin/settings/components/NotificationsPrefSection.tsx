'use client'

import { Bell, FileText, BadgeDollarSign, Warehouse as WarehouseIcon, Activity, ShieldAlert, Volume2 } from 'lucide-react'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import { settingsStore, updatePreferences } from '@/data/mock/settings'

export interface NotificationsPrefSectionProps {
  onAction?: (msg: string) => void
}

export function NotificationsPrefSection({ onAction }: NotificationsPrefSectionProps) {
  const { t, lang } = useT()
  const prefs = useStore(settingsStore)

  const handleToggle = (key: keyof typeof prefs, val: boolean, label: string) => {
    updatePreferences({ [key]: val })
    onAction?.(lang === 'ar' ? `تم تحديث تفضيل: ${label}` : `Updated preference: ${label}`)
  }

  const items = [
    {
      key: 'notifyInvoices' as const,
      label: lang === 'ar' ? 'فواتير المبيعات والموافقات' : 'Invoices & Approval Requests',
      desc: lang === 'ar' ? 'إشعارات عند رفع فاتورة جديدة، طلب موافقة أو رفض فاتورة' : 'Alerts when sales orders or invoices are submitted, approved, or rejected',
      icon: FileText,
      value: prefs.notifyInvoices,
    },
    {
      key: 'notifyCollections' as const,
      label: lang === 'ar' ? 'التحصيلات النقدية والشيكات' : 'Cash In & Collections',
      desc: lang === 'ar' ? 'تنبيهات استلام الدفعات، إيصالات السداد، ومواعيد مقاصة الشيكات' : 'Alerts for recorded receipts, cheque clearance updates, and voided slips',
      icon: BadgeDollarSign,
      value: prefs.notifyCollections,
    },
    {
      key: 'notifyWarehouses' as const,
      label: lang === 'ar' ? 'حالة المستودعات والمخزون الحرج' : 'Warehouse Capacity & Expiry',
      desc: lang === 'ar' ? 'تحذيرات عند وصول المستودع إلى سعة حرجة أو اقتراب انتهاء صلاحية تشغيلة' : 'Warnings when storage reaches near-capacity or product batches approach expiry',
      icon: WarehouseIcon,
      value: prefs.notifyWarehouses,
    },
    {
      key: 'notifySellOut' as const,
      label: lang === 'ar' ? 'تقارير مبيعات الصيدليات (Sell-out)' : 'Sell-out Reporting Deadlines',
      desc: lang === 'ar' ? 'تذكيرات بمواعيد تقديم التقارير الشهرية ومتابعة اكتمال التغطية' : 'Reminders for monthly warehouse sell-out submission deadlines',
      icon: Activity,
      value: prefs.notifySellOut,
    },
    {
      key: 'notifySystem' as const,
      label: lang === 'ar' ? 'أمان النظام وسجل التدقيق' : 'System Security & Audit Alerts',
      desc: lang === 'ar' ? 'إشعارات تسجيل الدخول الإداري، تعديل الصلاحيات وعمليات الإلغاء الحساسة' : 'Audit logs for admin logins, privilege modifications, and critical system changes',
      icon: ShieldAlert,
      value: prefs.notifySystem,
    },
    {
      key: 'toastNotifications' as const,
      label: lang === 'ar' ? 'الإشعارات المنبثقة التفاعلية (Toasts)' : 'In-App Toast Banners',
      desc: lang === 'ar' ? 'عرض شريط عائم أسفل الشاشة عند إتمام أي عملية أو حفظ' : 'Display instant visual feedback banners for operational confirmations',
      icon: Volume2,
      value: prefs.toastNotifications,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--heading-text)', display: 'block' }}>
              {lang === 'ar' ? 'تفضيلات إشعارات التطبيق' : 'In-App Notification Preferences'}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
              {lang === 'ar' ? 'تحديد فئات الإشعارات والتنبيهات التي تود استلامها في النظام' : 'Choose which operational categories generate badges and alerts'}
            </span>
          </div>

          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--emerald, #10b981)',
            }}
          >
            {lang === 'ar' ? 'تفضيل حي فعال' : 'Live Preference'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle, #f1f5f9)',
                  background: 'var(--surface-raised, #f8fafc)',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(2, 132, 199, 0.08)',
                      color: 'var(--sky, #0284c7)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: 'var(--heading-text)', display: 'block' }}>
                      {item.label}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={(e) => handleToggle(item.key, e.target.checked, item.label)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      inset: 0,
                      backgroundColor: item.value ? 'var(--sky, #0284c7)' : '#cbd5e1',
                      transition: '0.2s',
                      borderRadius: '24px',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '18px',
                        width: '18px',
                        left: item.value ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#ffffff',
                        transition: '0.2s',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                  </span>
                </label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
