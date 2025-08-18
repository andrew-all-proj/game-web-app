export type Variant = 'info' | 'warning' | 'error'
export type AlertState = {
  open: boolean
  text: string
  variant: Variant
  autoHideMs?: number
}

let setAlertRef: React.Dispatch<React.SetStateAction<AlertState>> | null = null

export function registerTopAlertSetter(setter: React.Dispatch<React.SetStateAction<AlertState>>) {
  setAlertRef = setter
}

export function showTopAlert(opts: Omit<AlertState, 'open'> & { open?: boolean }) {
  if (!setAlertRef) return
  setAlertRef((prev) => ({
    open: true,
    text: opts.text ?? prev.text,
    variant: opts.variant ?? prev.variant,
    autoHideMs: opts.autoHideMs ?? prev.autoHideMs,
  }))
}

export function hideTopAlert() {
  if (!setAlertRef) return
  setAlertRef((prev) => ({ ...prev, open: false }))
}
