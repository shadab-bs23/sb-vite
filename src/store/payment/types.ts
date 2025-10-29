import { StoreDefinition } from "pinia";
import { PaymentIntentType } from "types/payment/payment.type";

export type PaymentConfirmationPayload = {
  transaction_id: string;
};
export type TicketBookedPayload = {
  trip_id: string;
  total_price: number;
  early_bird_tickets: number;
  regular_tickets: number;
  last_updated_at: string;
};
export interface State {
  paymentIntent: PaymentIntentType;
}

interface Getters {
  getShareleadPaymentIntentData: () => PaymentIntentType;
}
interface Actions {
  fetchShareleadPaymentIntentData: (stripePayload) => void;
  fetchJoinerPaymentIntentData: (stripePayload) => void;
  shareleadFetchPaymentRedirectURL: (trip_id: string) => void;
  handleVippsPaymentConfirmation: (payload: PaymentConfirmationPayload) => void;
  joinerTicketBookedAndFetchRedirectInfo: (
    payload: TicketBookedPayload
  ) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"paymentInfo", State, Getters, Actions>
>;
