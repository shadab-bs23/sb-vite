import { Coordinate } from "./map.type";
export type Tickets = {
  issue_number: number;
  ticket_price: number;
};

export type CreateShareBus = {
  outbound_from: string;
  outbound_from_lat_long: Coordinate;
  outbound_to: string;
  outbound_to_lat_long: Coordinate;
  outbound_to_datetime: string;
  outbound_from_datetime: string;
  outbound_timezone: string;
  return_from: string;
  return_from_lat_long: Coordinate;
  return_to: string;
  return_to_lat_long: Coordinate;
  return_to_datetime: string;
  return_from_datetime: string;
  return_timezone: "Europe/Oslo";
  no_return_trip_needed: boolean;
  organization_id: number | null;
  passenger_goal: number;
  total_bus_price: number;
  tickets_reserved?: number;
  discount_scheme: string;
  discount_percentage: number;
  ticket: Tickets[];
  sharelead_contributed_amount: number;
  club_share_per_extra_ticket: number;
  sharelead_ticket_reserved_price: number;
  sharelead_total_payable_amount: number;
  regular_ticket_price: number;
  earlybird_ticket_price: number;
  country: string;
  currency: string;
  bus_availability: boolean;
  route_points: string;
};

export type publishSharebus = {
  id: string;
  name: string;
  category: string;
  info_to_travellers: string;
  website_url: string;
  image_url: string;
  trip_organizer: string;
};
