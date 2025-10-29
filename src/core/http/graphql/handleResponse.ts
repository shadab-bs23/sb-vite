import router from "@/router";
import { showToast } from "@/services/toast/toast.service";
import { useLoaderStore } from "@/store";
import { i18n } from "@/locales";
/**
 * Handler to show toast for server error
 *
 */
export const handleErrorResponse = (error): void => {
  const loader = useLoaderStore();

  error.map(({ message, locations, path, extensions }) => {
    loader.changeLoadingStatus({ isLoading: false });
    showToast("error", i18n.global.t("common.generic_error"));
    switch (extensions?.code) {
      /*
       * If user has no permission to visit an authorized url user
       * will be redirected to unauthorized view
       */
      case "UNAUTHENTICATED":
        router.push({
          name: "error",
          params: { tag: "unauthorized-error" },
        });
        break;

      case "INTERNAL_SERVER_ERROR":
        router.push({
          name: "error",
          params: { tag: "server-error" },
        });
        break;
      default:
        return;
    }
    /*
     * this console log is for test and understanding purpose, To whom it may concern
     */
    console.log(
      `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, code: ${extensions.code}`
    );
  });
};
