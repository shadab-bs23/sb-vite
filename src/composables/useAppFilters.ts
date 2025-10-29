import { getCurrentInstance } from "vue";
import mathFilter from "@/core/filters/math.filter";

export const useAppFilters = () => {
  return {
    appFilters: {
      mathFilter,
    },
    filters:
      getCurrentInstance()?.appContext.app.config.globalProperties.$filters,
  };
};
