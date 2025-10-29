import { StoreDefinition } from "pinia";
import { TripFilterUpdate } from "../privateTrip/types";
import { PickTripFields } from "../baseTrip";
import { TripList } from "../types";

/**
 * PublicTrip represents the fields returned by the GET_PUBLIC_TRIP query
 * This is specifically for public-facing trip data with joiner-relevant fields
 */
export type PublicTrip = PickTripFields<
  | "id"
  | "name"
  | "outbound_from"
  | "outbound_to"
  | "country"
  | "outbound_from_datetime"
  | "outbound_to_datetime"
  | "outbound_timezone"
  | "return_from"
  | "return_to"
  | "return_from_datetime"
  | "return_to_datetime"
  | "return_timezone"
  | "route_points"
  | "passenger_goal"
  | "booking_reference"
  | "embedded_link"
  | "trip_type"
  | "max_pax"
  | "discount_scheme"
  | "category"
  | "regular_ticket_price"
  | "earlybird_ticket_price"
  | "available_earlybird_tickets"
  | "available_regular_tickets"
  | "total_regular_tickets"
  | "total_earlybird_tickets"
  | "total_cancelled_tickets"
  | "trip_status"
  | "deadline_ticket_selling"
  | "info_to_travellers"
  | "image_url"
  | "is_published"
  | "website_url"
  | "trip_organizer"
  | "vat_percent"
  | "deadline_passenger_goal"
  | "updated_at"
  | "minimum_possible_ticket_price"
  | "ticket_pricing"
  | "ticket_discounts"
  | "show_available_seats"
>;

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

export type SupportRequestInput = {
  trip_id: string;
  subject: string;
  description: string;
  attachment_urls: string[];
  support_type: string;
  country?: string;
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
  getTripListForJoinerBySearch: (filter: TripFilterUpdate) => Promise<void>;
  cancelTickets: (tripID: string) => void;
  submitSupportRequest: (
    this: StoreContext,
    payload: SupportRequestInput
  ) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"joinerTrip", State, Getters, Actions>
>;
