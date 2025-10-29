import UriController from "@/components/controller/UriController";
import { computed } from "vue";

export type countryType = {
  currency?: string;
  countryISO?: string;
};
const currencyPlugin = {
  install(app) {
    /*
     * computing the property here
     */
    const country = computed<countryType>(() => {
      const countryMap = UriController.countryMap;
      const query = UriController.getQuery();
      return {
        currency: countryMap.value[query.country as string]
          ? countryMap.value[query.country as string].currency
          : null,
        countryISO: query.country,
      };
    });

    /*
     * Here GlobalProperties also defined country can be accessed by also global properties
     */
    app.config.globalProperties.$country = {
      global: country,
    };

    /*
     * Providing countryName throughout the application
     */
    app.provide("country", country);
  },
};

export default currencyPlugin;
