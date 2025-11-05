import { StoreDefinition } from "pinia";
import { Trip } from "../trip/privateTrip/types";
import { JoinerTicket } from "../trip/joiner/types";

export interface TicketItem {
  categoryName: string;
  quantity: number;
  price: number;
}

export interface FormattedTicketHolder {
  name: string;
  email: string;
  phone: string;
}

export interface FormattedTicket {
  via_point_id: number;
  category: string;
  quantity: number;
  ticket_holders: FormattedTicketHolder[];
}

export interface State {
  tripId: string;
  selectedViaPointId: number | null;
  tickets: TicketItem[];
  totalPayablePrice: number;
  eligibleDiscountPercent: number;
  formattedTickets: FormattedTicket[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Getters {}

interface Actions {
  // Simple cart actions
  setTripId: (tripId: string) => void;
  setSelectedViaPointId: (viaPointId: number) => void;
  addTicket: (ticket: TicketItem) => void;
  updateTicket: (categoryName: string, quantity: number) => void;
  removeTicket: (categoryName: string) => void;
  setEligibleDiscount: (discount: number) => void;
  clearCart: () => void;
  calculateTotalPrice: () => void;

  // Formatted tickets handling
  setFormattedTickets: (tickets: FormattedTicket[]) => void;
  getFormattedTickets: () => FormattedTicket[];

  // Getters
  getTotalPrice: () => number;
  getTickets: () => TicketItem[];
  hasItems: () => boolean;
  getCartItemCount: () => number;
  getJoinerTicketsExist: () => { tripId: string };
  getJoinerTickets: (trip: Trip) => JoinerTicket;
}

/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"cartStore", State, Getters, Actions>
>;
