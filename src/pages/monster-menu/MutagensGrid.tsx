import SimpleBar from 'simplebar-react'
import { UserInventoryTypeEnum } from '../../types/enums/UserInventoryTypeEnum'
import { UserInventory } from '../../types/GraphResponse'
import styles from './PartSelectorMonsterMenu.module.css'
import mutagenIcon from '../../assets/icon/icon_mutagen.svg'

interface Props {
  inventory: UserInventory[]
  onSelectInventory: (inv: UserInventory) => void
}

export default function MutagensGrid({ inventory, onSelectInventory }: Props) {
  const mutagens = inventory.filter(
    (i) => i.userInventoryType === UserInventoryTypeEnum.MUTAGEN && i.mutagen,
  )

  const expanded = mutagens.flatMap((inv) =>
    Array.from({ length: inv.quantity ?? 1 }, (_, k) => ({ inv, k })),
  )

  const rows = 2
  const columns = 4

  const minRows = Math.max(rows, 2)
  const minSlots = minRows * columns
  const fullRowsCount = Math.ceil(expanded.length / columns) * columns
  const padTo = Math.max(fullRowsCount, minSlots)

  const items: ({ inv: UserInventory; k: number } | null)[] = [
    ...expanded,
    ...Array.from({ length: padTo - expanded.length }, () => null),
  ]

  const needsScroll = expanded.length > minSlots

  const Grid = (
    <div
      className={styles.gridWrapperMutagens}
      style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
    >
      {items.map((item, i) => (
        <div
          key={item ? `${item.inv.id}-${item.k}` : `empty-${i}`}
          className={`${styles.partItem} ${item ? '' : styles.partItemEmpty}`}
          onClick={() => {
            if (!item) return
            onSelectInventory(item.inv)
          }}
        >
          {item ? (
            <img
              className={styles.partItemImg}
              alt={item.inv.mutagen?.name || 'mutagen'}
              src={item.inv.mutagen?.iconFile?.url || mutagenIcon}
              width={56}
              height={56}
            />
          ) : (
            <div style={{ width: '100%', height: '100%' }} />
          )}
        </div>
      ))}
    </div>
  )

  if (!needsScroll) {
    return <div className={styles.gridViewport}>{Grid}</div>
  }

  return <SimpleBar className={styles.scrollArea}>{Grid}</SimpleBar>
}
