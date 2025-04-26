import { motion } from "framer-motion";
import styles from "./MainCharacter.module.css";

export default function MainCharacter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.mainCharacter}
    >
      {/* Верхние кнопки */}
      <div className={styles.mainButtons}>
        <div />
        <div />
      </div>

      {/* Характеристики и персонаж */}
      <div className={styles.characterWrapper}>
        <div className={styles.characterStats}>
          <div />
          <div />
        </div>
        <div className={styles.characterImage} />
        <div className={styles.characterStats}>
          <div />
          <div />
        </div>
      </div>

      {/* Кнопка создать */}
      <div className={styles.createButton} />
    </motion.div>
  );
}
