import { defineStore } from "pinia";
import actions from "./joinerTrip.actions";
import state from "./joinerTrip.state";
import getters from "./joinerTrip.getters";
/*
 * extracting store in one file
 */
const useJoinerTripStore = defineStore("joinerTrip", {
  state,
  actions,
  getters,
});

export default useJoinerTripStore;
