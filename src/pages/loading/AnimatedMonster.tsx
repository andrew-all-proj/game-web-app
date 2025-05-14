// import { useEffect, useRef } from 'react';
// import monsterSprite from '../../assets/images/monster.png';

// export default function AnimatedMonster() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const requestRef = useRef<number | null>(null);
//   const frameIndex = useRef(0);
//   const lastFrameTime = useRef(0);
//   const positionX = useRef(0);
//   const direction = useRef(1); // 1 = вправо, -1 = влево

//   const columns = 4;
//   const rows = 1;
//   const frameWidth = 252;
//   const frameHeight = 350;
//   const frameDuration = 200;
//   const speed = 2;
//   const scale = 0.5;

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');
//     const image = new Image();
//     image.src = monsterSprite;

//     const render = (time: number) => {
//       if (!ctx || !canvas) return;

//       if (time - lastFrameTime.current > frameDuration) {
//         frameIndex.current = (frameIndex.current + 1) % (columns * rows);
//         lastFrameTime.current = time;
//       }

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const col = frameIndex.current % columns;
//       const row = Math.floor(frameIndex.current / columns);

//       const drawWidth = frameWidth * scale;
//       const drawHeight = frameHeight * scale;

//       ctx.save();

//       // Позиционирование по центру по Y
//       const posY = canvas.height / 2 - drawHeight / 2;

//       if (direction.current === -1) {
//         // Разворот влево
//         ctx.translate(positionX.current + drawWidth, posY);
//         ctx.scale(-1, 1);
//       } else {
//         // Вправо
//         ctx.translate(positionX.current, posY);
//       }

//       ctx.drawImage(
//         image,
//         col * frameWidth,
//         row * frameHeight,
//         frameWidth,
//         frameHeight,
//         0,
//         0,
//         drawWidth,
//         drawHeight
//       );

//       ctx.restore();

//       positionX.current += speed * direction.current;

//       if (
//         positionX.current + drawWidth > canvas.width ||
//         positionX.current < 0
//       ) {
//         direction.current *= -1;
//       }

//       requestRef.current = requestAnimationFrame(render);
//     };

//     image.onload = () => {
//       requestRef.current = requestAnimationFrame(render);
//     };

//     return () => {
//       if (requestRef.current) cancelAnimationFrame(requestRef.current);
//     };
//   }, []);

//   return <canvas ref={canvasRef} width={600} height={350} />;
// }
