import { SpriteAtlas } from '../../types/sprites'
import { PartPreviewEntry, PartPreviews } from './CreateMonster'

export const createPartPreviews = (spriteAtlas: SpriteAtlas): PartPreviews => {
  const newPartPreviews: PartPreviews = { head: [], body: [], arms: [] }
  const armsMap: Record<string, { left?: PartPreviewEntry; right?: PartPreviewEntry }> = {}

  for (const frameName in spriteAtlas.frames) {
    if (frameName.includes('/stay/')) {
      const [category] = frameName.split('/stay/')
      const partData = spriteAtlas.frames[frameName]
      const previewEntry: PartPreviewEntry = { key: frameName, frameData: partData }

      if (category.startsWith('head') && frameName.endsWith('_0')) {
        newPartPreviews.head.push(previewEntry)
      } else if (category.startsWith('body') && frameName.endsWith('_0')) {
        newPartPreviews.body.push(previewEntry)
      } else if (
        (category.startsWith('right_arm') || category.startsWith('left_arm')) &&
        frameName.endsWith('_0')
      ) {
        const splitParts = category.split('/')
        const armSide = splitParts[0]
        const armName = splitParts[1]
        const commonName = armName.replace('left_', '').replace('right_', '')

        if (!armsMap[commonName]) armsMap[commonName] = {}

        if (armSide === 'right_arm') {
          armsMap[commonName].right = previewEntry
        } else if (armSide === 'left_arm') {
          armsMap[commonName].left = previewEntry
        }
      }
    }
  }

  newPartPreviews.arms = Object.values(armsMap)
    .filter(
      (armPair): armPair is { left: PartPreviewEntry; right: PartPreviewEntry } =>
        !!armPair.left && !!armPair.right,
    )
    .map((armPair) => ({ arm: armPair }))

  return newPartPreviews
}
