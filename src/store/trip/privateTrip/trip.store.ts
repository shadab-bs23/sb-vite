import { defineStore } from "pinia";
import actions from "./trip.actions";
import state from "./trip.state";
import getters from "./trip.getters";
/*
 * extracting store in one file
 */
const useTripStore = defineStore("trip", {
  state,
  actions,
  getters,
});

export default useTripStore;
