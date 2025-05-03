import { useEffect, useRef, useState } from 'react';
import opponentMonster from '../../assets/images/opponent-monster.png';
import yourMonster from '../../assets/images/your-monster.png';
import styles from './TestFight.module.css'

export default function TestFight() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const yourImgRef = useRef<HTMLImageElement | null>(null);
    const opponentImgRef = useRef<HTMLImageElement | null>(null);
    const [yourHealth, setYourHealth] = useState(100);
    const [opponentHealth, setOpponentHealth] = useState(100);

    const [isHit, setIsHit] = useState(false);
  
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
      
        const yourImg = new Image();
        const opponentImg = new Image();
      
        yourImgRef.current = yourImg;
        opponentImgRef.current = opponentImg;
      
        let loadedCount = 0;
      
        const tryDraw = () => {
          loadedCount += 1;
          if (loadedCount === 2) draw();
        };
      
        yourImg.onload = tryDraw;
        opponentImg.onload = tryDraw;
      
        yourImg.src = yourMonster;
        opponentImg.src = opponentMonster;
      
        const draw = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      
          const scale = 0.5;
          const imgWidth = 300;
          const imgHeight = 300;
      
          const yourX = 10;
          const yourY = canvas.height / 2 - (imgHeight * scale) / 2;
      
          const opponentX = canvas.width - imgWidth * scale - 10;
          const opponentY = canvas.height / 2 - (imgHeight * scale) / 2;
      
          ctx.drawImage(yourImg, yourX, yourY, imgWidth * scale, imgHeight * scale);
      
          ctx.save();
          ctx.translate(opponentX + imgWidth * scale, opponentY);
          ctx.scale(-1, 1);
          ctx.drawImage(opponentImg, 0, 0, imgWidth * scale, imgHeight * scale);
          ctx.restore();
        };
      }, []);
      


    const handleAttack = (damage: number) => {
        setOpponentHealth(prev => Math.max(prev - damage, 0));
        setIsHit(true);

        setTimeout(() => setIsHit(false), 300);

        setYourHealth(prev => Math.max(prev - 5, 0))
    };

    useEffect(() => {
        if (!isHit) return;
      
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !yourImgRef.current || !opponentImgRef.current) return;
      
        const scale = 0.5;
        const imgWidth = 300;
        const imgHeight = 300;
      
        const draw = (shake = 0) => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      
          const yourX = 10;
          const yourY = canvas.height / 2 - (imgHeight * scale) / 2;
          const opponentX = canvas.width - imgWidth * scale - 10 + shake;
          const opponentY = canvas.height / 2 - (imgHeight * scale) / 2;
      
          // красный фон
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.fillRect(opponentX - 10, opponentY - 10, imgWidth * scale + 20, imgHeight * scale + 20);
      
          ctx.drawImage(yourImgRef.current!, yourX, yourY, imgWidth * scale, imgHeight * scale);
      
          ctx.save();
          ctx.translate(opponentX + imgWidth * scale, opponentY);
          ctx.scale(-1, 1);
          ctx.drawImage(opponentImgRef.current!, 0, 0, imgWidth * scale, imgHeight * scale);
          ctx.restore();
        };
      
        const interval = setInterval(() => {
          const shake = Math.random() * 8 - 4;
          draw(shake);
        }, 50);
      
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setIsHit(false);
        }, 300);
      
        return () => {
          clearInterval(interval);
          clearTimeout(timeout);
        };
      }, [isHit]);
      
      useEffect(() => {
        if (isHit) return;
      
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas || !yourImgRef.current || !opponentImgRef.current) return;
      
        const scale = 0.5;
        const imgWidth = 300;
        const imgHeight = 300;
      
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        const yourX = 10;
        const yourY = canvas.height / 2 - (imgHeight * scale) / 2;
        const opponentX = canvas.width - imgWidth * scale - 10;
        const opponentY = canvas.height / 2 - (imgHeight * scale) / 2;
      
        ctx.drawImage(yourImgRef.current!, yourX, yourY, imgWidth * scale, imgHeight * scale);
      
        ctx.save();
        if (opponentHealth <= 0) {
          // Поворот на 270° (монстр падает на левый бок)
          ctx.translate(opponentX, opponentY + imgWidth * scale); // смещаем влево и вниз
          ctx.rotate(Math.PI * 1.5); // 270 градусов
          ctx.drawImage(opponentImgRef.current!, 0, 0, imgWidth * scale, imgHeight * scale);
        } else {
          // Обычная отрисовка (стоящий зеркальный монстр)
          ctx.translate(opponentX + imgWidth * scale, opponentY);
          ctx.scale(-1, 1);
          ctx.drawImage(opponentImgRef.current!, 0, 0, imgWidth * scale, imgHeight * scale);
        }
        
        ctx.restore();
      
        if (opponentHealth <= 0) {
          ctx.fillStyle = 'red';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER', canvas.width / 2, 40);
        }
      }, [isHit, opponentHealth]);
      
  
    return (
      <div className={styles.main}>
        <div style={{ marginTop: '70px', position: 'relative', width: 370, height: 290 }}>
          {/* Прогресс-бар твоего монстра */}
          <div className={styles.healthBar} style={{ top: 10, left: 20 }}>
            <div className={styles.healthFill} style={{ width: `${yourHealth}%`, backgroundColor: '#4caf50' }} />
          </div>
  
          {/* Прогресс-бар соперника */}
          <div className={styles.healthBar} style={{ top: 10, right: 20 }}>
            <div className={styles.healthFill} style={{ width: `${opponentHealth}%`, backgroundColor: '#f44336' }} />
          </div>
  
          <canvas ref={canvasRef} width={370} height={290} />
        </div>
  
        <div className={styles.wrapperButton}>
          <button className={styles.attackButton} onClick={() => handleAttack(10)}>Укусить</button>
          <button className={styles.attackButton} onClick={() => handleAttack(15)}>Удар рукой</button>
          <button className={styles.attackButton} onClick={() => handleAttack(20)}>Удар ногой</button>
          <button className={styles.attackButton} onClick={() => handleAttack(25)}>Удар хвостом</button>
        </div>
      </div>
    );
  }
