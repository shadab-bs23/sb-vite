import { StoreDefinition } from "pinia";
import { PaymentIntentType } from "types/payment/payment.type";

export type PaymentConfirmationPayload = {
  transaction_id: string;
};
export type TicketHolderInfo = {
  name: string;
  email: string;
  phone: string;
};

export type TicketCategoryPayload = {
  via_point_id: number;
  category: string;
  quantity: number;
  ticket_holders: TicketHolderInfo[];
};

export type TicketBookedPayload = {
  trip_id: string;
  total_price: number;
  early_bird_tickets: number;
  regular_tickets: number;
  last_updated_at: string | null;
  tickets: TicketCategoryPayload[];
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
