import React from 'react'
import styles from './MainInput.module.css'

interface MainInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function MainInput(props: MainInputProps) {
  return <input className={styles.mainInput} {...props} />
}
