import styles from './InputBox.module.css'

interface InputBoxProps {
  isActive: boolean
  handleSetActive: () => void
  className?: string
  text: string
}

export default function InputBox({ isActive, handleSetActive, text }: InputBoxProps) {
  return (
    <label className={styles.activeCheckbox} title="Сделать этого монстра активным">
      <input
        type="checkbox"
        checked={isActive}
        onChange={handleSetActive}
        aria-checked={isActive}
        aria-label="Активный монстр"
      />
      <span>{text}</span>
    </label>
  )
}
