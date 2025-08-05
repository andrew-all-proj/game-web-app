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
  lineHeight?: number
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
  lineHeight = 1.1,
}: TitleSvgProps & { lineHeight?: number }) => {
  const lines = text.split('\n')
  const totalHeight = lines.length * fontSize * lineHeight
  const startY = height / 2 - totalHeight / 2 + fontSize

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      pointerEvents="none"
    >
      <text
        x="50%"
        y={startY}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontSize={fontSize}
        fontWeight="bold"
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        paintOrder="stroke fill"
        style={{ filter }}
      >
        {lines.map((line, i) => (
          <tspan key={i} x="50%" dy={i === 0 ? 0 : fontSize * lineHeight} dominantBaseline="middle">
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  )
}

export default TitleSvg
