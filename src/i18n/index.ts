import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import TelegramLanguageDetector from './telegramLanguageDetector'

i18n
  .use(HttpBackend)
  .use(TelegramLanguageDetector)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      // отключим htmlTag, куки и т.п., если не нужно
      order: ['customDetector', 'querystring', 'localStorage', 'navigator'],
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })

export default i18n

/**
 * Опционально: RTL поддержка
 */
export function applyDirection(lng?: string) {
  const rtl = ['ar', 'he', 'fa', 'ur']
  const lang = lng || i18n.resolvedLanguage || 'en'
  const dir = rtl.includes(lang) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lang)
}

i18n.on('initialized', () => applyDirection())
i18n.on('languageChanged', (l) => applyDirection(l))
