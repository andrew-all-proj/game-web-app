import { useMemo, useState, useCallback } from 'react'
import BattleButton from '../../components/Button/BattleButton'
import { Skill } from '../../types/GraphResponse'
import iconAttack from '../../assets/icon/icon_attack.svg'
import iconDefence from '../../assets/icon/icon_defence.svg'
import iconEmpty from '../../assets/icon/union-icon.svg'
import styles from './BottomBattleMenu.module.css'

interface BottomBattlteMenuProps {
  myAttacks: Skill[]
  myDefenses: Skill[]
  availableSp: number
  onConfirm: (attackId: string | null, defenseId: string | null) => void
}

const COLUMNS = 3
const fillRow = <T,>(items: T[]) =>
  items.length >= COLUMNS
    ? items.slice(0, COLUMNS)
    : [...items, ...Array.from({ length: COLUMNS - items.length }, () => null as unknown as T)]

const BottomBattlteMenu = ({
  myAttacks,
  myDefenses,
  availableSp,
  onConfirm,
}: BottomBattlteMenuProps) => {
  const attackRow = useMemo(() => fillRow(myAttacks ?? []), [myAttacks])
  const defenseRow = useMemo(() => fillRow(myDefenses ?? []), [myDefenses])

  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null)
  const [selectedDefenseId, setSelectedDefenseId] = useState<string | null>(null)

  const selectedAttack = useMemo(
    () => attackRow.find((a) => a && a.id === selectedAttackId) || null,
    [attackRow, selectedAttackId],
  )
  const selectedDefense = useMemo(
    () => defenseRow.find((d) => d && d.id === selectedDefenseId) || null,
    [defenseRow, selectedDefenseId],
  )

  const totalCost = (selectedAttack?.energyCost ?? 0) + (selectedDefense?.energyCost ?? 0)
  const canConfirm =
    (selectedAttackId !== null || selectedDefenseId !== null) && totalCost <= availableSp

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return
    onConfirm(selectedAttackId, selectedDefenseId)
    setSelectedAttackId(null)
    setSelectedDefenseId(null)
  }, [canConfirm, onConfirm, selectedAttackId, selectedDefenseId])

  return (
    <div className={styles.bottomBattlteMenu}>
      {attackRow.map((attack, idx) =>
        attack ? (
          <BattleButton
            key={`a-${idx}-${attack.id}`}
            spCost={attack.energyCost}
            name={attack.name || 'Attack'}
            color={'var(--pink-secondary-color)'}
            img={attack.iconFile?.url || iconAttack}
            availableSp={availableSp}
            selected={selectedAttackId === attack.id}
            onClick={() => setSelectedAttackId((prev) => (prev === attack.id ? null : attack.id))}
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
        ),
      )}

      {defenseRow.map((defense, idx) =>
        defense ? (
          <BattleButton
            key={`d-${idx}-${defense.id}`}
            spCost={defense.energyCost}
            name={defense.name || 'Defense'}
            img={defense.iconFile?.url || iconDefence}
            color={'var(--orange-secondary-color)'}
            availableSp={availableSp}
            selected={selectedDefenseId === defense.id}
            onClick={() =>
              setSelectedDefenseId((prev) => (prev === defense.id ? null : defense.id))
            }
          />
        ) : (
          <BattleButton
            key={`d-empty-${idx}`}
            spCost={0}
            name=""
            img={iconEmpty}
            color={'var(--orange-secondary-color)'}
            onClick={undefined}
          />
        ),
      )}

      <div className={styles.decorElement}></div>
      <button
        className={styles.confirmBtn}
        disabled={!canConfirm}
        onClick={handleConfirm}
        aria-disabled={!canConfirm}
        aria-label="Подтвердить выбор"
      >
        ✓
      </button>
    </div>
  )
}

export default BottomBattlteMenu
