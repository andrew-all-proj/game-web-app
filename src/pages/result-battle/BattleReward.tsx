import styles from './BattleReward.module.css'
import foodIcon from '../../assets/icon/food-icon.svg'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import skillIcon from '../../assets/icon/icon_attack.svg'
import expIcon from '../../assets/icon/icon_exp.svg'

import { GetBattleReward } from '../../types/BattleRedis'

interface BattleRewardProps {
  battleReward: GetBattleReward | null
}

export default function BattleRewardBox({ battleReward }: BattleRewardProps) {
  if (!battleReward) {
    return null
  }
  return (
    <div className={styles.rewardBox}>
      {/* EXP */}
      <div className={styles.rewardBlock}>
        <img src={expIcon} alt="food" className={styles.rewardIcon} draggable={false} />
        <span className={styles.expValue}>+{battleReward.exp}</span>
      </div>
      {/* FOOD*/}
      {battleReward.food && (
        <div className={styles.rewardBlock}>
          <img src={foodIcon} alt="food" className={styles.rewardIcon} draggable={false} />
          <span className={styles.foodValue}>x{battleReward.food.quantity}</span>
        </div>
      )}
      {/* MUTAGEN*/}
      {battleReward.mutagen && (
        <div className={styles.rewardBlock}>
          <img src={mutagenIcon} alt="mutagen" className={styles.rewardIcon} draggable={false} />
          <span className={styles.mutagenValue}>x{battleReward.mutagen.quantity}</span>
        </div>
      )}
      {/* Skill*/}
      {battleReward.skill && (
        <div className={styles.rewardBlock}>
          <img src={skillIcon} alt="skill" className={styles.rewardIcon} draggable={false} />
          <span className={styles.mutagenValue}>x{battleReward.skill.quantity}</span>
        </div>
      )}
    </div>
  )
}
