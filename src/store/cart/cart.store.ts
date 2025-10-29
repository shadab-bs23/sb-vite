import { defineStore } from "pinia";
import actions from "./cart.actions";
import state from "./cart.state";
/*
 * extracting store in one file
 */
const useCartStore = defineStore("cartStore", {
  state,
  actions,
  persist: true,
});

export default useCartStore;
