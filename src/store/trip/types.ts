import {
  Trip,
  TicketCancelled,
  CanceledTicketTransaction,
} from "./privateTrip/types";

export interface TripList {
  name: string;
  id: string;
  outbound_from: string;
  trip_status: string;
  outbound_to: string;
  outbound_from_datetime: string;
  outbound_to_datetime: string;
  return_from: string;
  return_from_datetime: string;
  return_to_datetime: string;
  return_to: string;
  trip_type: string;
  available_earlybird_tickets: number;
  regular_ticket_price: number;
  earlybird_ticket_price: number;
  is_published: boolean;
  image_url: string;
  sharelead_payment_status?: string;
  is_unpublished_by_sales?: boolean;
  canceled_tickets?: TicketCancelled[];
  canceled_tickets_transactions?: CanceledTicketTransaction[];
}

export interface Trips {
  nextToken: string;
  items: Trip[];
  total: number;
}

export type CountryFilter = {
  country: string;
};
