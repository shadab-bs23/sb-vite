import { defineStore } from "pinia";
import actions from "./organization.actions";
import state from "./organization.state";
import getters from "./organization.getters";
/*
 * extracting store in one file
 */
const useOrganizationStore = defineStore("organization", {
  state,
  actions,
  getters,
});

export default useOrganizationStore;
