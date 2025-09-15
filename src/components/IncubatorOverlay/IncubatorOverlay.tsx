import React from 'react'
import styles from './IncubatorOverlay.module.css'

type Props = {
  open: boolean
  text?: string
  fullscreen?: boolean
  className?: string
}

const IncubatorOverlay: React.FC<Props> = ({
  open,
  text = 'Создание монстра…',
  fullscreen,
  className,
}) => {
  if (!open) return null

  const cls = [styles.overlay, fullscreen ? styles.fullscreen : '', className || ''].join(' ')

  return (
    <div className={cls} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.lab}>
        <div className={styles.spinner}>
          <div className={styles.ring}></div>
          <div className={styles.ring2}></div>
        </div>

        <div className={styles.bubbles}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className={styles.text}>{text}</div>
      </div>
    </div>
  )
}

export default IncubatorOverlay
