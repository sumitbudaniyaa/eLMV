import i18n from "i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";

i18n.init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
