
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./locales/en/translation.json";
import elTranslations from "./locales/el/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "el",
    debug: import.meta.env.DEV,
    resources: {
      en: {
        translation: enTranslations,
      },
      el: {
        translation: elTranslations,
      },
    },
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
