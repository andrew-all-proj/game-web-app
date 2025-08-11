import styles from './SelectMonster.module.css'
import MainButton from '../../components/Button/MainButton'
import { Monster, UserInventory } from '../../types/GraphResponse'
import CardMenuMonster from '../../components/CardMenuMonster/CardMenuMonster'

type SelectMonsterProps = {
  monsters: Monster[]
  selectedInventory: UserInventory
  onClose: () => void
}

const SelectMonster = ({ monsters, onClose }: SelectMonsterProps) => {
  const handlerSelectMonster = (monster: Monster) => {
    console.log('Selected monster:', monster.id)
  }

  return (
    <div className={styles.content}>
      {monsters.map((monster) => (
        <CardMenuMonster
          key={monster.id}
          url={monster?.avatar || ''}
          level={monster.level || 0}
          onButtonClick={() => handlerSelectMonster(monster)}
          textButton={'Выбрать'}
        >
          <span>{monster.name}</span>
        </CardMenuMonster>
      ))}
      <div className={styles.bottomMenu}>
        <MainButton
          onClick={() => {
            onClose()
          }}
          height={93}
          backgroundColor="var(--green-secondary-color)"
        >
          Назад
        </MainButton>
      </div>
    </div>
  )
}

export default SelectMonster
