interface TitleSvgProps {
  text: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
  width?: number
  height?: number
  fontFamily?: string
  filter?: string
  style?: React.CSSProperties
}

const TitleSvg = ({
  text,
  fill = 'var(--pink-secondary-color,#fd3afc)',
  stroke = '#362F2D',
  strokeWidth = 10,
  fontSize = 50,
  width = 420,
  height = 90,
  fontFamily = 'var(--font-base)',
  filter = '',
  style,
}: TitleSvgProps) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
    pointerEvents="none"
  >
    <text
      x="43%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily={fontFamily}
      fontSize={fontSize}
      fontWeight="bold"
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      paintOrder="stroke fill"
      style={{ filter }}
    >
      {text}
    </text>
  </svg>
)

export default TitleSvg
