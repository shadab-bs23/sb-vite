import { defineStore } from "pinia";
import actions from "./user.actions";
import state from "./user.state";
import getters from "./user.getters";
/*
 * extracting store in one file
 */
const useUserStore = defineStore("user", {
  state,
  actions,
  getters,
});

export default useUserStore;
