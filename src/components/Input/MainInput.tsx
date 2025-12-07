import React from 'react'
import styles from './MainInput.module.css'
import RoundButton from '../Button/RoundButton'

interface MainInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  onButtonClick?: () => void
  value: string
}

export default function MainInput({
  label = 'Имя',
  value,
  onChange,
  onButtonClick,
  placeholder,
  ...rest
}: MainInputProps) {
  const hasValue = value && value.length > 0

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.field} ${hasValue ? styles.filled : styles.empty}`}>
        <div
          className={`${styles.leftTag} ${hasValue ? styles.leftTagVisible : styles.leftTagHidden}`}
        >
          {label}
        </div>

        <input
          className={hasValue ? styles.inputFilled : styles.inputEmpty}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...rest}
        />
      </div>

      <div className={styles.buttonOverlap}>
        <RoundButton
          type="select"
          onClick={onButtonClick || (() => {})}
          className={styles.greenButton}
          size={46}
          color="#D2FF49"
        />
      </div>
    </div>
  )
}
