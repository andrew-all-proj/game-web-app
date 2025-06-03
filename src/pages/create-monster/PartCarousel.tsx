import { useEffect, useRef } from 'react';
import styles from './ConstructorMonster.module.css';
import { PartPreviews } from './ConstructorMonster';
import { PartName } from '../../types/sprites';

function SpriteCropper({
    spriteSrc,
    frame,
    width = 64,
    height = 64
  }: {
    spriteSrc: string;
    frame: { x: number; y: number; w: number; h: number };
    width?: number;
    height?: number;
  }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = spriteSrc;
  
      const draw = () => {
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(
            img,
            frame.x, frame.y, frame.w, frame.h,
            0, 0, width, height
          );
        }
      };
  
      if (img.complete) {
        draw();
      } else {
        img.onload = draw;
      }
    }, [spriteSrc, frame, width, height]);
  
    return <canvas ref={canvasRef} width={width} height={height} />;
  }
  

interface PartCarouselProps {
  partPreviews: PartPreviews;
  typePart: PartName;
  count: number;
  handleSelectedPart: (index: number) => void;
  spriteSheets: string;
}

export default function PartCarousel({
  partPreviews,
  typePart,
  count,
  handleSelectedPart,
  spriteSheets,
}: PartCarouselProps) {
  return (
    <div className={styles.carousel}>
      {typePart === 'arms'
        ? partPreviews.arms.map((pair, index) =>
            pair.arm.right ? (
              <div
                key={`right-${index}`}
                className={`${styles.carouselItem} ${index === count ? styles.carouselItemSelected : ''}`}
                onClick={() => handleSelectedPart(index)}
              >
                <SpriteCropper
                  spriteSrc={spriteSheets}
                  frame={pair.arm.right.frameData.frame}
                  width={64}
                  height={64}
                />
              </div>
            ) : null
          )
        : partPreviews[typePart]?.map((frameData, index) => (
            <div
              key={index}
              className={`${styles.carouselItem} ${index === count ? styles.carouselItemSelected : ''}`}
              onClick={() => handleSelectedPart(index)}
            >
              <SpriteCropper
                spriteSrc={spriteSheets}
                frame={frameData.frameData.frame}
                width={64}
                height={64}
              />
            </div>
          ))}
    </div>
  );
}
