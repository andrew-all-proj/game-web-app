import { useState, useRef, useEffect } from "react";
import styles from "./LanguageDropdown.module.css";
import { LanguageEnum } from "../../types/enums/LanguageEnum";

export const LANGUAGE_LIST: { code: LanguageEnum; label: string }[] = [
  { code: LanguageEnum.RU, label: "RU" },
  { code: LanguageEnum.EN, label: "EN" },
];

type Props = {
  defaultLang?: LanguageEnum;
  onChange?: (lang: LanguageEnum) => void;
};

export default function LanguageDropdown({
  defaultLang = LanguageEnum.RU,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<LanguageEnum>(defaultLang);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSelect = (code: LanguageEnum) => {
    if (code === lang) {
      setOpen(false);
      return;
    }

    setLang(code);
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
              className={`${styles.item} ${
                code === lang ? styles.active : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
