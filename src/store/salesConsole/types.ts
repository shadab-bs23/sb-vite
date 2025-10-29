import { StoreDefinition } from "pinia";

export type salesConsoleEditTrip = {
  [key: string]: {
    trip_location_time: Itinerary | object;
    trip_goal: TripGoal | object;
    trip_deadline_passenger_goal: TripGoalDeadline | object;
    trip_pricing: TripPricing | object;
    update_history: UpdateHistory;
    trip_general_info: object | TripGeneralInfo;
  };
};

export type UpdateHistory = {
  trip_location_time: string;
  trip_goal: string;
  trip_pricing: string;
  trip_general_info: string;
  trip_deadline_passenger_goal: string;
  trip_republish: string;
  updated_by_ferdia_sales: string | TripEditor;
  updated_by_sharelead: string;
};

export type Itinerary = {
  outbound_from: string;
  outbound_from_lat_long: string;
  outbound_to: string;
  outbound_to_lat_long: string;
  outbound_from_datetime: string;
  outbound_to_datetime: string;
  return_from: string;
  return_from_lat_long: string;
  return_to: string;
  return_to_lat_long: string;
  return_from_datetime: string;
  return_to_datetime: string;
};

export type TripGeneralInfo = {
  name: string;
  category: string;
  info_to_travellers: string;
  website_url: string;
  image_url: string;
  trip_organizer: string;
};
export type TripGoal = {
  passenger_goal: number;
};
export type TripGoalDeadline = {
  deadline_passenger_goal: string;
};
export type TripPricing = {
  earlybird_ticket_price: number;
  regular_ticket_price: number;
};
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
  TRIP_PRICING = "trip_pricing",
  UPDATE_HISTORY = "update_history",
  TRIP_GOAL_DEADLINE = "trip_deadline_passenger_goal",
  TRIP_GENERAL_INFO = "trip_general_info",
}

export type CopyTrip = {
  id: string;
  name: string;
};

export type Passenger = {
  name: string;
  phoneNumber: string;
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
