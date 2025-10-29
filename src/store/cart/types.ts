import { StoreDefinition } from "pinia";
import { Trip } from "../trip/privateTrip/types";

export interface JoinerTicket {
  tripId: string;
  earlyBirdTickets: {
    count: number;
    price: number;
  };
  regularTickets: {
    count: number;
    price: number;
  };
}
export interface State {
  tickets: JoinerTicket[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Getters {}
interface Actions {
  setJoinerTickets: (tickets: JoinerTicket, isSave?: boolean) => void;
  setJoinerTicketsByTripId: (ticket: JoinerTicket, trip: Trip) => void;
  getJoinerTickets: (trip: Trip) => JoinerTicket;
  getJoinerTotalTickets: (trip: Trip) => number;
  getJoinerTotalTicketPrice: (trip: Trip) => number;
  getJoinerTicketsExist: () => object | undefined;
  removeJoinerTickets: (tripId: string) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"cartStore", State, Getters, Actions>
>;
