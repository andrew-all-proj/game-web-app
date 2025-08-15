import BattleButton from '../../components/Button/BattleButton'
import { ActionStatusEnum } from '../../types/enums/ActionStatusEnum'
import { Skill } from '../../types/GraphResponse'
import iconAttack from '../../assets/icon/icon_attack.svg'
import styles from './BottomBattleMenu.module.css'
import iconDefence from '../../assets/icon/icon_defence.svg'
import iconEmpty from '../../assets/icon/union-icon.svg'

interface BottomBattlteMenuProps {
  myAttacks: Skill[]
  myDefenses: Skill[]
  availableSp: number
  handleAttack: (actionId: string, actionType: ActionStatusEnum, energyCost: number) => void
}

const COLUMNS = 3

const fillRow = <T,>(items: T[]) =>
  items.length >= COLUMNS
    ? items.slice(0, COLUMNS)
    : [...items, ...Array.from({ length: COLUMNS - items.length }, () => null as unknown as T)]

const BottomBattlteMenu = ({ myAttacks, myDefenses, availableSp, handleAttack }: BottomBattlteMenuProps) => {
  const attackRow = fillRow(myAttacks ?? [])
  const defenseRow = fillRow(myDefenses ?? [])

  return (
    <div className={styles.wrapperButton}>
      {/* Row 1: Attacks */}
      {attackRow.map((attack, idx) =>
        attack ? (
          <BattleButton
            key={`a-${idx}-${attack.id}`}
            spCost={attack.energyCost}
            name={attack.name || 'Attack'}
            color={'var(--pink-secondary-color)'}
            onClick={() => handleAttack(attack.id, ActionStatusEnum.ATTACK, attack.energyCost)}
            img={attack.iconFile?.url || iconAttack}
            availableSp={availableSp}
          />
        ) : (
          <BattleButton
            key={`a-empty-${idx}`}
            spCost={0}
            name=""
            img={iconEmpty}
            color={'var(--pink-secondary-color)'}
            onClick={undefined} 
          />
        )
      )}

      {/* Row 2: Defenses */}
      {defenseRow.map((defense, idx) =>
        defense ? (
          <BattleButton
            key={`d-${idx}-${defense.id}`}
            spCost={defense.energyCost}
            name={defense.name || 'Defense'}
            img={defense.iconFile?.url || iconDefence}
            color={'var(--orange-secondary-color)'}
            onClick={() => handleAttack(defense.id, ActionStatusEnum.DEFENSE, defense.energyCost)}
            availableSp={availableSp}
          />
        ) : (
          <BattleButton
            key={`d-empty-${idx}`}
            spCost={0}
            name=""
            img={iconEmpty}
            color={'var(--pink-secondary-color)'}
            onClick={undefined}
          />
        )
      )}
    </div>
  )
}

export default BottomBattlteMenu
