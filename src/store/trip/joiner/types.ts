import { StoreDefinition } from "pinia";
import { TripFilterUpdate } from "../privateTrip/types";
import { TripList } from "../types";

/**
 * Public trip
 */
export interface PublicTrip extends TripList {
  outbound_timezone: string;
  return_timezone: string;
  passenger_goal: number;
  booking_reference: string;
  embedded_link: string;
  total_regular_tickets: number;
  available_regular_tickets: number;
  total_earlybird_tickets: number;
  available_earlybird_tickets: number;
  total_cancelled_tickets: number;
  deadline_ticket_selling: string;
  category: string;
  trip_organizer: string;
  info_to_travellers: string;
  website_url: string;
  max_pax: number;
  discount_scheme: string;
  vat_percent: number;
  outbound_from: string;
  outbound_to: string;
  outbound_from_datetime: string;
  outbound_to_datetime: string;
  return_from: string;
  return_to: string;
  return_from_datetime: string;
  return_to_datetime: string;
  route_points: string;
  deadline_passenger_goal: string;
  updated_at: string;
}
/*
/**
 * State type
 */
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
export type CountryFilter = {
  country: string;
};
export interface State {
  trip: PublicTrip;
  currentStep: number;
  availablePublicTrips: {
    nextToken: string;
    items: PublicTrip[];
    total: number;
  };
}

interface Getters {
  getCurrentTrip: (state: State) => PublicTrip;
  getPublicTripList: (state: State) => TripList[];
  getCurrentStep: (state: State) => number;
}
interface Actions {
  getPublicTrip: (
    tripID: string,
    bookingReference?: string,
    unitTestCB?: () => void,
    cb?: () => void
  ) => Promise<PublicTrip>;
  setCurrentStep: (step: number) => void;
  fetchPublicTripListForJoiner: (
    filter: CountryFilter,
    nextToken: string | null
  ) => Promise<object>;
  getTripListForJoinerBySearch: (filter: TripFilterUpdate) => Promise<void>;
  cancelTickets: (tripID: string) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"joinerTrip", State, Getters, Actions>
>;
