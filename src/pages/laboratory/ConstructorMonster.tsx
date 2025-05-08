import { useEffect, useRef, useState } from 'react';
import monsterSprite from '../../assets/images/parts_monster.svg';

const controlStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    flexWrap: 'wrap',
    margin: '5px'
  };

const selectedButtonStyle: React.CSSProperties = {
  backgroundColor: '#4caf50',
  color: 'white',
  border: '2px solid #388e3c',
};

type PartName =
  | 'head'
  | 'body'
  | 'leftArm'
  | 'rightArm'
  | 'rightLeg'
  | 'leftLeg';

type Part = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  rotate?: number;
};

const listParts: Record<PartName, Part[]> = {
  head: [
    { sx: 37, sy: 375, sw: 100, sh: 60, dx: 130, dy: 28, dw: 100, dh: 60 },
    { sx: 160, sy: 375, sw: 100, sh: 60, dx: 130, dy: 28, dw: 100, dh: 60 },
    { sx: 302, sy: 375, sw: 100, sh: 60, dx: 130, dy: 28, dw: 100, dh: 60 }
  ],
  body: [
    { sx: 37, sy: 85, sw: 100, sh: 190, dx: 130, dy: 80, dw: 100, dh: 190 },
    { sx: 160, sy: 85, sw: 100, sh: 190, dx: 120, dy: 80, dw: 100, dh: 190 },
    { sx: 302, sy: 85, sw: 100, sh: 190, dx: 130, dy: 80, dw: 100, dh: 190 }
  ],
  leftArm: [
    { sx: 37, sy: 490, sw: 100, sh: 160, dx: 80, dy: 110, dw: 100, dh: 160, rotate: Math.PI / 6 },
    { sx: 160, sy: 490, sw: 100, sh: 160, dx: 80, dy: 120, dw: 100, dh: 160, rotate: Math.PI / 6 },
    { sx: 302, sy: 490, sw: 100, sh: 160, dx: 80, dy: 110, dw: 100, dh: 160, rotate: Math.PI / 6 }
  ],
  rightArm: [
    { sx: 37, sy: 490, sw: 100, sh: 160, dx: 230, dy: 80, dw: 100, dh: 160, rotate: -Math.PI / 6 },
    { sx: 160, sy: 490, sw: 100, sh: 160, dx: 230, dy: 80, dw: 100, dh: 160, rotate: -Math.PI / 6 },
    { sx: 302, sy: 490, sw: 100, sh: 160, dx: 230, dy: 80, dw: 100, dh: 160, rotate: -Math.PI / 6 }
  ],
  rightLeg: [
    { sx: 37, sy: 700, sw: 100, sh: 160, dx: 140, dy: 240, dw: 100, dh: 160 },
    { sx: 160, sy: 700, sw: 100, sh: 160, dx: 140, dy: 240, dw: 100, dh: 160 },
    { sx: 302, sy: 700, sw: 100, sh: 160, dx: 140, dy: 240, dw: 100, dh: 160 }
  ],
  leftLeg: [
    { sx: 37, sy: 700, sw: 100, sh: 160, dx: 190, dy: 240, dw: 100, dh: 160 },
    { sx: 160, sy: 700, sw: 100, sh: 160, dx: 190, dy: 240, dw: 100, dh: 160 },
    { sx: 302, sy: 700, sw: 100, sh: 160, dx: 190, dy: 240, dw: 100, dh: 160 }
  ]
};

export default function ConstructorMonster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [typePart, setTypePart] = useState<PartName | ''>('');
  const [count, setCount] = useState(0);
  const [selectedParts, setSelectedParts] = useState<Partial<Record<PartName, Part>>>({});

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    if (!ctx || !image) return;

    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(selectedParts).forEach((part) => {
      if (!part) return;
      ctx.save();
      if (part.rotate) {
        ctx.translate(part.dx + part.dw / 2, part.dy + part.dh / 2);
        ctx.rotate(part.rotate);
        ctx.drawImage(
          image,
          part.sx, part.sy, part.sw, part.sh,
          -part.dw / 2, -part.dh / 2, part.dw, part.dh
        );
      } else {
        ctx.drawImage(
          image,
          part.sx, part.sy, part.sw, part.sh,
          part.dx, part.dy, part.dw, part.dh
        );
      }
      ctx.restore();
    });
  };

  const selectPart = (direction: 'left' | 'right') => {
    if (!typePart) return;
    const parts = listParts[typePart];
    const newIndex = (direction === 'left')
      ? (count - 1 + parts.length) % parts.length
      : (count + 1) % parts.length;

    setCount(newIndex);
    setSelectedParts((prev) => ({ ...prev, [typePart]: parts[newIndex] }));
  };

  const handleTypeChange = (part: PartName) => {
    setTypePart(part);
    setCount(0);
    setSelectedParts((prev) => ({ ...prev, [part]: listParts[part][0] }));
  };

  useEffect(() => {
    const img = new Image();
    img.src = monsterSprite;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
  }, []);

  useEffect(() => {
    draw();
  }, [selectedParts]);

  return (
    <>
      <canvas ref={canvasRef} width={300} height={400} style={{ border: '1px solid #333', margin: '20px auto', display: 'block', backgroundColor: '#f0f0f0' }} />
      
      <div className="controls" style={controlStyle}>
      {(['head', 'body', 'leftArm', 'rightArm', 'rightLeg', 'leftLeg'] as PartName[]).map(part => (
        <button
          key={part}
          onClick={() => handleTypeChange(part)}
          style={typePart === part ? selectedButtonStyle : undefined}
        >
          {part}
        </button>
      ))}

      </div>

      <div className="controls" style={controlStyle}>
        <button onClick={() => selectPart('left')}>Left</button>
        <button onClick={() => selectPart('right')}>Right</button>
      </div>
    </>
  );
}

