import React, { useState } from 'react'
import styles from './OpponentList.module.css'
import CardMenuMonster from '../../components/CardMenuMonster/CardMenuMonster'
import { MonsterOpponent } from '../../types/BattleRedis'

interface OpponentListProps {
  opponents: MonsterOpponent[]
  onChallenge: (monster: MonsterOpponent) => void
  // cursor: string
  // nextCursor: string
  // onNext: () => void
  // onPrev: () => void
}

const OpponentList: React.FC<OpponentListProps> = ({
  opponents,
  onChallenge,
  // cursor,
  // nextCursor,
  // onNext,
  // onPrev,
}) => {
  // Сохраняем id "заблокированных" монстров и их время разблокировки
  const [lockedButtons, setLockedButtons] = useState<{ [monsterId: string]: number }>({})

  const handleChallenge = (monster: MonsterOpponent) => {
    if (lockedButtons[monster.monsterId] && lockedButtons[monster.monsterId] > Date.now()) return
    onChallenge(monster)
    setLockedButtons((prev) => ({
      ...prev,
      [monster.monsterId]: Date.now() + 20000, // 20 сек блокировка
    }))
    // Снимаем блокировку через 20 сек
    setTimeout(() => {
      setLockedButtons((prev) => {
        const copy = { ...prev }
        delete copy[monster.monsterId]
        return copy
      })
    }, 20000)
  }

  return (
    <div className={styles.opponentList}>
      {opponents.map((monster) => {
        const isLocked = Boolean(
          lockedButtons[monster.monsterId] && lockedButtons[monster.monsterId]! > Date.now(),
        )
        return (
          <CardMenuMonster
            key={monster.monsterId}
            level={monster.level}
            url={monster.avatar || ''}
            onButtonClick={() => handleChallenge(monster)}
            textButton="Вызов"
            buttonStyle={{
              backgroundColor: isLocked ? '#181818' : undefined,
              color: isLocked ? '#999' : undefined,
              pointerEvents: isLocked ? 'none' : undefined,
              opacity: isLocked ? 0.7 : 1,
            }}
            disabled={isLocked}
          >
            <span>{monster.name}</span> <span>Lvl. {monster.level}</span>
          </CardMenuMonster>
        )
      })}
    </div>
  )
}

export default OpponentList
