import { defineStore } from "pinia";
import actions from "./config.actions";
import state from "./config.state";
import getters from "./config.getters";
/*
 * extracting store in one file
 */
const useConfigStore = defineStore("config", {
  state,
  actions,
  getters,
});

export default useConfigStore;
