import { StoreDefinition } from "pinia";
import {
  CreateShareBus,
  publishSharebus,
} from "types/sharebus/ShareBusCreationProcess";
import { TViaPoints } from "@/components/ViaPointsPackage/types/types";
import { Trip } from "../trip/privateTrip/types";

/**
 * Setup types
 */

/**
 * Reusable ticket pricing structure
 */
export type TicketPricing = {
  categories: {
    name: string;
    enabled: boolean;
  }[];
  via_points: {
    id: number;
    category_prices: {
      name: string;
      price: number;
    }[];
  }[];
};

/**
 * Ticket discount structure
 */
export type TicketDiscount = {
  days: number;
  percent: number;
};

export type RouteStepData = {
  busAvailability: boolean;
  no_return_trip_needed?: boolean;
  route_points: {
    oneway: TViaPoints[];
    return: TViaPoints[];
  };
};

export type OrganizationStepData = {
  fromOrganization: number;
  clubOrTeam?: string;
  organizationId?: number | null;
};

export type PassengerGoalAndPriceStepData = {
  // Legacy fields
  passengerGoal?: number;
  tickets?: number;
  discountScheme?: string;
  discountPercentage?: number;
  ticketPrice?: number;
  earlyBirdTicketPrice?: number;
  deductibleAmount?: number;
  bonus?: number;
  totalTicketPrice?: number;
  grandTotalPrice?: number;
  tripCreationTicketDecision: number;
  tripCreationDiscountDecision: number;

  // New API payload structure - simplified
  suggested_ticket_price?: number;
  ticket_pricing?: TicketPricing;
  discounts?: Record<string, { value: number }>;
  show_available_seats: boolean;
  max_pax: number;

  ticket_discounts?: TicketDiscount[];

  // Legacy fields - kept for backward compatibility with existing components
  categoryLabels?: {
    categoryOne: string;
    categoryTwo: string;
    categoryThree: string;
  };
};

/**
 * Trip info type for step details
 */
export type TripInfoData = Pick<
  Trip,
  | "trip_organizer"
  | "name"
  | "website_url"
  | "image_url"
  | "category"
  | "info_to_travellers"
>;

/**
 * Publish step data
 */
export type PublishStepData = {
  publishedAt?: string | Date;
  status?: string;
};

/**
 * State type
 */
export interface State {
  setup: {
    createdTripId?: string;
    redirectLink: string;
    currentStep: number;
    completed: boolean;
    routeStep: RouteStepData;
    organizationStep: OrganizationStepData;
    passengerGoalAndPriceStep: PassengerGoalAndPriceStepData;
    tripInfoStep?: TripInfoData;
    publishStep?: PublishStepData;
  };
}

interface Getters {
  getRouteStepData: () => RouteStepData;
  getOrganizationStepData: () => OrganizationStepData;
  getPassengerGoalAndPriceStepData: () => PassengerGoalAndPriceStepData;
  getTripInfoData: () => TripInfoData | undefined;
  getPublishStepData: () => PublishStepData | undefined;
}
interface Actions {
  setRouteStepData: (routeStepData: RouteStepData) => void;
  setOrganizationStepData: (organizationStepData: OrganizationStepData) => void;
  setPassengerGoalAndPriceStepData: (
    passengerGoalAndPriceStepData: PassengerGoalAndPriceStepData
  ) => void;
  setTripInfoData: (tripInfo: TripInfoData) => void;
  setPublishStepData: (publishStepData: PublishStepData) => void;
  setPassengerGoalAndPriceStepDataSpecific: (
    key: string,
    value: string | number | unknown
  ) => void;
  createSharebus: (payload: CreateShareBus) => void;
  publishSharebus: (payload: publishSharebus) => void;
  cancelSharebus: (tripId: string, type: string) => void;
  downLoadTickets: (tripId: string) => Promise<unknown>;

  // New API payload related actions - simplified
  generateApiPayload: () => {
    suggested_ticket_price: number;
    ticket_pricing: TicketPricing;
    discounts: Record<string, { value: number }>;
  };
  updateTicketPricingCategories: (
    categories: TicketPricing["categories"]
  ) => void;
  updateViaPointsPricing: (viaPoints: TicketPricing["via_points"]) => void;
  updateDiscounts: (discounts: Record<string, { value: number }>) => void;
  updateTicketDiscounts: (ticketDiscounts: TicketDiscount[]) => void;
}

/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"sharebus", State, Getters, Actions>
>;
