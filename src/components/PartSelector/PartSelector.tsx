import { useEffect, useMemo, useRef } from 'react'
import styles from './PartSelector.module.css'

interface PartTypeAvatar {
  part: string
  icon: string
}

interface TabItem {
  key: string
  text?: string
  icon?: string
  alt?: string
  parts: PartTypeAvatar[]
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

/** Совместимо с форматом JSON Hash (Spritesmith/TexturePacker-подобный) */
type AtlasFrame = {
  frame: { x: number; y: number; w: number; h: number }
  rotated?: boolean
  trimmed?: boolean
  spriteSourceSize?: { x: number; y: number; w: number; h: number }
  sourceSize?: { w: number; h: number }
}

interface PartSelectorProps {
  tabs: TabItem[]
  rows?: number
  columns?: number
  activeTab: string
  onTabChange: (tabKey: string) => void
  setIsEditing: (value: boolean) => void

  /** Новое: общий PNG-спрайт */
  spriteImg: HTMLImageElement | null
  /** Новое: получить фрейм по имени (ключу в atlas.frames) */
  getFrame: (name: string) => AtlasFrame | null

  /** Размер иконки в гриде (по умолчанию 56x56) */
  iconSize?: number
}

/** Рисуем один кадр-иконку в <canvas> */
function CanvasIcon({
  spriteImg,
  getFrame,
  frameName,
  size = 56,
}: {
  spriteImg: HTMLImageElement | null
  getFrame: (name: string) => AtlasFrame | null
  frameName: string
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !spriteImg) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const f = getFrame(frameName)
    if (!f) return

    const { x, y, w, h } = f.frame

    // Поддержка ротации кадров (на всякий случай)
    const rotated = Boolean(f.rotated)

    // Вписываем фрейм пропорционально в квадрат size x size
    const scale = Math.min(size / w, size / h)
    const dw = Math.max(1, Math.round(w * scale))
    const dh = Math.max(1, Math.round(h * scale))
    const dx = Math.round((size - dw) / 2)
    const dy = Math.round((size - dh) / 2)

    if (!rotated) {
      ctx.drawImage(spriteImg, x, y, w, h, dx, dy, dw, dh)
    } else {
      // если rotated = true, обычно означает поворот на 90° в атласе
      // поворачиваем канвас и рисуем соответствующе
      ctx.save()
      ctx.translate(dx + dw / 2, dy + dh / 2)
      ctx.rotate(-Math.PI / 2)
      // меняем местами w/h при отрисовке
      ctx.drawImage(spriteImg, x, y, h, w, -dh / 2, -dw / 2, dh, dw)
      ctx.restore()
    }
  }, [spriteImg, getFrame, frameName, size])

  return <canvas ref={canvasRef} width={size} height={size} className={styles.partItemCanvas} />
}

export default function PartSelector({
  tabs,
  rows = 2,
  columns = 4,
  activeTab,
  onTabChange,
  setIsEditing,
  spriteImg,
  getFrame,
  iconSize = 56,
}: PartSelectorProps) {
  const currentTab = useMemo(() => tabs.find((tab) => tab.key === activeTab), [tabs, activeTab])

  const parts = currentTab?.parts || []
  const selectedIndex = currentTab?.selectedIndex ?? -1
  const onSelect = currentTab?.setSelectedIndex ?? (() => {})

  const totalSlots = rows * columns
  const fullParts: (PartTypeAvatar | null)[] = useMemo(() => {
    const arr: (PartTypeAvatar | null)[] = [...parts]
    while (arr.length < totalSlots) arr.push(null)
    return arr
  }, [parts, totalSlots])

  return (
    <div className={styles.selectPart}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`${styles.tabIcon} ${activeTab === tab.key ? styles.activeTab : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon && <img src={tab.icon} alt={tab.alt || ''} className={styles.tabIconImage} />}
            {tab.text && <span className={styles.tabText}>{tab.text}</span>}
          </div>
        ))}
      </div>

      <div
        className={styles.gridWrapper}
        style={{
          gridTemplateColumns: `repeat(${columns}, max-content)`,
        }}
      >
        {fullParts.map((part, i) => {
          const isActive = part && i === selectedIndex
          return (
            <div
              key={part?.icon || `empty-${i}`}
              className={`${styles.partItem} ${isActive ? styles.active : ''}`}
              onClick={() => {
                if (part) {
                  onSelect(i)
                  setIsEditing(false)
                }
              }}
            >
              {part ? (
                <CanvasIcon
                  spriteImg={spriteImg}
                  getFrame={getFrame}
                  frameName={part.icon}    // показываем именно ИКОНКУ
                  size={iconSize}
                />
              ) : (
                <div style={{ width: iconSize, height: iconSize }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
