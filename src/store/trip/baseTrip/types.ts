import { StoreDefinition } from "pinia";
import { Coordinate } from "../../../../types/sharebus/map.type";
import { OrganizationType } from "types/organization/organization.type";
import { TicketDiscount, TicketPricing } from "@/store/sharebus/types";
import { UpdateHistory } from "@/store/salesConsole/types";

/**
 * Common trip types
 */
export type MonetaryValue = {
  amount: number;
  currency: string;
};

export type TripSubsidy = {
  total_amount: MonetaryValue;
  balance_amount: MonetaryValue;
};

export type Ticket = {
  trip_id: string;
  ticket_id: string;
  type: string;
  ticket_price: number;
  transaction_id: string;
  download_url: string;
  requester: string;
  trip_via_point_id: number;
  category: string;
};

export type TicketCancelled = {
  ticket_id: string;
  ticket_price: number;
  status: string;
  type: string;
  transaction_id: string;
};

export type CanceledTicketTransaction = {
  id: string;
  amount: number;
  payment_with: string;
  status: string;
};

/**
 * BaseTrip interface containing all possible trip fields
 * This serves as the single source of truth for all trip-related data
 */
export interface BaseTrip {
  // Core identification fields
  id: string;
  name: string;
  booking_reference: string;

  // Location and routing fields
  outbound_from: string;
  outbound_from_lat_long?: Coordinate;
  outbound_to: string;
  outbound_to_lat_long?: Coordinate;
  outbound_from_datetime: string;
  outbound_to_datetime: string;
  outbound_timezone: string;
  return_from: string;
  return_from_lat_long?: Coordinate;
  return_to: string;
  return_to_lat_long?: Coordinate;
  return_from_datetime: string | null;
  return_to_datetime: string | null;
  return_timezone: string;
  route_points: string;
  country: string;

  // Trip configuration fields
  trip_type: string;
  category: string;
  trip_status: string;
  bus_availability?: boolean;

  // Passenger and capacity fields
  max_pax: number;
  max_pax_teq?: number;
  passenger_goal: number;
  minimum_pax?: number;

  // Pricing fields
  regular_ticket_price: number;
  earlybird_ticket_price: number;
  total_regular_tickets: number;
  total_earlybird_tickets: number;
  available_regular_tickets: number;
  available_earlybird_tickets: number;
  total_cancelled_tickets?: number;
  deadline_ticket_selling: string;
  discount_scheme: string;
  vat_percent: number;
  price_for_subsidizing?: number;
  total_bus_price?: number;

  // ShareLead specific fields
  sharelead_payment_status?: string;
  sharelead_ticket_reserved_price?: number;
  sharelead_contributed_amount?: number;
  tickets_reserved?: number;
  club_share_per_extra_ticket?: number;

  // Publishing and visibility fields
  is_published: boolean;
  is_unpublished_by_sales?: boolean;
  embedded_link: string;
  website_url: string;
  image_url: string;

  // Content fields
  info_to_travellers: string;
  trip_organizer: string;

  // System fields
  requester?: string;
  sales_channel?: string;
  digital_sign?: string;
  year?: number;
  updated_at: string;
  deadline_passenger_goal: string;
  deadline_passenger_goal_reminder?: string;
  deadline_trip_reminder?: string;

  // Complex object fields
  monetary_value?: MonetaryValue;
  organization?: OrganizationType;
  subsidy?: TripSubsidy;
  ticket?: Ticket[];
  canceled_tickets?: TicketCancelled[];
  canceled_tickets_transactions?: CanceledTicketTransaction[];
  update_history: UpdateHistory;

  // New pricing structure fields
  show_available_seats?: boolean;
  ticket_pricing?: TicketPricing;
  ticket_discounts?: TicketDiscount[];
  minimum_possible_ticket_price: number;
}

/**
 * Utility type for picking specific fields from BaseTrip
 */
export type PickTripFields<T extends keyof BaseTrip> = Pick<BaseTrip, T>;

/**
 * Trip lists and collections
 */
export interface Trips {
  nextToken: string;
  items: BaseTrip[];
  total: number;
}

export type CountryFilter = {
  country: string;
};
