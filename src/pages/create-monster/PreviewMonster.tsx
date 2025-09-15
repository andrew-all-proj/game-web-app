import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { PartPreviews } from './CreateMonster'
import { SpriteAtlas as BaseSpriteAtlas } from '../../types/sprites'
import type { SelectedParts, SelectedPartInfo } from './CreateMonster'
import styles from './PreviewMonster.module.css'

type AtlasPoints = {
  attachLeftArm?: { x: number; y: number }
  attachRightArm?: { x: number; y: number }
  attachToHead?: { x: number; y: number }
}

type AtlasFrameRecord = {
  frame: { x: number; y: number; w: number; h: number }
  rotated?: boolean
  trimmed?: boolean
  points?: AtlasPoints
}

type SpriteAtlas = Omit<BaseSpriteAtlas, 'frames'> & {
  frames: Record<string, AtlasFrameRecord>
}

interface MonsterPreviewProps {
  spriteAtlas: SpriteAtlas | null
  spriteSheets: string | null
  partPreviews: PartPreviews
  selectedParts: SelectedParts
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

function placeBodyCentered(canvas: HTMLCanvasElement, scale: number) {
  const srcW = 300
  const srcH = 380
  const trimX = 380
  const trimY = 10

  const drawW = srcW * scale
  const drawH = srcH * scale

  const bodyX = Math.round((canvas.clientWidth - drawW) / 2 - trimX * scale)
  const bodyY = Math.round((canvas.clientHeight - drawH) / 2 - trimY * scale)

  return { bodyX, bodyY, scale }
}
const SCALE = 0.2

export default function PreviewMonster({
  spriteAtlas,
  spriteSheets,
  partPreviews,
  selectedParts,
  canvasRef,
}: MonsterPreviewProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)

  useEffect(() => {
    let revoke: string | null = null
    if (!spriteSheets) return
    ;(async () => {
      const res = await fetch(spriteSheets, { mode: 'cors', credentials: 'omit' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      revoke = url
      setImgUrl(url)
    })()
    return () => {
      if (revoke) URL.revokeObjectURL(revoke)
    }
  }, [spriteSheets])

  const atlasImage = useMemo(() => {
    if (!imgUrl) return null
    const img = new Image()
    img.src = imgUrl
    return img
  }, [imgUrl])

  const getStayFrame = (keyOrBase: string): string | null => {
    const frames = spriteAtlas?.frames
    if (!frames) return null
    if (frames[keyOrBase]) return keyOrBase
    const stayIdx = keyOrBase.indexOf('/stay/')
    const baseKey = stayIdx !== -1 ? keyOrBase.slice(0, stayIdx) : keyOrBase.replace(/\/[^/]+$/, '')
    const prefix = `${baseKey}/stay/`
    const names = Object.keys(frames).filter((n) => n.startsWith(prefix))
    if (!names.length) return null
    names.sort()
    return names[0]
  }

  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    frameName: string,
    dx: number,
    dy: number,
    scale: number,
  ) => {
    const rec = spriteAtlas?.frames?.[frameName]
    if (!rec) return
    const { x, y, w, h } = rec.frame
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, x, y, w, h, dx, dy, Math.round(w * scale), Math.round(h * scale))
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !spriteAtlas || !atlasImage) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !atlasImage.complete) return

    // очистка с учётом HiDPI
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    const body = selectedParts.body
    if (!body) return

    const bodyStay = getStayFrame(body.key)
    if (!bodyStay) return

    const bodyRec = spriteAtlas.frames[bodyStay]
    const { bodyX, bodyY, scale } = placeBodyCentered(canvas, SCALE)

    const bodyPointsFromAtlas: AtlasPoints | undefined = bodyRec?.points
    const bodyPoints =
      bodyPointsFromAtlas ??
      partPreviews.body.find((f) => f.key === body.key)?.frameData?.points ??
      undefined
    if (!bodyPoints) return

    const drawPart = (part: SelectedPartInfo | undefined, attach?: { x: number; y: number }) => {
      if (!part || !attach) return
      const stay = getStayFrame(part.key)
      if (!stay) return
      const x = bodyX + (attach.x - part.attachPoint.x) * scale
      const y = bodyY + (attach.y - part.attachPoint.y) * scale
      drawFrame(ctx, atlasImage, stay, x, y, scale)
    }

    drawPart(selectedParts.leftArm, bodyPoints.attachLeftArm)
    drawFrame(ctx, atlasImage, bodyStay, bodyX, bodyY, scale)
    drawPart(selectedParts.head, bodyPoints.attachToHead)
    drawPart(selectedParts.rightArm, bodyPoints.attachRightArm)
  }

  useEffect(() => {
    if (!atlasImage) return
    const onLoad = () => draw()
    if (atlasImage.complete) draw()
    else atlasImage.addEventListener('load', onLoad)
    return () => atlasImage.removeEventListener('load', onLoad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atlasImage, spriteAtlas])

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    spriteAtlas,
    partPreviews,
    selectedParts.body?.key,
    selectedParts.head?.key,
    selectedParts.leftArm?.key,
    selectedParts.rightArm?.key,
  ])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)

    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // рисуем в CSS-пикселях
  }, [])

  return (
    <div className={styles.monsterSlot}>
      <div className={styles.monsterScaleBox}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.dotWrapper}>
          <div className={styles.outerDot}>
            <div className={styles.innerDot} />
          </div>
        </div>
      </div>
    </div>
  )
}
