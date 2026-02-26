import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hr from './locales/hr.json';
import el from './locales/el.json';
import sq from './locales/sq.json';
import it from './locales/it.json';
import mt from './locales/mt.json';
import fr from './locales/fr.json';
import tr from './locales/tr.json';
import es from './locales/es.json';
import sl from './locales/sl.json';
import de from './locales/de.json';
import hu from './locales/hu.json';
import cs from './locales/cs.json';
import sk from './locales/sk.json';
import pl from './locales/pl.json';

const resources = {
  en: { translation: en },
  hr: { translation: hr },
  el: { translation: el },
  sq: { translation: sq },
  it: { translation: it },
  mt: { translation: mt },
  fr: { translation: fr },
  tr: { translation: tr },
  es: { translation: es },
  sl: { translation: sl },
  de: { translation: de },
  hu: { translation: hu },
  cs: { translation: cs },
  sk: { translation: sk },
  pl: { translation: pl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hr', 'de', 'el', 'it', 'fr', 'es', 'tr', 'hu', 'cs', 'sk', 'pl', 'sl', 'sq', 'mt'],
    load: 'languageOnly',
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
];

export default i18n;
