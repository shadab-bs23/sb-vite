import { defineStore } from "pinia";
import actions from "./sales.actions";
import state from "./sales.state";
import getters from "./sales.getters";
/*
 * extracting store in one file
 */
const useSalesStore = defineStore("sales", {
  state,
  actions,
  getters,
  persist: true,
});

export default useSalesStore;
