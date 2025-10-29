import { defineStore } from "pinia";
import actions from "./payment.actions";
import state from "./payment.state";
import getters from "./payment.getters";
/*
 * extracting store in one file
 */
const usePaymentInfoStore = defineStore("paymentInfo", {
  state,
  actions,
  getters,
});

export default usePaymentInfoStore;
