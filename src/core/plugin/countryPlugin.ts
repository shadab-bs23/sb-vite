import UriController from "@/components/controller/UriController";
import { computed, type App } from "vue";

// Map of country ISO codes to timezones
const countryTimezoneMap: Record<string, string> = {
  NO: "Europe/Oslo",
  SE: "Europe/Oslo",
  DK: "Europe/Oslo",
  FI: "Europe/Helsinki",
  GB: "Europe/London",
  UK: "Europe/London",
  // Add more as needed
};

export type countryType = {
  currency?: string;
  countryISO?: string;
  timezone?: string;
};
const currencyPlugin = {
  install(app: App) {
    const country = computed<countryType>(() => {
      const countryMap = UriController.countryMap;
      const query = UriController.getQuery();
      const countryISO = query.country;
      return {
        currency: countryMap.value[countryISO as string]
          ? countryMap.value[countryISO as string].currency
          : null,
        countryISO,
        timezone: countryTimezoneMap[countryISO as string] || "Europe/Oslo",
      };
    });
    app.config.globalProperties.$country = {
      value: country,
    };
    app.provide("country", country);
  },
};

export default currencyPlugin;
