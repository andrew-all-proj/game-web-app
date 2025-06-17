import React, { useEffect, useState } from 'react'
import styles from './DuelRequestModal.module.css'

interface DuelRequestModalProps {
  opponent: {
    monsterId: string
    name: string
    level: number
    avatar: string | null
  }
  onAccept: () => void
  onDecline: () => void
}

const DuelRequestModal: React.FC<DuelRequestModalProps> = ({ opponent, onAccept, onDecline }) => {
  const [secondsLeft, setSecondsLeft] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    const timeout = setTimeout(() => {
      onDecline()
    }, 30000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onDecline])

  return (
    <div className={styles.duelRequestModal}>
      <div className={styles.duelRequestContent}>
        <h3>Вызов на дуэль!</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '-0.5rem' }}>
          Принять вызов в течение <strong>{secondsLeft}</strong> сек...
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {opponent.avatar ? (
            <img
              src={opponent.avatar}
              alt="avatar"
              width={60}
              height={60}
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#ccc',
                borderRadius: '50%',
              }}
            />
          )}
          <div>
            <div>
              <strong>{opponent.name}</strong>
            </div>
            <div>Уровень: {opponent.level}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onAccept}>Принять</button>
          <button onClick={onDecline}>Отказаться</button>
        </div>
      </div>
    </div>
  )
}

export default DuelRequestModal
