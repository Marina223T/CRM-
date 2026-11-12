import { useState, useRef } from 'react'
import { Upload, CheckCircle2 } from 'lucide-react'
import { Button } from '@/ui/design-system/components/Button'
import { Drawer } from '@/ui/design-system/components/Drawer'
import { UploadProgress } from '@/ui/design-system/components/UploadProgress'
import { useT } from '@/lib/i18n'
import { addInvoice, generateInvoiceName } from '@/data/mock/invoices'
import { addNotification } from '@/data/mock/notifications'

export interface UploadInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function UploadInvoiceModal({
  isOpen,
  onClose,
  onSave,
}: UploadInvoiceModalProps) {
  const { t, lang } = useT()
  const [file, setFile] = useState<{ name: string; size: string } | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'uploading' | 'success' | 'error'>('uploading')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  if (!isOpen) return null

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setFile(null)
    setProgress(0)
    setStatus('uploading')
    setIsSubmitting(false)
    onClose()
  }

  const startUpload = (fileName: string, fileSize: string) => {
    setFile({ name: fileName, size: fileSize })
    setProgress(15)
    setStatus('uploading')

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          setStatus('success')
          return 100
        }
        return prev + 25
      })
    }, 150)
  }

  const handleChooseFile = () => {
    startUpload('Invoice_INV-8821.pdf', '2.4 MB')
  }

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setFile(null)
    setProgress(0)
    setStatus('uploading')
  }

  const handleRetry = () => {
    if (file) {
      startUpload(file.name, file.size)
    }
  }

  // Explicit user event handler for creating the invoice: NEVER called during render
  const handleConfirmInvoice = () => {
    if (!file || isSubmitting) return
    setIsSubmitting(true)

    const invoiceName = generateInvoiceName('Uploaded Invoice')
    addInvoice({
      name: invoiceName,
      meta: 'Web uploaded · EGP 0',
      meta_ar: 'رفع يدوي عبر الويب · 0 ج.م',
      status: 'Pending',
      source: 'Web upload',
      dateRange: 'Today',
      repName: 'Alex Morgan',
    })

    addNotification({
      title: 'Invoice Uploaded',
      title_ar: 'تم رفع فاتورة',
      message: `${invoiceName} has been uploaded and is pending review.`,
      message_ar: `تم رفع ${invoiceName} وهي بانتظار المراجعة.`,
      category: 'invoices',
      priority: 'info',
      time: 'Just now',
      targetPage: 'Invoices & Sell-in',
      actionLabel: 'Review Invoice',
      actionLabel_ar: 'مراجعة الفاتورة',
    })

    handleClose()
    onSave()
  }

  return (
    <Drawer title={t('invoices.upload.title')} kicker={t('invoices.upload.kicker')} onClose={handleClose}>
      <div className="upload-zone">
        <Upload />
        <strong>{t('invoices.upload.dropzone')}</strong>
        <span>{t('invoices.upload.orChoose')}</span>
        {!file && (
          <Button variant="secondary" onClick={handleChooseFile}>
            {t('invoices.upload.chooseFile')}
          </Button>
        )}
      </div>

      {file && (
        <div style={{ marginTop: '16px' }}>
          <UploadProgress
            fileName={file.name}
            fileSize={file.size}
            progress={progress}
            status={status}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />

          {status === 'success' && (
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleCancel}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmInvoice}
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={16} />
                <span>{lang === 'ar' ? 'تأكيد وإضافة الفاتورة' : 'Confirm & Add Invoice'}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
