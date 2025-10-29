import {
  useBusInfoStore,
  useCartStore,
  useConfigStore,
  useJoinerTripStore,
  usePaymentInfoStore,
  useSalesStore,
  useSharebusStore,
  useSignUpStore,
} from "@/store";
/**
 * removeUnusedStorage() is a function used to remove unused or unnecessary data from local storage.
 * @return {void}
 */
export const removeUnusedStorage = (routeName: string) => {
  deleteFromLocalStorage("paymentInfo");
  deleteFromLocalStorage("joinerTrip");
  deleteFromLocalStorage("shareLeadTrip");
  deleteFromLocalStorage("user");
  deleteFromLocalStorage("config");

  if (routeName !== "auth") {
    deleteFromLocalStorage("signup");
  }

  if (
    routeName !== "trip-sales-page" &&
    routeName !== "trip-sales-dit-published" &&
    routeName !== "sales-edit-itinerary"
  ) {
    deleteFromLocalStorage("sales");
  }

  if (routeName !== "setup-sharebus") {
    deleteFromLocalStorage("sharebus");
    deleteFromLocalStorage("busInfo");
  }
};

const mapStore = {
  sharebus: useSharebusStore,
  paymentInfo: usePaymentInfoStore,
  joinerTrip: useJoinerTripStore,
  busInfo: useBusInfoStore,
  sales: useSalesStore,
  cartStore: useCartStore,
  signup: useSignUpStore,
  config: useConfigStore,
};
/**
 * As local storage is not reactive this function handle it when local storage key removed its reset the stores as well
 *not satisfied with solution will pick this up later on
 * @param key -store key
 *
 */
const resetLocalStorage = (key) => {
  mapStore[key]().$reset();
};

export const deleteFromLocalStorage = (key) => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    if (Object.keys(mapStore).includes(key)) resetLocalStorage(key);
  }
};

/**
 * Retrieves an item from local storage.
 * @param {string} key - The key to retrieve.
 * @returns {string|null} - The value associated with the key, or null if it doesn't exist.
 */
export const localStorageGetItem = (key: string): string | null => {
  return localStorage.getItem(key);
};

/**
 * Saves an item to local storage.
 * @param {string} key - The key to set.
 * @param {string} value - The value to associate with the key.
 */
export const localStorageSetItem = (key: string, value: string) => {
  return localStorage.setItem(key, value);
};
