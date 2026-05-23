import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';

const localeModules = import.meta.glob(['./locales/*.json', '!./locales/en.json']) as Record<string, () => Promise<{ default: Record<string, unknown> }>>;

const supportedLngs = ['en', 'hr', 'de', 'el', 'it', 'fr', 'es', 'tr', 'hu', 'cs', 'sk', 'pl', 'sl', 'sq', 'mt'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs,
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

async function loadLocale(lng: string) {
  if (lng === 'en' || i18n.hasResourceBundle(lng, 'translation')) return;
  const path = `./locales/${lng}.json`;
  const loader = localeModules[path];
  if (!loader) return;
  const mod = await loader();
  i18n.addResourceBundle(lng, 'translation', mod.default || mod, true, true);
}

const detectedLng = i18n.language?.split('-')[0];
if (detectedLng && detectedLng !== 'en') {
  loadLocale(detectedLng);
}

i18n.on('languageChanged', (lng) => {
  loadLocale(lng.split('-')[0]);
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
