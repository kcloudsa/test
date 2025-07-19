import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Import all translation files directly
// en-US
import enUSDefault from "./messages/en-US/default.json";
import enUSAppSidebar from "./messages/en-US/app-sidebar.json";
import enUSDataTable from "./messages/en-US/data-table.json";
import enUSCharts from "./messages/en-US/charts.json";
import enUSCalendar from "./messages/en-US/calendar.json";
import enUSTasks from "./messages/en-US/tasks.json";
import enUSLogin from "./messages/en-US/login.json";
import enUSSettings from "./messages/en-US/settings.json";
import enUSRealEstates from "./messages/en-US/real-estates.json";
import enUSRentals from "./messages/en-US/rentals.json";
import enUSContacts from "./messages/en-US/contacts.json";
import enUSDocuments from "./messages/en-US/documents.json";
import enUSNotifications from "./messages/en-US/notifications.json";
import enUSAccount from "./messages/en-US/account.json";
import enUSReports from "./messages/en-US/reports.json";
import enUSUsers from "./messages/en-US/users.json";

// ar-SA
import arSADefault from "./messages/ar-SA/default.json";
import arSAAppSidebar from "./messages/ar-SA/app-sidebar.json";
import arSADataTable from "./messages/ar-SA/data-table.json";
import arSACharts from "./messages/ar-SA/charts.json";
import arSACalendar from "./messages/ar-SA/calendar.json";
import arSATasks from "./messages/ar-SA/tasks.json";
import arSALogin from "./messages/ar-SA/login.json";
import arSASettings from "./messages/ar-SA/settings.json";
import arSARealEstates from "./messages/ar-SA/real-estates.json";
import arSARentals from "./messages/ar-SA/rentals.json";
import arSAContacts from "./messages/ar-SA/contacts.json";
import arSADocuments from "./messages/ar-SA/documents.json";
import arSANotifications from "./messages/ar-SA/notifications.json";
import arSAAccount from "./messages/ar-SA/account.json";
import arSAReports from "./messages/ar-SA/reports.json";
import arSAUsers from "./messages/ar-SA/users.json";

const resources = {
  "en-US": {
    default: enUSDefault,
    "app-sidebar": enUSAppSidebar,
    "real-estates": enUSRealEstates,
    "data-table": enUSDataTable,
    charts: enUSCharts,
    calendar: enUSCalendar,
    tasks: enUSTasks,
    login: enUSLogin,
    settings: enUSSettings,
    rentals: enUSRentals,
    contacts: enUSContacts,
    documents: enUSDocuments,
    notifications: enUSNotifications,
    account: enUSAccount,
    reports: enUSReports,
    users: enUSUsers,
  },
  "ar-SA": {
    default: arSADefault,
    "app-sidebar": arSAAppSidebar,
    "real-estates": arSARealEstates,
    "data-table": arSADataTable,
    charts: arSACharts,
    calendar: arSACalendar,
    tasks: arSATasks,
    login: arSALogin,
    settings: arSASettings,
    rentals: arSARentals,
    contacts: arSAContacts,
    documents: arSADocuments,
    notifications: arSANotifications,
    account: arSAAccount,
    reports: arSAReports,
    users: arSAUsers,
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
    fallbackLng: "en-US",
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