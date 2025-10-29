import { POSITION, useToast } from "vue-toastification";
import { ToastContent } from "vue-toastification/dist/types/types";

/**
 * Show toast message
 *
 * @param {string} type - what type of toast message to display
 * @param {[number,string]} message - custom error code that's represents a phrase_key
 * @param {string} position - Position of toast. Values: "bottom-center", "top-right" etc.
 */
export const showToast = (
  type: string,
  message: string,
  timeout?: number,
  position = ""
): void => {
  const toast = useToast();
  toast[type](message, {
    position: position || POSITION.BOTTOM_CENTER,
    timeout: timeout || 6000,
  });
};
const defaultOption = {
  position: POSITION.TOP_CENTER,
  timeout: false,
  closeOnClick: false,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false,
  id: "component-toast",
};
export const toastWithActionable = (
  content: ToastContent,
  type = "info",
  options = defaultOption
) => {
  const toast = useToast();
  toast[type](content, {
    ...options,
    ...defaultOption,
  });
};

export const clearToast = () => {
  const toast = useToast();
  toast.clear();
};
export const dismissToast = (id: string) => {
  const toast = useToast();
  toast.dismiss(id);
};
