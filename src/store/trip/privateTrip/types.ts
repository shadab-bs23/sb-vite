import { TripEditor, UpdateHistory } from "@/store/salesConsole/types";
import { StoreDefinition } from "pinia";
import { OrganizationType } from "types/organization/organization.type";
import { Coordinate } from "../../../.././types/sharebus/map.type";
import { CountryFilter, TripList, Trips } from "../types";

/**
 * Trip types
 */
export type MonetaryValue = {
  amount: number;
  currency: string;
};

export type TripSubsidy = {
  total_amount: MonetaryValue;
  balance_amount: MonetaryValue;
};

export type TicketPrice = {
  monetary_value: MonetaryValue;
  valid_from_datetime: Date;
  valid_to_datetime: Date;
};

export type TicketPayment = {
  payment_amount: number;
  payment_datetime: Date;
  payment_referance: string;
  payment_status: string;
};

export type Ticket = {
  trip_id: string;
  ticket_id: string;
  type: string;
  ticket_price: number;
  transaction_id: string;
  download_url: string;
  requester: string;
};
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

export type TicketCancelled = {
  ticket_id: string;
  ticket_price: number;
  status: string;
  type: string;
};

export type CanceledTicketTransaction = {
  id: string;
  amount: number;
  payment_with: string;
  status: string;
};
export interface Trip extends TripList {
  monetary_value: MonetaryValue;
  requester: string;
  outbound_from_lat_long?: Coordinate;
  outbound_to;
  outbound_to_lat_long?: Coordinate;
  outbound_timezone: string;
  return_from_lat_long?: Coordinate;
  return_to_lat_long?: Coordinate;
  return_timezone: string;
  route_points: string;
  country: string;
  trip_type: string;
  bus_availability: boolean;
  max_pax: number;
  max_pax_teq: number;
  passenger_goal: number;
  sales_channel: string;
  minimum_pax: number;
  organization: OrganizationType;
  subsidy: TripSubsidy;
  total_earlybird_tickets: number;
  total_regular_tickets: number;
  deadline_ticket_selling: string;
  available_earlybird_tickets: number;
  available_regular_tickets: number;
  name: string;
  category: string;
  info_to_travellers: string;
  website_url: string;
  digital_sign: string;
  discount_scheme: string;
  year: number;
  booking_reference: string;
  club_share_per_extra_ticket: number;
  is_published: boolean;
  trip_organizer: string;
  ticket: Ticket[];
  sharelead_ticket_reserved_price: number;
  sharelead_contributed_amount: number;
  tickets_reserved: number;
  embedded_link: string;
  vat_percent: number;
  deadline_passenger_goal: string;
  update_history: UpdateHistory;
  updated_at: string;
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

interface Getters {
  getTripList: () => Trips;
  getTripListNextToken: () => string;
  getCurrentTrip: () => Trip;
}
interface Actions {
  getTrip: (tripID: string, unitTestCB?: () => void, cb?: () => void) => void;
  getTripListShareLead: (
    filter: TripFilterSharelead,
    nextToken?: string | null
  ) => Promise<object>;
  getTripListJoiner: (
    filter: CountryFilter,
    nextToken: string | null
  ) => Promise<object>;
  getTripListJoinerArchived: (
    filter: CountryFilter,
    nextToken: string | null
  ) => Promise<object>;
  getSalesActiveTrips(
    filter: CountryFilter,
    nextToken: string | null
  ): Promise<void>;
  getSalesUnpublishTrips(
    filter: CountryFilter,
    nextToken: string | null
  ): Promise<void>;
  getSalesArchivedTrips(
    filter: CountryFilter,
    nextToken: string | null
  ): Promise<void>;
  getTripListJoinerCancelledBooking(
    filter: CountryFilter,
    nextToken: string | null
  ): Promise<void>;
  getTripListForSalesBySearch(filter: TripFilterUpdate): Promise<void>;
  setEditor: (editor: TripEditor) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"trip", State, Getters, Actions>
>;
