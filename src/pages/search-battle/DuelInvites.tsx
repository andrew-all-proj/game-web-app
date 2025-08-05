import { useEffect } from 'react'
import CardMenuMonster from '../../components/CardMenuMonster/CardMenuMonster'
import { MonsterOpponent } from '../../types/BattleRedis'
import styles from './DuelInvites.module.css'

interface DuelInvitesProps {
  invites: MonsterOpponent[]
  onAccept: (opponent: MonsterOpponent) => void
  onDecline: (opponent: MonsterOpponent) => void
}

const DuelInvites = ({ invites, onAccept, onDecline }: DuelInvitesProps) => {
  useEffect(() => {
    invites.forEach((invite) => {
      const timerId = setTimeout(() => {
        onDecline(invite)
      }, 15000)
      return () => clearTimeout(timerId)
    })
  }, [invites, onDecline])

  if (!invites || invites.length === 0) return null

  return (
    <div className={styles.duelInvites}>
      <div className={styles.titleDuelInvites}>Приглашения ({invites.length})</div>
      {invites.map((invite) => (
        <CardMenuMonster
          key={invite.monsterId}
          level={invite.level}
          url={invite.avatar || ''}
          onButtonClick={() => onAccept(invite)}
          textButton="Принять"
        >
          <span>{invite.name}</span>
          <span>Lvl. {invite.level}</span>
        </CardMenuMonster>
      ))}
    </div>
  )
}

export default DuelInvites
