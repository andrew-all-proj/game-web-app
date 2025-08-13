import { UserInventory } from '../../types/GraphResponse'
import styles from './CardsApplyEnergy.module.css'
import labIcon from '../../assets/icon/lab-icon.svg'

interface CardApplyEnergyProps {
  inventories: UserInventory[]
  onButtonClick: (userInventory: UserInventory) => void
}

export default function CardsApplyEnergy({ inventories, onButtonClick }: CardApplyEnergyProps) {
  return (
    <div className={styles.cardsApplyEnergy}>
      {inventories.map((inv) => {
        const qty = inv.quantity ?? 0
        return (
          <div className={styles.cardApplyEnergy} key={inv.id}>
            <div className={styles.wrapperImage}>
              <span className={styles.qtyBadge}>{qty}</span>
              <img className={styles.monsterImage} alt="energy" src={labIcon} />
            </div>

            <div className={styles.energyInfo}>
              <span>{inv.energy?.name ?? 'Энергия'}</span>
              <span>+{inv.energy?.quantity ?? 0}</span>
            </div>

            <div className={styles.buttonWrapper}>
              <button
                className={styles.energyButton}
                onClick={() => onButtonClick(inv)}
                disabled={qty <= 0}
              >
                Применить
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
