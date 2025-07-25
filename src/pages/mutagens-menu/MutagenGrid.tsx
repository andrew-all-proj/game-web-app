import React from 'react'
import styles from './MutagenGrid.module.css'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import { UserInventory } from '../../types/GraphResponse'

interface MutagenGridProps {
  userInventories: UserInventory[]
}

const ROWS = 5
const COLS = 4
const TOTAL_CELLS = ROWS * COLS

export const MutagenGrid: React.FC<MutagenGridProps> = ({ userInventories }) => {
  const mutagenItems: (UserInventory | null)[] = userInventories.flatMap((inv) =>
    Array.from({ length: inv.quantity }, () => inv),
  )

  while (mutagenItems.length < TOTAL_CELLS) {
    mutagenItems.push(null)
  }

  console.log(mutagenItems)

  return (
    <div className={styles.grid}>
      {mutagenItems.slice(0, TOTAL_CELLS).map((cell, idx) =>
        cell ? (
          <div className={styles.card} key={cell.id + '-' + idx}>
            <img
              src={cell.mutagen?.iconFile?.name || mutagenIcon}
              alt={cell.mutagen?.name || 'mutagen'}
              className={styles.icon}
            />
          </div>
        ) : (
          <div className={styles.card} key={'empty-' + idx} />
        ),
      )}
    </div>
  )
}

export default MutagenGrid
