import { StoreDefinition } from "pinia";
import { BaseTrip, Trips } from "../baseTrip";
import { CountryFilter } from "../types";
import { TripEditor } from "@/store/salesConsole/types";

/**
 * Trip represents the complete trip data returned by GET_TRIP query
 * This includes all fields available for trip management and editing
 */
export type Trip = BaseTrip;

/**
 * Additional ticket-related types not in BaseTrip
 */
export type TicketPrice = {
  monetary_value: BaseTrip["monetary_value"];
  valid_from_datetime: Date;
  valid_to_datetime: Date;
};

export type TicketPayment = {
  payment_amount: number;
  payment_datetime: Date;
  payment_referance: string;
  payment_status: string;
};

/**
 * Additional trip filter and operation types
 */
export type TripFilterUpdate = {
  search_list: string;
  query_string: string | null;
  outbound_from_datetime_range: object[] | null;
  trip_type: string;
  country: string | null;
  page: number;
  limit: number;
};

export type TripFilterTypeController = {
  query_string: string | null;
  outbound_from_datetime_range: object[] | null;
};

export interface TripCheckoutInfo {
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  route_points: any[];
}

/**
 * State type
 */
export interface State {
  currentTrip: Trip;
  tripList: Trips;
}

export type TripFilterSharelead = {
  event_status: object;
  country: string | null;
};

export type TripFilter = {
  event_status?: object;
  category?: { contains: string };
  outbound_from_datetime?: { between: string[] };
  search_field: { contains: string };
};

/**
 * Store context types
 */
interface Getters {
  getTripList: () => Trips;
  getTripListNextToken: () => string;
  getCurrentTrip: () => Trip;
}

interface Actions {
  getTrip: (
    tripID: string,
    unitTestCB?: () => void,
    cb?: () => void
  ) => Promise<Trip>;
  getTripListShareLead: (
    filter?: TripFilterSharelead,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListJoiner: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListJoinerArchived: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListJoinerBookingCancelled: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListSalesActive: (
    filter: TripFilter,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListSalesArchived: (
    filter: TripFilter,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListSalesUnpublish: (
    filter: TripFilter,
    nextToken?: string | null
  ) => Promise<object>;
  searchTrip: (filter: TripFilterUpdate) => Promise<object>;
  getSalesActiveTrips: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<void>;
  getSalesUnpublishTrips: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<void>;
  getSalesArchivedTrips: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<void>;
  getTripListJoinerCancelledBooking: (
    filter: CountryFilter,
    nextToken?: string | null
  ) => Promise<void>;
  getTripListForSalesBySearch: (filter: TripFilterUpdate) => Promise<void>;
  setEditor: (editor: TripEditor) => void;
}

export type StoreContext = ReturnType<
  StoreDefinition<"trip", State, Getters, Actions>
>;
