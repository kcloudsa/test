import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import all translation files directly
// en-US
import enUSDefault from "./messages/en-US/default.json";
import enUSAppSidebar from "./messages/en-US/app-sidebar.json";
import enUSCharts from "./messages/en-US/charts.json";
import enUSCalendar from "./messages/en-US/calendar.json";
import enUSTasks from "./messages/en-US/tasks.json";
import enUSLogin from "./messages/en-US/login.json";
import enUSSettings from "./messages/en-US/settings.json";

// ar-SA
import arSADefault from "./messages/ar-SA/default.json";
import arSAAppSidebar from "./messages/ar-SA/app-sidebar.json";
import arSACharts from "./messages/ar-SA/charts.json";
import arSACalendar from "./messages/ar-SA/calendar.json";
import arSATasks from "./messages/ar-SA/tasks.json";
import arSALogin from "./messages/ar-SA/login.json";
import arSASettings from "./messages/ar-SA/settings.json";

const resources = {
  "en-US": {
    default: enUSDefault,
    "app-sidebar": enUSAppSidebar,
    charts: enUSCharts,
    calendar: enUSCalendar,
    tasks: enUSTasks,
    login: enUSLogin,
    settings: enUSSettings
  },
  "ar-SA": {
    default: arSADefault,
    "app-sidebar": arSAAppSidebar,
    charts: arSACharts,
    calendar: arSACalendar,
    tasks: arSATasks,
    login: arSALogin,
    settings: arSASettings
  },
};

// Get all namespaces from the resources
const namespaces = Array.from(
  new Set(
    Object.values(resources).flatMap(lang => Object.keys(lang))
  )
);

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar-SA",
    ns: namespaces,
    defaultNS: "default",
    supportedLngs: ["en-US", "ar-SA"],
    detection: {
      order: ['cookie', 'path', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;