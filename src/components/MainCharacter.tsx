import { motion } from "framer-motion";
import "../App.css";

export default function MainCharacter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="main-character"
    >
      {/* Верхние кнопки */}
      <div className="main-buttons">
        <div />
        <div />
      </div>

      {/* Характеристики и персонаж */}
      <div className="character-wrapper">
        <div className="character-stats">
          <div />
          <div />
        </div>
        <div className="character-image" />
        <div className="character-stats">
          <div />
          <div />
        </div>
      </div>

      {/* Кнопка создать */}
      <div className="create-button" />
    </motion.div>
  );
}
