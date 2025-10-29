import { BaseTrip, PickTripFields } from "./baseTrip";

/**
 * TripList represents the fields typically shown in trip listings
 * Based on commonly used fields across different trip list queries
 */
export type TripList = PickTripFields<
  | "id"
  | "name"
  | "outbound_from"
  | "outbound_to"
  | "outbound_from_datetime"
  | "outbound_to_datetime"
  | "return_from"
  | "return_from_datetime"
  | "return_to_datetime"
  | "return_to"
  | "trip_type"
  | "trip_status"
  | "available_earlybird_tickets"
  | "regular_ticket_price"
  | "earlybird_ticket_price"
  | "is_published"
  | "image_url"
  | "sharelead_payment_status"
  | "is_unpublished_by_sales"
  | "canceled_tickets"
  | "canceled_tickets_transactions"
  | "minimum_possible_ticket_price"
>;

export interface Trips {
  nextToken: string;
  items: BaseTrip[];
  total: number;
}

export type CountryFilter = {
  country: string;
};
