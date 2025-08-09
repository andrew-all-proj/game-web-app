import clsx from 'clsx'
import styles from './RoundButton.module.css'

interface RoundButtonProps {
  onClick: () => void
  size?: number
  type?: 'back' | 'select' | 'exit' | 'next' | 'plus'
  color?: string
  className?: string
}

export default function RoundButton({
  onClick,
  size = 46,
  type = 'back',
  color = 'var( --red-primary-color)',
  className = '',
}: RoundButtonProps) {
  const getIcon = () => {
    switch (type) {
      case 'exit':
        return (
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M15.6162 1.82326C16.7877 0.651784 18.6868 0.651917 19.8584 1.82326L21.8789 3.84279C23.0503 5.01437 23.0504 6.91444 21.8789 8.08596L18.0508 11.9131L21.8789 15.7412C23.0501 16.9127 23.05 18.8119 21.8789 19.9834L19.8584 22.0039C18.6869 23.175 16.7877 23.1751 15.6162 22.0039L11.7881 18.1758L7.96096 22.0039C6.78944 23.1754 4.88937 23.1753 3.71779 22.0039L1.69826 19.9834C0.526914 18.8118 0.526775 16.9127 1.69826 15.7412L5.52541 11.9131L1.69826 8.08596C0.526687 6.91438 0.526687 5.01436 1.69826 3.84279L3.71779 1.82326C4.88936 0.651687 6.78938 0.651687 7.96096 1.82326L11.7881 5.65041L15.6162 1.82326Z"
              fill="black"
            />
          </svg>
        )
      case 'select':
        return (
          <svg
            width="24"
            height="19"
            viewBox="0 0 24 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M7.71742 17.3758L0.760304 10.5028C-1.24024 8.52645 1.05111 5.32262 3.6548 6.45565L7.40819 8.08898C8.26346 8.46116 9.25916 8.35355 10.0094 7.80784L19.8421 0.655557C22.3311 -1.15499 25.3825 2.06792 23.3186 4.32763L11.4873 17.2819C10.4956 18.3677 8.76511 18.4108 7.71742 17.3758Z"
              fill="black"
            />
          </svg>
        )
      case 'next':
        return (
          <svg
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M18.3062 8.38037C20.3568 9.52483 20.3568 12.4752 18.3062 13.6196L4.96204 21.0671C2.96235 22.1831 0.500001 20.7375 0.500001 18.4475L0.500002 3.55254C0.500002 1.26251 2.96235 -0.18312 4.96203 0.932914L18.3062 8.38037Z"
              fill="black"
            />
          </svg>
        )
      case 'plus':
        return (
          <svg
            width="26"
            height="27"
            viewBox="0 0 26 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M14.5869 0.730469C16.2436 0.730612 17.5869 2.0737 17.5869 3.73047V9.14355H23C24.6568 9.14355 25.9999 10.4868 26 12.1436V15C26 16.6569 24.6569 18 23 18H17.5869V23.4131C17.5869 25.0699 16.2436 26.4129 14.5869 26.4131H11.7305C10.0736 26.4131 8.73047 25.0699 8.73047 23.4131V18H3.31738C1.66053 18 0.317383 16.6569 0.317383 15V12.1436C0.317526 10.4868 1.66062 9.14355 3.31738 9.14355H8.73047V3.73047C8.73047 2.07361 10.0736 0.730469 11.7305 0.730469H14.5869Z"
              fill="black"
            />
          </svg>
        )
      case 'back':
      default:
        return (
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M1.6938 7.88037C-0.356829 9.02483 -0.356832 11.9752 1.69379 13.1196L15.038 20.5671C17.0376 21.6831 19.5 20.2375 19.5 17.9475L19.5 3.05254C19.5 0.762507 17.0377 -0.68312 15.038 0.432914L1.6938 7.88037Z"
              fill="black"
            />
          </svg>
        )
    }
  }

  return (
    <button
      className={clsx(styles.roundButton, className)}
      style={{ width: size, height: size, backgroundColor: color }}
      onClick={onClick}
    >
      {getIcon()}
    </button>
  )
}
