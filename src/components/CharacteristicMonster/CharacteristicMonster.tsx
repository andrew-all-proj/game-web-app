import { useState, KeyboardEvent } from 'react'
import styles from './CharacteristicMonster.module.css'

import hpIcon from '../../assets/icon/small-hp-icon.svg'
import staminaIcon from '../../assets/icon/small-stamina-icon.svg'
import strenghtIcon from '../../assets/icon/small-strength-icon.svg'
import defenceIcon from '../../assets/icon/small-defence-icon.svg'
import evasionIcon from '../../assets/icon/small-evasion-icon.svg'
import { useTranslation } from 'react-i18next'

type Mode = 'closed' | 'compact' | 'expanded'
const order: Mode[] = ['closed', 'compact', 'expanded']

interface Props {
  name?: string
  level: number
  hp: number
  stamina: number
  strength: number
  defense: number
  evasion: number
  className?: string
}

export default function CharacteristicMonster({
  name,
  level,
  hp,
  stamina,
  strength,
  defense,
  evasion,
  className,
}: Props) {
  const [mode, setMode] = useState<Mode>('closed')
  const { t } = useTranslation();

  const toggle = () => setMode((prev) => order[(order.indexOf(prev) + 1) % order.length])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div
      className={`${styles.wrapper} ${className || ''}`}
      data-mode={mode}
      role="button"
      tabIndex={0}
      aria-expanded={mode !== 'closed'}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      {/* CLOSED */}
      {mode === 'closed' && (
        <div className={styles.closedInner}>
          {name && <div className={styles.name}>{name}</div>}
          <div className={styles.levelBadge}>Lvl. {level}</div>
        </div>
      )}

      {/* COMPACT */}
      {mode === 'compact' && (
        <div className={styles.compactInner}>
          {name && <div className={styles.name}>{name}</div>}
          <div className={styles.levelBig}>Lvl. {level}</div>

          <div className={styles.charLine}>
            <img src={hpIcon} alt="hp" className={styles.icon} />
            <span>{hp}</span>
          </div>
          <div className={styles.charLine}>
            <img src={staminaIcon} alt="stamina" className={styles.icon} />
            <span>{stamina}</span>
          </div>
          <div className={styles.charLine}>
            <img src={strenghtIcon} alt="strength" className={styles.icon} />
            <span>{strength}</span>
          </div>
          <div className={styles.charLine}>
            <img src={defenceIcon} alt="defense" className={styles.icon} />
            <span>{defense}</span>
          </div>
          <div className={styles.charLine}>
            <img src={evasionIcon} alt="evasion" className={styles.icon} />
            <span>{evasion}</span>
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {mode === 'expanded' && (
        <div className={styles.expandedInner}>
          {name && <div className={styles.name}>{name}</div>}
          <div className={styles.row}>
            <span>Lvl.</span>
            <span>{level}/30</span>
          </div>
          <div className={styles.row}>
            <span>{t('stats.health')}</span>
            <span>{hp}</span>
          </div>
          <div className={styles.row}>
            <span>{t('stats.stamina')}</span>
            <span>{stamina}</span>
          </div>
          <div className={styles.row}>
            <span>{t('stats.strength')}</span>
            <span>{strength}</span>
          </div>
          <div className={styles.row}>
            <span>{t('stats.defense')}</span>
            <span>{defense}</span>
          </div>
          <div className={styles.row}>
            <span>{t('stats.evasion')}</span>
            <span>{evasion}</span>
          </div>
        </div>
      )}
    </div>
  )
}
