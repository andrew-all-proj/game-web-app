import { useEffect, useRef, useState } from 'react';
import monsterImage from '../../assets/images/monster.png';

export default function AnimatedMonster() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(null);
  const angle = useRef(0);
  const isAnimationRunning = useRef(true);

  const [health, setHealth] = useState(100);
  const [isHit, setIsHit] = useState(false);
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = new Image();
    img.src = monsterImage;

    const width = 300;
    const height = 300;
    const amplitude = (width - 100) / 2;
    const offset = amplitude;

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const x = Math.sin(angle.current) * amplitude + offset;
      const shakeX = isHit && health > 0 ? Math.random() * 10 - 5 : 0;
      const shakeY = isHit && health > 0 ? Math.random() * 10 - 5 : 0;

      if (isHit && health > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
      }

      if (health > 0) {
        ctx.drawImage(img, x + shakeX, 80 + shakeY, 100, 100);
        angle.current += 0.03;
      } else {
        // Game Over: монстр лежит
        ctx.save();
        ctx.translate(x + 50, 130);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -50, -50, 100, 100);
        ctx.restore();

        // Текст Game Over
        ctx.fillStyle = 'red';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💀 GAME OVER 💀', width / 2, 50);

        isAnimationRunning.current = false;
        setShowRestart(true);
        return; // стоп отрисовку
      }

      if (isAnimationRunning.current) {
        requestRef.current = requestAnimationFrame(draw);
      }
    };

    img.onload = () => {
      isAnimationRunning.current = true;
      draw();
    };

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isHit, health]);

  const handleHit = () => {
    if (health <= 0) return;
    setHealth((prev) => Math.max(0, prev - 10));
    setIsHit(true);
    setTimeout(() => setIsHit(false), 200);
  };

  const handleRestart = () => {
    setHealth(100);
    angle.current = 0;
    setIsHit(false);
    setShowRestart(false);
    isAnimationRunning.current = true;
    const img = new Image();
    img.src = monsterImage;
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) requestRef.current = requestAnimationFrame(() => drawFrame(ctx, img));
    };
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const width = 300;
    const height = 300;
    const amplitude = (width - 100) / 2;
    const offset = amplitude;

    ctx.clearRect(0, 0, width, height);

    const x = Math.sin(angle.current) * amplitude + offset;

    const shakeX = isHit ? Math.random() * 10 - 5 : 0;
    const shakeY = isHit ? Math.random() * 10 - 5 : 0;

    ctx.drawImage(img, x + shakeX, 80 + shakeY, 100, 100);
    angle.current += 0.03;

    if (isAnimationRunning.current) {
      requestRef.current = requestAnimationFrame(() => drawFrame(ctx, img));
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} width={300} height={300} />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleHit} disabled={health <= 0}>Ударить</button>
        <p>❤️ Здоровье: {health}</p>
        {showRestart && (
          <button onClick={handleRestart} style={{ marginTop: 10 }}>
            🔁 Сыграть снова
          </button>
        )}
      </div>
    </div>
  );
}