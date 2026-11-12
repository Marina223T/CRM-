'use client'

import { useState, useMemo } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  Filter,
  X,
  Boxes,
  FileText,
  BadgeDollarSign,
  Activity,
  Warehouse as WarehouseIcon,
  Settings2,
} from 'lucide-react'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { Button } from '@/ui/design-system/components/Button'
import { EmptyState } from '@/ui/design-system/components/EmptyState'
import { useT } from '@/lib/i18n'
import { useStore } from '@/data/mock/store'
import {
  notificationsStore,
  markNotificationAsRead,
  toggleNotificationRead,
  markAllNotificationsAsRead,
  dismissNotification,
  clearAllNotifications,
  type NotificationItem,
  type NotificationCategory,
} from '@/data/mock/notifications'

export interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onAction?: (s: string) => void
  onNavigate?: (page: string, options?: { filter?: string }) => void
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  onAction,
  onNavigate,
}: NotificationsDrawerProps) {
  const { t, lang } = useT()
  const notifications = useStore(notificationsStore)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }
      if (unreadOnly && !item.unread) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q) || (item.title_ar && item.title_ar.includes(q))
        const matchMsg = item.message.toLowerCase().includes(q) || (item.message_ar && item.message_ar.includes(q))
        if (!matchTitle && !matchMsg) return false
      }
      return true
    })
  }, [notifications, selectedCategory, unreadOnly, searchQuery])

  if (!isOpen) return null

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead()
    onAction?.(lang === 'ar' ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All notifications marked as read')
  }

  const handleClearAll = () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع الإشعارات؟' : 'Are you sure you want to dismiss all notifications?')) {
      clearAllNotifications()
      onAction?.(lang === 'ar' ? 'تم مسح الإشعارات' : 'All notifications cleared')
    }
  }

  const handleItemClick = (item: NotificationItem) => {
    if (item.unread) {
      markNotificationAsRead(item.id)
    }
    if (item.targetPage && onNavigate) {
      onNavigate(item.targetPage, { filter: item.targetFilter })
      onClose()
    }
  }

  const categories: { key: string; label: string; icon: any }[] = [
    { key: 'all', label: lang === 'ar' ? 'الكل' : 'All', icon: Bell },
    { key: 'invoices', label: lang === 'ar' ? 'الفواتير' : 'Invoices', icon: FileText },
    { key: 'collections', label: lang === 'ar' ? 'التحصيلات' : 'Collections', icon: BadgeDollarSign },
    { key: 'warehouses', label: lang === 'ar' ? 'المستودعات' : 'Warehouses', icon: WarehouseIcon },
    { key: 'sell_out', label: lang === 'ar' ? 'المبيعات' : 'Sell-out', icon: Activity },
    { key: 'system', label: lang === 'ar' ? 'النظام' : 'System', icon: Settings2 },
  ]

  const getPriorityBadge = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'critical':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '99px',
              fontSize: '10.5px',
              fontWeight: 700,
              background: 'rgba(225, 29, 72, 0.1)',
              color: 'var(--rose, #e11d48)',
            }}
          >
            <AlertCircle size={11} />
            {lang === 'ar' ? 'هام' : 'Critical'}
          </span>
        )
      case 'warning':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '99px',
              fontSize: '10.5px',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--amber, #f59e0b)',
            }}
          >
            <AlertTriangle size={11} />
            {lang === 'ar' ? 'تنبيه' : 'Warning'}
          </span>
        )
      case 'info':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '99px',
              fontSize: '10.5px',
              fontWeight: 700,
              background: 'rgba(2, 132, 199, 0.1)',
              color: 'var(--sky, #0284c7)',
            }}
          >
            <Info size={11} />
            {lang === 'ar' ? 'معلومة' : 'Info'}
          </span>
        )
    }
  }

  return (
    <Drawer
      title={lang === 'ar' ? 'مركز الإشعارات' : 'Notifications Center'}
      kicker={
        unreadCount > 0
          ? lang === 'ar'
            ? `${unreadCount} إشعار غير مقروء`
            : `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
          : lang === 'ar'
          ? 'لا توجد إشعارات جديدة'
          : 'All caught up'
      }
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
        {/* Actions Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-button"
                onClick={handleMarkAllRead}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: 'var(--sky, #0284c7)',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <CheckCheck size={14} />
                <span>{lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setUnreadOnly(!unreadOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                border: unreadOnly ? '1.5px solid var(--sky, #0284c7)' : '1px solid var(--border-input, #cbd5e1)',
                background: unreadOnly ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
                color: unreadOnly ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'غير المقروءة فقط' : 'Unread only'}
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11.5px',
                color: 'var(--rose, #e11d48)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              <span>{lang === 'ar' ? 'مسح الكل' : 'Clear all'}</span>
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            borderBottom: '1px solid var(--border-card, #e2e8f0)',
          }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid var(--sky, #0284c7)' : '1px solid transparent',
                  background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--surface-raised, #f8fafc)',
                  color: isSelected ? 'var(--sky, #0284c7)' : 'var(--muted-text)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '36px 0', textAlign: 'center' }}>
            <EmptyState
              message={
                lang === 'ar'
                  ? 'لا توجد إشعارات مطابقة لمعايير التصفية المحددة.'
                  : 'No notifications found matching your filter criteria.'
              }
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredNotifications.map((item) => {
              const displayTitle = lang === 'ar' && item.title_ar ? item.title_ar : item.title
              const displayMsg = lang === 'ar' && item.message_ar ? item.message_ar : item.message
              const displayAction = lang === 'ar' && item.actionLabel_ar ? item.actionLabel_ar : item.actionLabel

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: item.unread
                      ? '1.5px solid rgba(2, 132, 199, 0.35)'
                      : '1px solid var(--border-card, #e2e8f0)',
                    background: item.unread
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(2, 132, 199, 0.02))'
                      : 'var(--card-bg, #ffffff)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Row: Priority + Title + Time + Dismiss */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {item.unread && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--sky, #0284c7)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {getPriorityBadge(item.priority)}
                      <strong
                        style={{
                          fontSize: '13.5px',
                          color: 'var(--heading-text)',
                          fontWeight: item.unread ? 700 : 600,
                        }}
                      >
                        {displayTitle}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted-text)', whiteSpace: 'nowrap' }}>
                        {item.time}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissNotification(item.id)
                        }}
                        title={lang === 'ar' ? 'حذف الإشعار' : 'Dismiss'}
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: 'var(--muted-text)',
                          cursor: 'pointer',
                          padding: '3px',
                          borderRadius: '6px',
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Body Message */}
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: item.unread ? 'var(--heading-text)' : 'var(--muted-text)',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {displayMsg}
                  </p>

                  {/* Footer Actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--border-subtle, #f1f5f9)',
                    }}
                  >
                    <div>
                      {item.targetPage && (
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(2, 132, 199, 0.08)',
                            color: 'var(--sky, #0284c7)',
                            border: '1px solid rgba(2, 132, 199, 0.2)',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <span>{displayAction || (lang === 'ar' ? 'عرض السجل' : 'View Record')}</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNotificationRead(item.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 0,
                        background: 'transparent',
                        color: 'var(--muted-text)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={12} />
                      <span>{item.unread ? (lang === 'ar' ? 'تحديد كمقروء' : 'Mark read') : (lang === 'ar' ? 'تحديد كغير مقروء' : 'Mark unread')}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Drawer>
  )
}
