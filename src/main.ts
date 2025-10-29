import { createApp, h, provide } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import Toast, { PluginOptions } from "vue-toastification";
import { ToastOptionsAndRequiredContent } from "vue-toastification/dist/types/types";
import "vue-toastification/dist/index.css";
import { i18n } from "@/locales/index";
import { createPinia } from "pinia";
import CommonComponents from "@/components/common/";
import { initAmplify } from "./services/auth/auth.service";

import { ApolloClients } from "@vue/apollo-composable";

import "./assets/css/sb.scss";

// Sentry, see https://sentry.io/ferdia-as/ferdia-sharebus-fe/getting-started/javascript-vue/
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import { apolloClientCognito, apolloClientDefault } from "./services/graphql";

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// PrimeVue, see https://www.primefaces.org/primevue/setup
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import { useAppFilters } from "@/composables/useAppFilters";
import countryPlugin from "./core/plugin/countryPlugin";
import ElementPlus from "element-plus";
import "/node_modules/element-plus/es/components/date-picker/style/css";

const filterBeforeCreate = (
  toast: ToastOptionsAndRequiredContent,
  toasts: ToastOptionsAndRequiredContent[]
) => {
  if (toasts.filter((t) => t.type === toast.type).length !== 0) {
    // Returning false discards the toast
    return false;
  }
  // You can modify the toast if you want
  return toast;
};

const options: PluginOptions = {
  // You can set your default options here
  timeout: 1000,
  transition: "enter",
  filterBeforeCreate: filterBeforeCreate,
};
const app = createApp({
  setup() {
    /*
     * providing apollo client into vue/apollo-composable
     */
    provide(ApolloClients, {
      default: apolloClientCognito,
      api_key: apolloClientDefault,
    });
    initAmplify(); //Initiating AWS amplify.
  },
  render: () => h(App),
});

app.use(countryPlugin);

/**
 * Globally registering common components
 */
CommonComponents.register(app);
/*
 * initially used for http response(success and error) handling
 */
app.use(Toast, options);

// Initializing sentry ......................................................................\
const TC: FERDIA_CUSTOM = window.FERDIA_CUSTOM || null;
const BI: BUILD_INFO = (TC && TC.BUILD_INFO) || null;
const FROM_URL: FROM_URL = (TC && TC.FROM_URL) || null;
const isProd = FROM_URL && FROM_URL.ENV && FROM_URL.ENV === "production";

/*
 *
 * See also :
 * - [initial setup](https://sentry.io/ferdia-as/ferdia-sharebus-fe/getting-started/javascript-vue/)
 * - [vue guide](https://docs.sentry.io/platforms/javascript/guides/vue/)
 * - [todo - for further refinement and CI/CD integration](https://medium.com/techsoplaya/how-to-add-sentry-to-your-vue-js-app-and-integrate-it-into-gitlab-ci-cd-75a0f8a6faf0)
 *
 */
Sentry.init({
  app,
  // https://docs.sentry.io/platforms/javascript/configuration/options/#dsn
  dsn: "https://1caf04c07d324de3b15dc6922ecb99ab@o391391.ingest.sentry.io/6346202",

  // https://docs.sentry.io/platforms/javascript/configuration/options/#release
  release:
    (BI && BI.NAME && BI.VERSION && `${BI.NAME}@${BI.VERSION}`) || "UNKNOWN",

  // https://docs.sentry.io/platforms/javascript/configuration/options/#environment
  environment: (FROM_URL && FROM_URL.ENV) || "UNKNOWN", // e.g. production,

  // https://docs.sentry.io/platforms/javascript/configuration/integrations/
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      // !TODO: FOLLOW UP WHEN BACKEND IS READY TO IMPLEMENT TRACING, SEE...
      // https://docs.sentry.io/platforms/javascript/performance/instrumentation/automatic-instrumentation/#tracingorigins
      tracingOrigins: ["localhost", "sharebus.co", /^\//],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: isProd ? 0.1 : 1,

  // https://docs.sentry.io/platforms/javascript/configuration/options/#debug
  debug: false,

  // Vue-specific, see https://docs.sentry.io/platforms/javascript/guides/vue/
  tracingOptions: {
    trackComponents: true,
  },
  logErrors: !isProd,
  attachProps: true,
});

app.use(i18n);
app.use(router);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(PrimeVue);
app.use(ElementPlus);
app.config.globalProperties.$filters = useAppFilters().appFilters;

if (
  // Setup mock mode
  import.meta.env.VITE_APP_MOCK === "true"
) {
  (async () => {
    const { worker } = await import("@/services/mockBrowser/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
    app.mount("#app");
  })();
} else {
  app.mount("#app");
}
