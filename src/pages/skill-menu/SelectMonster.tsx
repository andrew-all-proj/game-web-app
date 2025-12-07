import styles from './SelectMonster.module.css'
import MainButton from '../../components/Button/MainButton'
import { Monster } from '../../types/GraphResponse'
import CardMenuMonster from '../../components/CardMenuMonster/CardMenuMonster'
import { useTranslation } from 'react-i18next'

type SelectMonsterProps = {
  monsters: Monster[]
  onSelectMonster: (monster: Monster) => void
  onClose: () => void
}

const SelectMonster = ({ monsters, onClose, onSelectMonster }: SelectMonsterProps) => {
  const { t } = useTranslation()
  return (
    <div className={styles.content}>
      {monsters.map((monster) => (
        <CardMenuMonster
          key={monster.id}
          url={monster?.avatar || ''}
          level={monster.level || 0}
          onButtonClick={() => onSelectMonster(monster)}
          textButton={t('skillMenu.choose')}
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
          {t('skillMenu.back')}
        </MainButton>
      </div>
    </div>
  )
}

export default SelectMonster
