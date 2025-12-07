import { useEffect, useRef } from 'react'

const SpriteCropper = ({
  spriteSrc,
  frame,
  width = 70,
  height = 70,
}: {
  spriteSrc: string | null
  frame: { x: number; y: number; w: number; h: number }
  width?: number
  height?: number
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!spriteSrc) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = spriteSrc

    const draw = () => {
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, width, height)
      }
    }

    if (img.complete) {
      draw()
    } else {
      img.onload = draw
    }
  }, [spriteSrc, frame, width, height])

  if (!spriteSrc) return null

  return <canvas ref={canvasRef} width={width} height={height} />
}

export default SpriteCropper
