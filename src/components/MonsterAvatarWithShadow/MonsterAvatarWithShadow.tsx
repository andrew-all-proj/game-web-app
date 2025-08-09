import styles from './MonsterAvatarWithShadow.module.css'
import noAvatarMonster from '../../assets/images/no-avatar-monster.jpg'
import { Monster } from '../../types/GraphResponse'

interface Props {
  monster: Monster
  onClick?: () => void
  className?: string
}

const MonsterAvatarWithShadow = ({ monster, onClick, className }: Props) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.monsterZone}>
        <img
          src={monster.avatar || noAvatarMonster}
          alt={monster.name}
          className={styles.monsterImage}
          onClick={onClick}
        />
        <div className={styles.dotWrapper}>
          <div className={styles.outerDot}>
            <div className={styles.innerDot}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonsterAvatarWithShadow
