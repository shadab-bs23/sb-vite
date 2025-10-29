import { TicketType } from "@/composables/useTicketTypes";

export interface TicketHolder {
  id?: string;
  type?: TicketType;
  count?: number;
  price?: number;
  route?: string;
  name?: string;
  email?: string;
  phone?: string;
  copyToAll: boolean;
}

export interface RoutePoint {
  point: string;
  planned_departure_time?: string;
  planned_arrival_time?: string;
}

export interface TripInfo {
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  route_points?: RoutePoint[];
}
