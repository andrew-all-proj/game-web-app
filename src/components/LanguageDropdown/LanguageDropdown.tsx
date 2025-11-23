import { useState, useRef, useEffect } from "react";
import i18next from "i18next";
import styles from "./LanguageDropdown.module.css";

const LANGUAGES = [
  { code: "ru", label: "Ru" },
  { code: "en", label: "En" },
];

type Props = {
  defaultLang?: string;            
  onChange?: (lang: string) => void; 
  useI18n?: boolean;                
  persist?: boolean;                
};

export default function LanguageDropdown({
  defaultLang = "en",
  onChange,
  useI18n = true,
  persist = true,
}: Props) {
  const initial =
    i18next.resolvedLanguage || i18next.language || defaultLang;

  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

  const handleSelect = async (code: string) => {
    if (code === lang) {
      setOpen(false);
      return;
    }

    if (useI18n) {
      try {
        await i18next.changeLanguage(code);
      } catch {
        // ignore
      }
    } else {
      setLang(code);
    }

    if (persist) {
      try {
        localStorage.setItem("i18nextLng", code);
      } catch {}
    }

    onChange?.(code);
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.btn} onClick={() => setOpen(!open)}>
        {LANGUAGES.find((l) => l.code === lang)?.label} ▼
      </button>

      {open && (
        <div className={styles.menu}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`${styles.item} ${l.code === lang ? styles.active : ""}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
