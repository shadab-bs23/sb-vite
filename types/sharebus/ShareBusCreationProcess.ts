import { Coordinate } from "./map.type";
import { TicketPricing, TicketDiscount } from "@/store/sharebus/types";
import { BaseTrip, PickTripFields } from "@/store/trip/baseTrip";

export type Tickets = {
  issue_number: number;
  ticket_price: number;
};

/**
 * CreateShareBus represents the input fields needed to create a new sharebus trip
 * This is based on the createSharebusMutation input requirements
 */
export type CreateShareBus = PickTripFields<
  | "outbound_from"
  | "outbound_to"
  | "outbound_from_datetime"
  | "outbound_to_datetime"
  | "outbound_timezone"
  | "return_from"
  | "return_to"
  | "return_from_datetime"
  | "return_to_datetime"
  | "return_timezone"
  | "passenger_goal"
  | "regular_ticket_price"
  | "earlybird_ticket_price"
  | "country"
  | "bus_availability"
  | "route_points"
  | "max_pax"
  | "show_available_seats"
  | "ticket_pricing"
  | "ticket_discounts"
  | "sharelead_contributed_amount"
  | "club_share_per_extra_ticket"
  | "sharelead_ticket_reserved_price"
  | "tickets_reserved"
  | "discount_scheme"
  | "total_bus_price"
> & {
  // Required coordinate fields for creation
  outbound_from_lat_long: Coordinate;
  outbound_to_lat_long: Coordinate;
  return_from_lat_long: Coordinate;
  return_to_lat_long: Coordinate;
  // Additional creation-specific fields
  no_return_trip_needed: boolean;
  organization_id: number | null;
  discount_percentage: number;
  sharelead_total_payable_amount: number;
  currency: string;
};

export type publishSharebus = PickTripFields<
  | "id"
  | "name"
  | "category"
  | "info_to_travellers"
  | "website_url"
  | "image_url"
  | "trip_organizer"
>;
