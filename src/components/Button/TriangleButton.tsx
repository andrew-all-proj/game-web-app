import React from 'react'

interface TriangleButtonProps {
  onClick?: () => void
  width?: number
  height?: number
  rotate?: number // в градусах, например: 0, 90, 180
}

const TriangleButton: React.FC<TriangleButtonProps> = ({
  onClick,
  width = 42,
  height = 45,
  rotate = 0,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        transform: `rotate(${rotate}deg)`,
      }}
      aria-label="Triangle Button"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 42 45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_d)">
          <path
            d="M6.28587 16.0004C2.5263 17.8222 2.5263 23.1778 6.28587 24.9996L31.8197 37.3723C35.1402 38.9813 39 36.5625 39 32.8727L39 8.12728C39 4.43747 35.1402 2.01872 31.8197 3.62771L6.28587 16.0004Z"
            fill="#D2FF49"
          />
          <path
            d="M6.28587 16.0004C2.5263 17.8222 2.5263 23.1778 6.28587 24.9996L31.8197 37.3723C35.1402 38.9813 39 36.5625 39 32.8727L39 8.12728C39 4.43747 35.1402 2.01872 31.8197 3.62771L6.28587 16.0004Z"
            stroke="#362F2D"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter
            id="filter0_d"
            x="0.966194"
            y="0.61795"
            width="40.5338"
            height="43.7641"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    </button>
  )
}

export default TriangleButton
