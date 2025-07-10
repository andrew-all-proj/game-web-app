import React from 'react'
import styles from './MainInput.module.css'
import RoundButton from '../Button/RoundButton'

interface MainInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onButtonClick?: () => void
}

export default function MainInput({ onButtonClick, ...props }: MainInputProps) {
  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputField}>
        <input className={styles.mainInput} {...props} />
      </div>
      <div className={styles.buttonOverlap}>
        <RoundButton
          type="select"
          onClick={onButtonClick || (() => {})}
          className={styles.greenButton}
          size={46}
        />
      </div>
    </div>
  )
}
