import { JSX } from 'react'
import { MonsterApplyMutagenResponse } from '../../types/GraphResponse'

export const GetMonsterNewCharacteristicLines = (
  newChar?: MonsterApplyMutagenResponse | null,
): JSX.Element | null => {
  if (!newChar) return null

  const lines: JSX.Element[] = []

  if (newChar.defense) {
    lines.push(
      <div key="defense">
        Защита {newChar.oldDefense} → {newChar.defense}
      </div>,
    )
  }
  if (newChar.strength) {
    lines.push(
      <div key="strength">
        Сила {newChar.oldStrength} → {newChar.strength}
      </div>,
    )
  }
  if (newChar.evasion) {
    lines.push(
      <div key="evasion">
        Уклонение {newChar.oldEvasion} → {newChar.evasion}
      </div>,
    )
  }

  return lines.length > 0 ? <>{lines}</> : null
}
