import { defineStore } from "pinia";
import actions from "./signup.actions";
import state from "./signup.state";
import getters from "./signup.getters";
/*
 * extracting store in one file
 */
const useLoaderStore = defineStore("signup", {
  state,
  persist: true,
  actions,
  getters,
});

export default useLoaderStore;
