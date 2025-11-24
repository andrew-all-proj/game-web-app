import { useState, useRef, useEffect } from "react";
import i18next from "i18next";
import styles from "./LanguageDropdown.module.css";
import { LanguageEnum } from "../../types/enums/LanguageEnum";


export const LANGUAGE_LIST: { code: LanguageEnum; label: string }[] = [
  { code: LanguageEnum.RU, label: "RU" },
  { code: LanguageEnum.EN, label: "EN" },
];

type Props = {
  defaultLang?: LanguageEnum;
  onChange?: (lang: LanguageEnum) => void;
  useI18n?: boolean;
  persist?: boolean;
};

export default function LanguageDropdown({
  defaultLang = LanguageEnum.RU,
  onChange,
  useI18n = true,
  persist = true,
}: Props) {
  const initial =
    (i18next.resolvedLanguage?.toUpperCase() as LanguageEnum) ||
    (i18next.language?.toUpperCase() as LanguageEnum) ||
    defaultLang;

  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<LanguageEnum>(initial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const handler = (lng: string) => setLang(lng.toUpperCase() as LanguageEnum);
    i18next.on("languageChanged", handler);
    return () => {
      i18next.off("languageChanged", handler);
    };
  }, []);

  const handleSelect = async (code: LanguageEnum) => {
    if (code === lang) return setOpen(false);

    if (useI18n) {
      await i18next.changeLanguage(code.toLowerCase());
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
        {LANGUAGE_LIST.find((l) => l.code === lang)?.label} ▼
      </button>

      {open && (
        <div className={styles.menu}>
          {LANGUAGE_LIST.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`${styles.item} ${code === lang ? styles.active : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
