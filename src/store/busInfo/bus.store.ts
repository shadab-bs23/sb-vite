import { defineStore } from "pinia";
import actions from "./bus.actions";
import state from "./bus.state";
import getters from "./bus.getters";
/*
 * extracting store in one file
 */
const useBusInfoStore = defineStore("busInfo", {
  state,
  actions,
  getters,
  persist: true,
});

export default useBusInfoStore;
