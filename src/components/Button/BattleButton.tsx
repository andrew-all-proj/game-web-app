import React from 'react'
import styles from './BattleButton.module.css'

interface BattleButtonProps {
  spCost: number
  name: string
 // modifier: number
  img: string
  onClick?: () => void
  color?: string            
  selected?: boolean        
}

const BattleButton: React.FC<BattleButtonProps> = ({
  spCost, name, img, onClick, color, selected,
}) => {
  const styleVars: React.CSSProperties = color ? { ['--btn-color' as any]: color } : {}

  return (
    <div
      className={`${styles.attackButton} ${selected ? styles.attackButtonSelected : ''}`}
      style={styleVars}
      onClick={onClick}
      role="button"
      aria-pressed={!!selected}
    >
      <div className={styles.attackSp}>SP {spCost}</div>
      <div className={styles.attackContent}>
        <img alt={name} src={img}/>
      </div>
    </div>
  )
}

export default BattleButton
