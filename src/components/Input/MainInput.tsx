import React from 'react'
import styles from './MainInput.module.css'

export default function MainInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.mainInput} {...props} />
}
