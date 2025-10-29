import en from "./en-US.json";
import no from "./no-NO.json";
import se from "./sv-SE.json";

import { createI18n } from "vue-i18n";

export const messages = {
  en: en,
  no: no,
  se: se,
};

export const i18n = createI18n({
  globalInjection: true,
  legacy: false,
  locale: "en",
  messages: messages,
});

export const countriesFlag = {
  NO: {
    flag: "no.svg",
  },
  SE: {
    flag: "se.svg",
  },
};

export const languages = {
  en: "English",
  no: "Norwegian",
  se: "Sweden",
};

export const locales = {
  en: "en-US",
  no: "no-NO",
  se: "sv-SE",
};

export const t = i18n.global.t as any;
