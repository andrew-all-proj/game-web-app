import { useEffect } from 'react'
import RoundButton from '../Button/RoundButton'
import styles from './TopAlert.module.css'
import { Variant } from './topAlertBus'

interface TopAlertProps {
  open: boolean
  text: string
  onClose: () => void
  variant?: Variant        
  autoHideMs?: number       
}

export default function TopAlert({
  open,
  text,
  onClose,
  variant = 'info',
  autoHideMs = 5000,
}: TopAlertProps) {
  useEffect(() => {
    if (!open) return
    if (!autoHideMs) return
    const t = setTimeout(onClose, autoHideMs)
    return () => clearTimeout(t)
  }, [open, autoHideMs, onClose])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        styles.toast,
        open ? styles.open : '',
        variant === 'warning' ? styles.toastWarning : '',
        variant === 'error' ? styles.toastError : styles.toastInfo,
      ].join(' ')}
    >
      <div className={styles.text}>{text}</div>
      <div className={styles.actions}>
        <RoundButton type="exit" onClick={onClose} />
      </div>
    </div>
  )
}
