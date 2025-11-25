import React from 'react'
import styles from './BattleButton.module.css'

interface BattleButtonProps {
  spCost: number
  name: string
  img: string
  onClick?: () => void
  color?: string
  selected?: boolean
  availableSp?: number
  multiplier?: number            
}

const BattleButtonBase: React.FC<BattleButtonProps> = ({
  spCost,
  name,
  img,
  onClick,
  color,
  selected,
  availableSp,
  multiplier,                    // <--- используем
}) => {
  const styleVars: React.CSSProperties = color ? { ['--btn-color' as any]: color } : {}

  const isInsufficient = availableSp !== undefined && availableSp < spCost
  const isClickDisabled = !onClick

  const badgeClass = [
    styles.attackSp,
    isInsufficient || isClickDisabled ? styles.attackSpGray : '',
    isClickDisabled ? styles.attackSpNoText : '',
  ]
    .join(' ')
    .trim()

  return (
    <div
      className={`${styles.attackButton} ${selected ? styles.attackButtonSelected : ''}`}
      style={styleVars}
      onClick={onClick}
      role="button"
      aria-pressed={!!selected}
      aria-disabled={isClickDisabled ? true : undefined}
    >
      <div className={badgeClass}>
        {!isClickDisabled ? <>{spCost}</> : null}
      </div>

      <div className={styles.attackContent}>
        <img alt={name} src={img} />

        {multiplier && multiplier > 1 && (       
          <div className={styles.attackMultiplier}>
            x{multiplier}
          </div>
        )}
      </div>
    </div>
  )
}

const BattleButton = React.memo(BattleButtonBase, (prev, next) => {
  const prevIns = prev.availableSp !== undefined && prev.availableSp < prev.spCost
  const nextIns = next.availableSp !== undefined && next.availableSp < next.spCost
  const prevDisable = !prev.onClick
  const nextDisable = !next.onClick

  return (
    prev.spCost === next.spCost &&
    prev.name === next.name &&
    prev.img === next.img &&
    prev.color === next.color &&
    prev.selected === next.selected &&
    prev.onClick === next.onClick &&
    prev.multiplier === next.multiplier &&                
    prevIns === nextIns &&
    prevDisable === nextDisable
  )
})

export default BattleButton
