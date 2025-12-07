import type { LanguageDetectorModule } from 'i18next'
import WebApp from '@twa-dev/sdk'

const TG_KEYS = ['tg_webapp_lang', 'lang']

function getTelegramLang(): string | undefined {
  try {
    const fromUnsafe = WebApp.initDataUnsafe?.user?.language_code as string | undefined
    const fromI18n = (WebApp as { i18nLanguageCode?: string }).i18nLanguageCode
    return fromUnsafe || fromI18n
  } catch {
    return undefined
  }
}

function getUrlLang(): string | undefined {
  const u = new URL(window.location.href)
  for (const k of TG_KEYS) {
    const v = u.searchParams.get(k)
    if (v) return v
  }
  return undefined
}

const TelegramLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: () => {
    return (
      getTelegramLang() ||
      getUrlLang() ||
      localStorage.getItem('i18nextLng') ||
      navigator.language ||
      'en'
    )
  },
  init: () => {
    // нет инициализации
  },
  cacheUserLanguage: (lng: string) => {
    try {
      localStorage.setItem('i18nextLng', lng)
    } catch {
      // нет доступа к localStorage
    }
  },
}

export default TelegramLanguageDetector
