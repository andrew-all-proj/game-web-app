import styles from './MonsterAvatarWithShadow.module.css'
import noAvatarMonster from '../../assets/images/no-avatar-monster.jpg'
import { Monster } from '../../types/GraphResponse'

interface Props {
  monster: Monster
  onClick?: () => void
}

const MonsterAvatarWithShadow = ({ monster, onClick }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapperMonster}>
        <img
          src={monster.avatar || noAvatarMonster}
          alt={monster.name}
          className={styles.monsterImage}
          onClick={onClick}
        />
      </div>
      <div className={styles.dotWrapper}>
        <div className={styles.outerDot}>
          <div className={styles.innerDot}></div>
        </div>
      </div>
    </div>
  )
}

export default MonsterAvatarWithShadow
