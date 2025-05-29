import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import spriteSheets from '../../assets/sprite-sheets/sprite.png';
import spriteAtlasJson from '../../assets/sprite-sheets/sprite-atlas.json';
import MainButton from '../../components/Button/MainButton';
import styles from './ConstructorMonster.module.css';
import PartCarousel from './PartCarousel';

interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AttachmentPoint {
  x: number;
  y: number;
}

interface AttachmentPointPart {
  attachToBody?: AttachmentPoint;
  attachToHead?: AttachmentPoint;
  attachLeftArm?: AttachmentPoint;
  attachRightArm?: AttachmentPoint;
};

interface FrameData {
  frame: FrameRect;
  points: AttachmentPointPart
}

interface SpriteAtlas {
  frames: Record<string, FrameData>;
  meta: {
    image: string;
    size: { w: number; h: number };
    scale: string;
  };
}

interface PartPreviewEntry {
  key: string;
  frameData: FrameData;
}
export interface PartPreviews {
  head: PartPreviewEntry[];
  body: PartPreviewEntry[];
  arms: { arm: { left?: PartPreviewEntry; right?: PartPreviewEntry } }[];
}

export type PartName = 
  'head' | 'body' | 'arms'


interface ConstructorMonsterProps {
  onError: (msg: string) => void;
  saveImage: (monsterName: string, selected: any, partPreviews: any) => void;
}

export interface SelectedPartInfo {
  key: string;
  attachPoint: { x: number; y: number };
  frameSize: { w: number; h: number, x: number, y: number };
}

export interface SelectedParts {
  head?: SelectedPartInfo;
  body?: SelectedPartInfo;
  leftArm?: SelectedPartInfo;
  rightArm?: SelectedPartInfo;
}

  

export default function ConstructorMonster({ onError, saveImage }: ConstructorMonsterProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<Phaser.Scene | null>(null);

  const spriteAtlas: SpriteAtlas = spriteAtlasJson;

  const [typePart, setTypePart] = useState<PartName>('body');
  const [count, setCount] = useState(0);
  const [monsterName, setMonsterName] = useState('');
  const selected = useRef<SelectedParts>({});
  const [partPreviews, setPartPreviews] = useState<PartPreviews>({
    head: [],
    body: [],
    arms: [],
  });

  useEffect(() => {
    const newPartPreviews: PartPreviews = {
      head: [],
      body: [],
      arms: [],
    };
  
    const armsMap: Record<
      string,
      { left?: PartPreviewEntry; right?: PartPreviewEntry }
    > = {};
  
    for (const frameName in spriteAtlas.frames) {
      if (frameName.includes('/stay/')) {
        const [category] = frameName.split('/stay/');
        const partData = spriteAtlas.frames[frameName];
  
        const previewEntry = { key: frameName, frameData: partData };
  
        if (category.startsWith('head') && frameName.endsWith('_0')) {
          newPartPreviews.head.push(previewEntry);
        } else if (category.startsWith('body') && frameName.endsWith('_0')) {
          newPartPreviews.body.push(previewEntry);
        } else if (
          (category.startsWith('right_arm') || category.startsWith('left_arm')) &&
          frameName.endsWith('_0')
        ) {
          const splitParts = category.split('/');
          const armSide = splitParts[0]; // 'right_arm' or 'left_arm'
          const armName = splitParts[1]; // 'right_arm_1' or 'left_arm_1'
          const commonName = armName.replace('left_', '').replace('right_', ''); // 'arm_1'
  
          if (!armsMap[commonName]) armsMap[commonName] = {};
  
          if (armSide === 'right_arm') {
            armsMap[commonName].right = previewEntry;
          } else if (armSide === 'left_arm') {
            armsMap[commonName].left = previewEntry;
          }
        }
      }
    }
  
    newPartPreviews.arms = Object.values(armsMap).map((armPair) => ({
      arm: armPair,
    }));
  
    setPartPreviews(newPartPreviews);
  }, [spriteAtlas]);
  

  const moveSelectedPart = (direction: 'left' | 'right') => {
    const parts = partPreviews[typePart];
    if (!parts || parts.length === 0) return;

    const newIndex =
      direction === 'left'
        ? (count - 1 + parts.length) % parts.length
        : (count + 1) % parts.length;

    handleSelectedPart(newIndex);
  };
  
  const handleSelectedPart = (index: number) => {
    setCount(index);
    const parts = partPreviews[typePart];
    const selectedFrame = parts[index];
    if (typePart === "arms" && 'arm' in selectedFrame) {
        const selectedArmPair = selectedFrame.arm;
        selected.current.leftArm = selectedArmPair.left
            ? {
                  key: selectedArmPair.left.key,
                  attachPoint: selectedArmPair.left.frameData?.points?.attachToBody || { x: 0, y: 0 },
                  frameSize: {
                      w: selectedArmPair.left.frameData?.frame?.w,
                      h: selectedArmPair.left.frameData?.frame?.h,
                      x: selectedArmPair.left.frameData?.frame?.x, 
                      y: selectedArmPair.left.frameData?.frame.y
                  },
              }
            : undefined;

        selected.current.rightArm = selectedArmPair.right
            ? {
                  key: selectedArmPair.right.key,
                  attachPoint: selectedArmPair.right.frameData?.points?.attachToBody || { x: 0, y: 0 },
                  frameSize: {
                      w: selectedArmPair.right.frameData?.frame.w,
                      h: selectedArmPair.right.frameData?.frame.h,
                      x: selectedArmPair.right.frameData?.frame.x,
                      y: selectedArmPair.right.frameData?.frame.y
                  },
              }
            : undefined;
    } else if (typePart !== "arms") {
        const selectedEntry = selectedFrame as PartPreviewEntry;
        selected.current[typePart] = {
            key: selectedEntry.key,
            attachPoint: selectedEntry.frameData?.points?.attachToBody || { x: 0, y: 0 },
            frameSize: {
                w: selectedEntry.frameData?.frame?.w,
                h: selectedEntry.frameData?.frame?.h,
                x: selectedEntry.frameData?.frame?.x,
                y: selectedEntry.frameData?.frame?.y
            },
        };
    }

    if (sceneRef.current) {
        (window as any).updatePhaserDisplay(sceneRef.current);
    }
  };



  const handleSaveClick = () => {
    if (!monsterName.trim()) return onError('Введите имя монстра');
    if(!selected.current.body) return onError('Выберите тело')
    if(!selected.current.head) return onError('Выберите голову')
    if(!selected.current.leftArm) return onError('Выберите руки')
    saveImage(monsterName, selected.current, partPreviews);
  };

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.CANVAS,
      width: 250,
      height: 350,
      parent: gameContainerRef.current,
      scale: {
        mode: Phaser.Scale.NONE,
      },
      scene: { preload, create, update },
    };

    gameRef.current = new Phaser.Game(config);

    function preload(this: Phaser.Scene) {
      this.load.atlas('monster', spriteSheets, spriteAtlas);
    }

    function generateStayAnimations(scene: Phaser.Scene) {
      const stayAnimations: Record<string, string[]> = {};
    
      for (const frameName in spriteAtlas.frames) {
        if (frameName.includes('/stay/')) {
          // Вычисляем базовый ключ (например, body/body_1/stay/body_1)
          const baseKey = frameName.replace(/_\d+$/, ''); // убираем _0, _1, _2...
    
          const animKey = `${baseKey}_stay`;
          if (!stayAnimations[animKey]) stayAnimations[animKey] = [];
          stayAnimations[animKey].push(frameName);
        }
      }
    
      for (const animKey in stayAnimations) {
        const frames = stayAnimations[animKey].sort(); 
      
        scene.anims.create({
          key: animKey,
          frames: frames.map((f) => ({ key: 'monster', frame: f })),
          frameRate: 6,
          repeat: -1,
        });
      }
    }
    
    function create(this: Phaser.Scene) {
      generateStayAnimations(this);
      sceneRef.current = this;
      (window as any).updatePhaserDisplay(this);
    }

    function update() {}

    function updateDisplay(scene: Phaser.Scene) {
      scene.children.removeAll();
  
      const scale = 0.2;
      const bodyX = 0;
      const bodyY = 145;
  
      if (selected.current.body) {
          const bodyKey = selected.current.body.key;
          const bodyFrame = partPreviews.body.find((frame) => frame.key === bodyKey)?.frameData;
          const bodyPoints = bodyFrame?.points;
          const baseBodyKey = bodyKey.replace(/_\d+$/, '');

          // === Draw Left Arm ===
          if (selected.current.leftArm) {
            const leftArmKey = selected.current.leftArm.key;
            const leftArmAttach = selected.current.leftArm.attachPoint;
            const bodyAttach = bodyPoints?.attachLeftArm || { x: 0, y: 0 };
            const baseLeftArmKey = leftArmKey.replace(/_\d+$/, '');

            scene.add.sprite(
                bodyX + (bodyAttach.x  - leftArmAttach.x) * scale,
                bodyY + (bodyAttach.y - leftArmAttach.y) * scale,
                'monster'
            )
                .setOrigin(0, 0)
                .setScale(scale)
                .play(`${baseLeftArmKey}_stay`);
          }
  
          // === Draw Body ===
          scene.add.sprite(bodyX, bodyY, 'monster')
              .setOrigin(0, 0)
              .setScale(scale)
              .play(`${baseBodyKey}_stay`);
  
          // === Draw Right Arm ===
          if (selected.current.rightArm) {
              const rightArmKey = selected.current.rightArm.key;
              const rightArmAttach = selected.current.rightArm.attachPoint;
              const bodyAttach = bodyPoints?.attachRightArm || { x: 0, y: 0 };
              const baseRightArmKey = rightArmKey.replace(/_\d+$/, '');
  
              scene.add.sprite(
                  bodyX + (bodyAttach.x - rightArmAttach.x) * scale,
                  bodyY + (bodyAttach.y - rightArmAttach.y) * scale,
                  'monster'
              )
                  .setOrigin(0, 0)
                  .setScale(scale)
                  .play(`${baseRightArmKey}_stay`);
          }
  
          // === Draw Head ===
          if (selected.current.head) {
              const headKey = selected.current.head.key;
              const headAttach = selected.current.head.attachPoint;
              const bodyAttach = bodyPoints?.attachToHead || { x: 0, y: 0 };
              const baseHeadKey = headKey.replace(/_\d+$/, '');
  
              scene.add.sprite(
                  bodyX + (bodyAttach.x - headAttach.x) * scale,
                  bodyY + (bodyAttach.y  - headAttach.y ) * scale,
                  'monster'
              )
                  .setOrigin(0, 0)
                  .setScale(scale)
                  .play(`${baseHeadKey}_stay`);
          }
      }
  }
  
  

    (window as any).updatePhaserDisplay = updateDisplay;
    

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [partPreviews]);

  return (
    <div>
      <div ref={gameContainerRef} style={{ margin: '20px auto' }} />
      <div>
        <div className={styles.wrapperCreateMenu}>
          <button className={styles.buttonLeftRight} onClick={() => moveSelectedPart('left')}>
            ◀
          </button>
          <PartCarousel
            partPreviews={partPreviews}
            typePart={typePart}
            count={count}
            handleSelectedPart={handleSelectedPart}
            spriteSheets={spriteSheets}
          />
          <button className={styles.buttonLeftRight} onClick={() => moveSelectedPart('right')}>
            ▶
          </button>
        </div>
        <div className={styles.wrapperCreateMenu}>
          <MainButton onClick={() => setTypePart('head')}>Голова</MainButton>
          <MainButton onClick={() => setTypePart('body')}>Туловище</MainButton>
          <MainButton onClick={() => setTypePart('arms')}>Руки</MainButton>
        </div>
        <div className={styles.wrapperCreateMenu}>
          <input
            type="text"
            placeholder="Введите имя"
            value={monsterName}
            onChange={(e) => setMonsterName(e.target.value)}
            className={styles.nameInput}
          />
          <MainButton onClick={handleSaveClick}>Создать</MainButton>
        </div>
      </div>
    </div>
  );
}
