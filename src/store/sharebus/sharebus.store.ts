import { defineStore } from "pinia";
import actions from "./sharebus.actions";
import state from "./sharebus.state";
import getters from "./sharebus.getters";
/*
 * extracting store in one file
 */
const useSharebusStore = defineStore("sharebus", {
  state,
  actions,
  getters,
  persist: true,
});

export default useSharebusStore;
