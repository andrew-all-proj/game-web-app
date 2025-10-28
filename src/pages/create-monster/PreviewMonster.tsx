import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { PartPreviews } from './CreateMonster'
import { SpriteAtlas as BaseSpriteAtlas } from '../../types/sprites'
import type { SelectedParts } from './CreateMonster'
import styles from './PreviewMonster.module.css'

type AtlasFrameRecord = {
  frame: { x: number; y: number; w: number; h: number }
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

const SCALE = 1

function centerPart(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  scale: number,
): { x: number; y: number } {
  const drawW = w * scale
  const drawH = h * scale
  const x = Math.round((canvas.clientWidth - drawW) / 0.8)
  const y = Math.round((canvas.clientHeight - drawH) / 2)
  return { x, y }
}

export default function PreviewMonster({
  spriteAtlas,
  spriteSheets,
  selectedParts,
  canvasRef,
}: MonsterPreviewProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)

  useEffect(() => {
    let revoke: string | null = null
    if (!spriteSheets) {
      setImgUrl(null)
      return
    }

    ;(async () => {
      const res = await fetch(spriteSheets)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      revoke = url
      setImgUrl(url)
    })()

    return () => {
      if (revoke) {
        URL.revokeObjectURL(revoke)
      }
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
    x: number,
    y: number,
    scale: number,
  ) => {
    const rec = spriteAtlas?.frames?.[frameName]
    if (!rec) return
    const { x: sx, y: sy, w, h } = rec.frame
    ctx.drawImage(img, sx, sy, w, h, x, y, w * scale, h * scale)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas || !spriteAtlas || !atlasImage) return
    const ctx = canvas.getContext('2d')
    if (!ctx || !atlasImage.complete) return

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()

    const partsToDraw = [
      selectedParts.body,
      selectedParts.head,
      selectedParts.leftArm,
      selectedParts.rightArm,
    ].filter(Boolean)

    for (const part of partsToDraw) {
      const stayFrame = getStayFrame(part!.key)
      if (!stayFrame) continue

      const rec = spriteAtlas.frames[stayFrame]
      const { x, y } = centerPart(canvas, rec.frame.w, rec.frame.h, SCALE)

      ctx.imageSmoothingEnabled = false
      drawFrame(ctx, atlasImage, stayFrame, x, y, SCALE)
    }
  }

  useEffect(() => {
    if (!atlasImage) return
    const onLoad = () => draw()
    if (atlasImage.complete) draw()
    else atlasImage.addEventListener('load', onLoad)
    return () => atlasImage.removeEventListener('load', onLoad)
  }, [atlasImage, spriteAtlas])

  useEffect(() => {
    draw()
  }, [spriteAtlas, selectedParts])

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cssW = canvas.clientWidth
    const cssH = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
