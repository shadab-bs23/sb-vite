import { RoutePoints } from "@/components/ViaPointsPackage/types/types";
import { StoreDefinition } from "pinia";
import { TicketDiscount, TicketPricing } from "../sharebus/types";
import { PickTripFields } from "../trip/baseTrip";

export type SaleTripEditAttributes = {
  trip_location_time: TripLocationTime | object;
  trip_goal: TripGoal | object;
  trip_deadline_passenger_goal: TripGoalDeadline | object;
  trip_ticket_pricing:
    | {
        ticket_pricing: TicketPricing;
      }
    | object;
  max_pax: number;
  update_history: UpdateHistory;
  trip_general_info: object | TripGeneralInfo;
  show_available_seats: boolean;
  trip_ticket_discounts:
    | {
        ticket_discounts: TicketDiscount[];
      }
    | object;
};
export type salesConsoleEditTrip = {
  [key: string]: SaleTripEditAttributes;
};

export type UpdateHistory = {
  trip_location_time: string;
  trip_goal: string;
  trip_ticket_pricing: string;
  trip_ticket_discounts: string;
  trip_pax: string;
  show_trip_available_seats: string;
  trip_general_info: string;
  trip_deadline_passenger_goal: string;
  trip_republish: string;
  updated_by_ferdia_sales: string | TripEditor;
  updated_by_sharelead: string;
};

/**
 * TripGeneralInfo represents basic trip information fields
 * Reuses BaseTrip fields for consistency
 */
export type TripGeneralInfo = PickTripFields<
  | "name"
  | "category"
  | "info_to_travellers"
  | "website_url"
  | "image_url"
  | "trip_organizer"
>;
/**
 * TripLocationTime represents bus and route information
 * Partially reuses BaseTrip fields where applicable
 */
export type TripLocationTime = PickTripFields<"bus_availability"> & {
  bus_signage: string;
  route_points: RoutePoints;
};

/**
 * TripGoal represents passenger goal field
 * Reuses BaseTrip field for consistency
 */
export type TripGoal = PickTripFields<"passenger_goal">;

/**
 * TripGoalDeadline represents deadline passenger goal field
 * Reuses BaseTrip field for consistency
 */
export type TripGoalDeadline = PickTripFields<"deadline_passenger_goal">;

/**
 * TripPricing represents ticket pricing fields
 * Reuses BaseTrip fields for consistency
 */
export type TripPricing = PickTripFields<
  "earlybird_ticket_price" | "regular_ticket_price"
>;
export type TripSetType = {
  [key: string]: {
    [key: string]: object[];
  };
};
export type TripEditor = {
  id: string;
  name: string;
};

export interface ConfirmTripStatus {
  trip_id: string;
  status: number;
}

export interface UnpublishTripStatus extends ConfirmTripStatus {
  message: string;
}

export interface CopyTripStatus extends ConfirmTripStatus {
  message: string;
}

export enum SalesEditGroup {
  MAX_PAX = "trip_pax",
  TRIP_LOCATION_TYPE = "trip_location_time",
  PASSENGER_GOAL = "trip_goal",
  UPDATE_HISTORY = "update_history",
  TRIP_GOAL_DEADLINE = "trip_deadline_passenger_goal",
  TRIP_GENERAL_INFO = "trip_general_info",
  // new payload keys for based on new sharelead flow
  TRIP_TICKET_PRICING = "trip_ticket_pricing",
  SHOW_TRIP_AVAILABLE_SEATS = "show_trip_available_seats",
  TRIP_TICKET_DISCOUNTS = "trip_ticket_discounts",
}

export type CopyTrip = {
  id: string;
  name: string;
};

export type Passenger = {
  name: string;
  phone: string;
  email: string;
  number_of_tickets: number;
  ticket_type: string;
};

export type GetPassengersResponse = { getPassengersList: Passenger[] };

export interface State {
  salesEditTrip: salesConsoleEditTrip;
  editing_mode: boolean;
  copy_trip: CopyTrip;
}
interface Actions {
  setSalesConsoleTripChangeRequest: (payload: TripSetType) => void;
  getSalesConsoleTrip: () => salesConsoleEditTrip;
  updateTripAttribute: (payload: object) => Promise<salesConsoleEditTrip>;
  unpublishTrip: (payload: object) => Promise<UnpublishTripStatus>;
  confirmTrip: (payload: object) => Promise<ConfirmTripStatus>;
  copyTripAction: (payload: object) => Promise<CopyTripStatus>;
  getPassengersAction: (
    tripID: string,
    unitTestCB?: () => void,
    cb?: () => void
  ) => Promise<GetPassengersResponse>;
}

interface Getters {
  getCopyTripData: () => CopyTrip;
}

/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"sales", State, Actions, Getters>
>;
