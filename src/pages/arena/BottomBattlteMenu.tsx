import BattleButton from '../../components/Button/BattleButton'
import { ActionStatusEnum } from '../../types/enums/ActionStatusEnum'
import { Skill } from '../../types/GraphResponse'
import iconAttack from '../../assets/icon/icon_attack.svg'
import styles from './BottomBattleMenu.module.css'
import iconDefence from '../../assets/icon/icon_defence.svg'


interface BottomBattlteMenuProps {
    myAttacks: Skill[]
    myDefenses: Skill[]
    handleAttack: (actionId: string, actionType: ActionStatusEnum, energyCost: number) => void
}

const BottomBattlteMenu = ({
   myAttacks,
   myDefenses,
   handleAttack
}: BottomBattlteMenuProps) => {
  return (
    <div className={styles.wrapperButton}>
          {myAttacks.map((attack, idx) => (
            <BattleButton
              key={idx}
              spCost={attack.energyCost}
              name={attack.name || 'Attack'}
              color={'var(--pink-secondary-color)'}
              onClick={() =>
                handleAttack(
                  attack.id,
                  ActionStatusEnum.ATTACK,
                  attack.energyCost
                )
              }
              img={attack.iconFile?.url || iconAttack}
            />
          ))}
          {myDefenses.map((defense, idx) => (
            <BattleButton
              key={`d-${idx}`}
              spCost={defense.energyCost}
              name={`🛡 ${defense.name}`}
              img={defense.iconFile?.url || iconDefence}
              color={'var(--orange-secondary-color)'}
              onClick={() =>
                handleAttack(
                  defense.id,
                  ActionStatusEnum.DEFENSE,
                  defense.energyCost
                )
              }
            />
          ))}
        </div>
  )
}

export default BottomBattlteMenu
