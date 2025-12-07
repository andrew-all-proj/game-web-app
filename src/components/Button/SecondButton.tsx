import styles from './SecondButton.module.css'

type MainButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function SecondButton({ children, className = '', ...rest }: MainButtonProps) {
  return (
    <button className={`${styles.secondButton} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}
