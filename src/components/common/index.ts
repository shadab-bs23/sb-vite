import { App } from "vue";

// This is for Automatic Global Registration of Base Components
// See main.ts, where this is applied.

const requireComponent = import.meta.glob("./**/*.vue");

/**
 * This function is responsible for component registration.
 *
 * @param {App<Element>}  app - App instance
 */
const register = (app: App<Element>): void => {
  for (const path in requireComponent) {
    requireComponent[path]().then((mod) => {
      if(mod.default.__name) app.component(mod.default.__name, mod.default);
    });
  }
};
export default {
  register,
};
