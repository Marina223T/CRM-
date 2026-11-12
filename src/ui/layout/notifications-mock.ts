import { notificationsStore, addNotification, type NotificationItem } from '@/data/mock/notifications'

export interface MockNotice {
  id: string
  title: string
  time: string
  unread?: boolean
  dotClass?: string
}

export const mockNotificationsList: MockNotice[] = [
  { id: 'notif-001', title: 'Invoice approval requested', time: '25 mins ago', unread: true, dotClass: 'n-0' },
  { id: 'notif-002', title: 'Cheque pending clearance', time: '1 hour ago', unread: true, dotClass: 'n-1' },
  { id: 'notif-003', title: 'Alexandria warehouse near capacity', time: '3 hours ago', unread: true, dotClass: 'n-2' },
]

export const earlierNotificationsList: MockNotice[] = [
  { id: 'notif-005', title: 'Batch CW-2401 nearing expiry', time: 'Yesterday', unread: false, dotClass: 'n-2' },
]

export function addMockNotification(title: string): void {
  addNotification({
    title,
    message: title,
    category: 'system',
    priority: 'info',
    time: 'Just now',
  })
}
