import { useEffect, useState } from 'react'
import TopAlert from './TopAlert'
import { AlertState, registerTopAlertSetter } from './topAlertBus'

export default function TopAlertHost() {
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    text: '',
    variant: 'info',
    autoHideMs: 5000,
  })

  useEffect(() => {
    registerTopAlertSetter(setAlert)
  }, [])

  return (
    <TopAlert
      open={alert.open}
      text={alert.text}
      variant={alert.variant}
      autoHideMs={alert.autoHideMs}
      onClose={() => setAlert((a) => ({ ...a, open: false }))}
    />
  )
}
