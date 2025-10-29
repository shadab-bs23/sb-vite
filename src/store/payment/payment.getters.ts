import { PaymentIntentType } from "types/payment/payment.type";
import { State } from "./types";

export default {
  /**
   * getting payment intent info
   * @returns {PaymentIntentType}
   */
  getShareleadPaymentIntentData(state: State): PaymentIntentType {
    return state.paymentIntent;
  },
};
