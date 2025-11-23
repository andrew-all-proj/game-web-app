import { useEffect, useMemo, useState } from 'react'
import styles from './HeaderBattle.module.css'
import StatBar from '../../components/StatBar/StatBar'
import smallEnergyIcon from '../../assets/icon/small-stamina-icon.svg'
import smallHeartIcon from '../../assets/icon/small-hp-icon.svg'
import { useTranslation } from 'react-i18next'

interface HeaderBattleProps {
  chalengerHealth: number
  maxChalengerHealth: number
  opponentHealth: number
  maxOpponentHealth: number
  chalengerStamina: number
  maxChalengerStamina: number
  opponentStamina: number
  maxOpponentStamina: number
  isCurrentTurn: boolean
  turnEndsAtMs?: number
  turnTimeLimitMs?: number
  serverNowMs?: number
}

const HeaderBattle = ({
  chalengerHealth,
  maxChalengerHealth,
  opponentHealth,
  maxOpponentHealth,
  chalengerStamina,
  maxChalengerStamina,
  opponentStamina,
  maxOpponentStamina,
  isCurrentTurn,
  turnEndsAtMs,
  turnTimeLimitMs = 30000,
  serverNowMs,
}: HeaderBattleProps) => {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    if (serverNowMs) setOffset(serverNowMs - Date.now())
  }, [serverNowMs])

  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!isCurrentTurn || !turnEndsAtMs) {
      setProgress(0)
      return
    }
    let raf = 0
    const tick = () => {
      const now = Date.now() + offset
      const remaining = Math.max(0, turnEndsAtMs - now)
      const p = 1 - Math.min(1, remaining / Math.max(1, turnTimeLimitMs))
      setProgress(p)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isCurrentTurn, turnEndsAtMs, turnTimeLimitMs, offset])

  const fillStyle = useMemo(
    () => ({ ['--fill' as any]: `${Math.round(progress * 100)}%` }),
    [progress],
  )

  return (
    <div className={styles.header}>
      <div className={styles.statBars}>
        <div className={styles.side}>
          <StatBar
            current={chalengerHealth}
            max={maxChalengerHealth ?? 0}
            iconSrc={smallHeartIcon}
            backgroundColor="white"
            color="var(--pink-secondary-color)"
          />
          <StatBar
            current={chalengerStamina ?? 0}
            max={maxChalengerStamina ?? 0}
            iconSrc={smallEnergyIcon}
            backgroundColor="white"
            color="#FCF8B5"
          />
        </div>
        <div className={styles.side}>
          <StatBar
            current={opponentHealth ?? 0}
            max={maxOpponentHealth ?? 0}
            iconSrc={smallHeartIcon}
            backgroundColor="white"
            color="var(--pink-secondary-color)"
          />
          <StatBar
            current={opponentStamina ?? 0}
            max={maxOpponentStamina ?? 0}
            iconSrc={smallEnergyIcon}
            backgroundColor="white"
            color="#FCF8B5"
          />
        </div>
      </div>

      <div
        className={`${styles.statusPill} ${isCurrentTurn ? styles.statusMyTurn : styles.statusEnemyTurn}`}
        style={isCurrentTurn ? fillStyle : undefined}
      >
        {isCurrentTurn ? t('arena.myTurn') : t('arena.opponentTurn')}
      </div>
    </div>
  )
}

export default HeaderBattle
