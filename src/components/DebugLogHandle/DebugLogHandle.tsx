import { useState, useImperativeHandle, forwardRef } from 'react'

export interface DebugLogHandle {
  log: (...args: any[]) => void
  clear: () => void
}

const DebugLogPanel = forwardRef<DebugLogHandle>((_props, ref) => {
  const [logs, setLogs] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    log: (...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(' ')
      setLogs((prev) => [...prev, message])
    },
    clear: () => {
      setLogs([])
    },
  }))

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        color: '#0f0',
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '4px 8px',
        height: '50px',
        overflowY: 'auto',
        borderBottom: '1px solid #444',
        zIndex: 9999,
        pointerEvents: 'none', // 👈 не блокирует клики по WebApp
      }}
    >
      <strong>Debug Log:</strong>
      <pre style={{ margin: 0 }}>{logs.join('\n')}</pre>
    </div>
  )
})

export default DebugLogPanel
