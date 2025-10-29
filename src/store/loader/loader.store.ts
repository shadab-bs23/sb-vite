import { defineStore } from "pinia";
import actions from "./loader.actions";
import state from "./loader.state";
import getters from "./loader.getters";
/*
 * extracting store in one file
 */
const useLoaderStore = defineStore("loader", {
  state,
  actions,
  getters,
});

export default useLoaderStore;
