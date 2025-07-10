import React from 'react'
import style from './BattleButton.module.css'

interface BattleButtonProps {
  spCost: number
  name: string
  modifier: number
  onClick?: () => void
}

const BattleButton: React.FC<BattleButtonProps> = ({ spCost, name, modifier, onClick }) => {
  return (
    <div className={style['attack-button']} onClick={onClick}>
      <div className={style['attack-sp']}>SP {spCost}</div>
      <div className={style['attack-content']}>
        <div>{name}</div>
        <div>x{modifier}</div>
      </div>
    </div>
  )
}

export default BattleButton
