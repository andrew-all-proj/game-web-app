import { SpriteAtlas } from '../types/sprites'
import { SelectedParts } from '../pages/create-monster/ConstructorMonster'

export async function assembleMonsterCanvas(
  selected: SelectedParts,
  spriteAtlas: SpriteAtlas,
  spriteSheets: string,
): Promise<HTMLCanvasElement> {
  const body = selected.body!
  const head = selected.head
  const leftArm = selected.leftArm
  const rightArm = selected.rightArm

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context not available')

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => resolve(img)
      img.onerror = reject
    })
  }
  const img = await loadImage(spriteSheets)

  const bodyW = body.frameSize.w
  const bodyH = body.frameSize.h

  let minX = 0,
    minY = 0,
    maxX = bodyW,
    maxY = bodyH

  if (head) {
    const attach = spriteAtlas.frames[body.key]?.points?.attachToHead || { x: 0, y: 0 }
    const headX = attach.x - head.attachPoint.x
    const headY = attach.y - head.attachPoint.y
    minX = Math.min(minX, headX)
    minY = Math.min(minY, headY)
    maxX = Math.max(maxX, headX + head.frameSize.w)
    maxY = Math.max(maxY, headY + head.frameSize.h)
  }

  if (leftArm) {
    const attach = spriteAtlas.frames[body.key]?.points?.attachLeftArm || { x: 0, y: 0 }
    const armX = attach.x - leftArm.attachPoint.x
    const armY = attach.y - leftArm.attachPoint.y
    minX = Math.min(minX, armX)
    minY = Math.min(minY, armY)
    maxX = Math.max(maxX, armX + leftArm.frameSize.w)
    maxY = Math.max(maxY, armY + leftArm.frameSize.h)
  }

  if (rightArm) {
    const attach = spriteAtlas.frames[body.key]?.points?.attachRightArm || { x: 0, y: 0 }
    const armX = attach.x - rightArm.attachPoint.x
    const armY = attach.y - rightArm.attachPoint.y
    minX = Math.min(minX, armX)
    minY = Math.min(minY, armY)
    maxX = Math.max(maxX, armX + rightArm.frameSize.w)
    maxY = Math.max(maxY, armY + rightArm.frameSize.h)
  }

  const width = maxX - minX
  const height = maxY - minY

  canvas.width = width
  canvas.height = height

  const bodyDx = -minX
  const bodyDy = -minY

  // Left Arm
  if (leftArm) {
    const { x, y, w, h } = leftArm.frameSize
    const attachBody = spriteAtlas.frames[body.key]?.points?.attachLeftArm || { x: 0, y: 0 }
    const dx = bodyDx + attachBody.x - leftArm.attachPoint.x
    const dy = bodyDy + attachBody.y - leftArm.attachPoint.y
    ctx.drawImage(img, x, y, w, h, dx, dy, w, h)
  }

  // Body
  {
    const { x, y, w, h } = body.frameSize
    ctx.drawImage(img, x, y, w, h, bodyDx, bodyDy, w, h)
  }

  // Head
  if (head) {
    const { x, y, w, h } = head.frameSize
    const attach = spriteAtlas.frames[body.key]?.points?.attachToHead || { x: 0, y: 0 }
    const dx = bodyDx + attach.x - head.attachPoint.x
    const dy = bodyDy + attach.y - head.attachPoint.y
    ctx.drawImage(img, x, y, w, h, dx, dy, w, h)
  }

  // Right Arm
  if (rightArm) {
    const { x, y, w, h } = rightArm.frameSize
    const attachBody = spriteAtlas.frames[body.key]?.points?.attachRightArm || { x: 0, y: 0 }
    const dx = bodyDx + attachBody.x - rightArm.attachPoint.x
    const dy = bodyDy + attachBody.y - rightArm.attachPoint.y
    ctx.drawImage(img, x, y, w, h, dx, dy, w, h)
  }

  return canvas
}
