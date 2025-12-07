import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

function readHeight(): number {
  const h = WebApp?.viewportHeight || window.visualViewport?.height || window.innerHeight
  return Math.round(h)
}

export default function TelegramViewportSync() {
  useEffect(() => {
    try {
      WebApp.ready()
    } catch {
      // WebApp может быть недоступен при локальной разработке
    }

    const apply = () => {
      const h = readHeight()
      document.documentElement.style.setProperty('--tg-vh', `${h}px`)
    }

    const rafApply = () => requestAnimationFrame(apply)
    const onViewportChanged = () => rafApply()
    const onResize = () => rafApply()
    const onOrientation = () => setTimeout(apply, 50)

    apply()
    WebApp.onEvent('viewportChanged', onViewportChanged)
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientation)

    return () => {
      try {
        WebApp.offEvent('viewportChanged', onViewportChanged)
      } catch {
        // Игнорируем отсутствие SDK в окружении
      }
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])

  return null
}
