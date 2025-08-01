import React, { useRef, useState } from 'react'
import styles from './MutagenGrid.module.css'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'
import { UserInventory } from '../../types/GraphResponse'

interface MutagenGridProps {
  userInventories: UserInventory[]
  onSelect?: (item: UserInventory, idx: number) => void
  onDoubleClick?: (item: UserInventory, idx: number) => void
}

const ROWS = 5
const COLS = 4
const TOTAL_CELLS = ROWS * COLS

export const MutagenGrid: React.FC<MutagenGridProps> = ({
  userInventories,
  onSelect,
  onDoubleClick,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const clickTimeout = useRef<NodeJS.Timeout | null>(null)

  const mutagenInventories = userInventories.filter((inv) => inv.mutagen)
  const mutagenItems: (UserInventory | null)[] = mutagenInventories.flatMap((inv) =>
    Array.from({ length: inv.quantity }, () => inv),
  )
  while (mutagenItems.length < TOTAL_CELLS) mutagenItems.push(null)

  const handleCardClick = (cell: UserInventory, idx: number) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
      // double click
      onDoubleClick?.(cell, idx)
      return
    }
    clickTimeout.current = setTimeout(() => {
      setSelectedIdx(idx)
      onSelect?.(cell, idx)
      clickTimeout.current = null
    }, 200)
  }

  return (
    <div className={styles.grid}>
      {mutagenItems.slice(0, TOTAL_CELLS).map((cell, idx) =>
        cell ? (
          <div
            className={`${styles.card} ${selectedIdx === idx ? styles.selected : ''}`}
            key={cell.id + '-' + idx}
            onClick={() => handleCardClick(cell, idx)}
          >
            <img
              src={cell.mutagen?.iconFile?.url || mutagenIcon}
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
