import router from "@/router";
import { showToast } from "@/services/toast/toast.service";
import { useLoaderStore } from "@/store";
import { i18n } from "@/locales";
import { routePushTag } from "@/utils";
import { GraphQLErrors } from "@apollo/client/errors";
/**
 * Handler to show toast for server error
 *
 */
export const handleErrorResponse = (error): void => {
  const loader = useLoaderStore();

  error.map(({ message, locations, path, extensions }) => {
    loader.changeLoadingStatus({ isLoading: false });
    showToast("error", message || i18n.global.t("common.generic_error"));
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

// TODO:: WILL REVISIT HERE UNDER @link https://ferdia.atlassian.net/browse/SB-936
/**
 * Handles unauthorized errors from GraphQL responses.
 *
 * This function checks if the provided errors array contains an error
 * with the `errorType` of "Unauthorized". If such an error is found,
 * it triggers a redirect or navigation action by calling `routePushTag`.
 *
 * @param {GraphQLErrors} errors - An array of GraphQL error objects.
 * @returns {void}
 */
export function handleUnauthorizedError(errors: GraphQLErrors) {
  if (!errors?.length) return; // Early return if there are no errors

  const [error] = errors; // Destructure the first error

  if (
    typeof error === "object" && // Check if the error is an object
    error !== null && // Ensure it's not null
    "errorType" in error && // Check if 'errorType' exists in the error object
    (error as any).errorType === "Unauthorized" // Verify 'errorType' value
  ) {
    routePushTag("error", "unauthorized-error"); // Ensure to await if routePushTag is async
  }
}
