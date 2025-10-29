import { AxiosError, AxiosRequestHeaders, AxiosResponse } from "axios";
import { POSITION, useToast } from "vue-toastification";
import router from "@/router";

/**
 * Handler to show toast for server success/warning
 *
 * @param {AxiosResponse} response - Axios response object
 */
export const handleSuccessResponse = (response: AxiosResponse): void => {
  /*
    data - its depend on server response on API, data property are 'code' and 'type', it will be replaced as BE gives
  */
  const {
    data,
    config: { headers },
  } = response;

  if (data.code && !headers?.noToast) {
    const { code, type } = data;
    showToast(code, type || "success", headers);
  }
};

/**
 * Handler to show toast for server error
 *
 * @param {AxiosError} error - Axios error object
 */
export const handleErrorResponse = (error: AxiosError): void => {
  const {
    message,
    response,
    config: { headers },
  } = error;
  /*
    data - its depend on server response on API, data property are 'code' and 'type', it will be replaced as BE gives
  */
  const data = response?.data;
  /*
   * Show toast messages and redirect to specific page depending on error if want
   * these, if condition can be redesign depend on server response
   */
  if (typeof response?.status != "undefined") {
    showToast(response?.status, "error", headers);

    // Handling responses.
    switch (response?.status) {
      /*
       * If user has no permission to visit an authorized url user
       * will be redirected to unautorized view
       */
      case 401:
        router.push({
          name: "error",
          params: { tag: "unauthorized-error" },
        });
        break;
      /*
       * If user is forbidden to perform any task.
       */
      case 403:
        router.push({
          name: "error",
          params: { tag: "forbidden-error" },
        });
        break;
      /*
       * If the content is not found.
       */
      case 404:
        router.push({
          name: "error",
          params: { tag: "not-found-error" },
        });
        break;
      /*
       * If error comes from server.
       */
      case 500:
        router.push({
          name: "error",
          params: { tag: "server-error" },
        });
        break;
      default:
        return;
    }
  } else if (message.includes("timeout")) {
    /* Timeout error toast should be shown*/
    showToast("request_timeout_error", "error", headers);
  } else if (data?.code) {
    const { code, type } = data;
    showToast(code, type || "error", headers);
  }
};

/**
 * Show toast message
 *
 * @param {[number,string]} code - custom error code that's represents a phrase_key
 * @param {string} type - what type of toast message to display
 * @param {AxiosRequestHeaders} headers - request config headers, these header can be added on specific Api request such as 'toastPosition' and 'toastTimeout'
 */
function showToast(
  code: number | string,
  type: string,
  headers?: AxiosRequestHeaders
): void {
  const toast = useToast();
  toast[type]("msg", {
    position: headers?.toastPosition || POSITION.BOTTOM_CENTER,
    timeout: headers?.toastTimeout || 6000,
  });
}
