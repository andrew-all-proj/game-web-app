import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import monsterStore from '../../stores/MonsterStore';
import opponentMonster from '../../assets/images/opponent-monster.png';
import styles from './TestFight.module.css';

export default function TestFight() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [yourHealth, setYourHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [atlas, setAtlas] = useState<any>(null);
  const [spriteUrl, setSpriteUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!monsterStore.selectedMonster) return;
  
      let atlasFile = monsterStore.selectedMonster.files?.find(
        f => f.fileType === 'JSON' && f.contentType === 'SPRITE_SHEET_MONSTER'
      );
      let spriteFile = monsterStore.selectedMonster.files?.find(
        f => f.fileType === 'IMAGE' && f.contentType === 'SPRITE_SHEET_MONSTER'
      );
  
      if (!atlasFile || !spriteFile) {
        await monsterStore.fetchMonsters();
        monsterStore.setSelectedMonster(monsterStore.selectedMonster.id)
        atlasFile = monsterStore.selectedMonster.files?.find(
          f => f.fileType === 'JSON' && f.contentType === 'SPRITE_SHEET_MONSTER'
        );
        spriteFile = monsterStore.selectedMonster.files?.find(
          f => f.fileType === 'IMAGE' && f.contentType === 'SPRITE_SHEET_MONSTER'
        );
      }
  
      if (atlasFile && spriteFile) {
        await fetch(atlasFile.url)
          .then(res => res.json())
          .then(data => setAtlas(data));
        setSpriteUrl(spriteFile.url);
      }
    })();
  }, []);
  

  useEffect(() => {
    if (!atlas || !spriteUrl || !containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 300,
      parent: containerRef.current,
      transparent: true,
      scene: {
        preload,
        create,
        update,
      },
    };

    let yourMonster: Phaser.GameObjects.Sprite;
    let opponentMonsterSprite: Phaser.GameObjects.Sprite;

    function preload(this: Phaser.Scene) {
      this.load.atlas('monster', spriteUrl, atlas);
      this.load.image('opponent', opponentMonster);
    }

    const scale = 0.12

    function create(this: Phaser.Scene) {
      yourMonster = this.add.sprite(100, 150, 'monster', Object.keys(atlas.frames)[0]).setScale(scale).setName('yourMonster');

      opponentMonsterSprite = this.add.sprite(300, 150, 'opponent')
      .setScale(-scale, scale)
      .setName('opponentMonster');


      this.anims.create({
        key: 'stay',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'stay_',
          start: 0,
          end: Object.keys(atlas.frames).filter(k => k.startsWith('stay_')).length - 1,
        }),
        frameRate: 5,
        repeat: -1,
      });

      this.anims.create({
        key: 'hit',
        frames: this.anims.generateFrameNames('monster', {
          prefix: 'hit_',
          start: 0,
          end: Object.keys(atlas.frames).filter(k => k.startsWith('hit_')).length - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });

      const hitOverlay = this.add.ellipse(300, 150, 200, 200, 0xff0000, 0.4);
      hitOverlay.setVisible(false);
      hitOverlay.setName('hitOverlay');

      const hitOverlayMy = this.add.ellipse(100, 150, 200, 200, 0xff0000, 0.4);
      hitOverlayMy.setVisible(false);
      hitOverlayMy.setName('hitOverlayMy');

      yourMonster.play('stay');
    }

    function update(this: Phaser.Scene) {
      if (opponentHealth <= 0) {
        opponentMonsterSprite.angle = 90;
    
        if (!this.children.getByName('gameOverText')) {
          this.add.text(200, 40, 'YOU WIN', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold',
          }).setOrigin(0.5).setName('gameOverText');
        }
      }
    
      if (yourHealth <= 0) {
        yourMonster.angle = -90;
    
        if (!this.children.getByName('gameOverText')) {
          this.add.text(200, 40, 'YOU LOSE', {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold',
          }).setOrigin(0.5).setName('gameOverText');
        }
      }
    }
    

    if (gameRef.current) {
      gameRef.current.destroy(true);
    }
    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [atlas, spriteUrl]);

  const handleAttack = (damage: number) => {
    setOpponentHealth(prev => {
      const newHealth = Math.max(prev - damage, 0);
  
      if (gameRef.current) {
        const scene = gameRef.current.scene.scenes[0];
        const opponent = scene.children.getByName('opponentMonster') as Phaser.GameObjects.Sprite;
        const gameOverText = scene.children.getByName('gameOverText');
  
        if (newHealth <= 0 && opponent && !gameOverText) {
          opponent.angle = 90;
          scene.add.text(200, 40, 'YOU WIN', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold',
          }).setOrigin(0.5).setName('gameOverText');
        }
      }
  
      return newHealth;
    });
  
    setYourHealth(prev => {
      const randomDamage = Math.floor(Math.random() * 26) + 5; // от 5 до 30
      const newHealth = Math.max(prev - randomDamage, 0);

  
      if (gameRef.current) {
        const scene = gameRef.current.scene.scenes[0];
        const your = scene.children.getByName('yourMonster') as Phaser.GameObjects.Sprite;
        const gameOverText = scene.children.getByName('gameOverText');
  
        if (newHealth <= 0 && your && !gameOverText) {
          your.angle = -90;
          scene.add.text(200, 40, 'YOU LOSE', {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold',
          }).setOrigin(0.5).setName('gameOverText');
        }
      }
  
      return newHealth;
    });
  
    if (gameRef.current) {
      const scene = gameRef.current.scene.scenes[0];
      const yourMonsterSprite = scene.children.getByName('yourMonster') as Phaser.GameObjects.Sprite;
      const hitOverlay = scene.children.getByName('hitOverlay') as Phaser.GameObjects.Ellipse;
  
      if (yourMonsterSprite) {
        yourMonsterSprite.play('hit');
        scene.time.delayedCall(1000, () => {
          yourMonsterSprite.play('stay');
        });
      }
  
      if (hitOverlay) {
        hitOverlay.setVisible(true);
        scene.time.delayedCall(500, () => {
          hitOverlay.setVisible(false);
        });
      }
    }
  };
  

  if (!monsterStore.selectedMonster) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'white', fontSize: '34px' }}>
        Выберите монстра в лаборатории
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <div style={{ marginTop: '70px', position: 'relative', width: 400, height: 300 }}>
        <div className={styles.healthBar} style={{ top: 10, left: 20 }}>
          <div className={styles.healthFill} style={{ width: `${yourHealth}%`, backgroundColor: '#4caf50' }} />
        </div>
        <div className={styles.healthBar} style={{ top: 10, right: 20 }}>
          <div className={styles.healthFill} style={{ width: `${opponentHealth}%`, backgroundColor: '#f44336' }} />
        </div>
        <div ref={containerRef} />
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
