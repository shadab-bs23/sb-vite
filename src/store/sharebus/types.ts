import { StoreDefinition } from "pinia";
import {
  CreateShareBus,
  publishSharebus,
} from "./types/sharebus/ShareBusCreationProcess";
import {
  Coordinate,
  Distance,
  Duration,
} from "../../.././types/sharebus/map.type";
import { TViaPoints } from "@/components/ViaPointsPackage/types/types";

/**
 * Setup types
 */
export type SharebusStepOne = {
  origin?: string;
  originLatLng?: Coordinate;
  destination?: string;
  destinationLatLng?: Coordinate;
  departureDate?: string | null;
  departureTime?: string | null;
  departureArrivalDateTime: string | null;
  returnDate?: string | null;
  returnTime?: string | null;
  departureDateTime?: string | null;
  returnDateTime?: string | null;
  returnArrivalDateTime: string | null;
  busAvailability: boolean;
  distance?: Distance | null;
  duration?: Duration | null;
  viaPoints: {
    oneway: TViaPoints[];
    return: TViaPoints[];
  };
};

export type SharebusStepTwo = {
  fromOrganization: number;
  clubOrTeam?: string;
  organizationId?: number | null;
};

export type SharebusStepThree = {
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
  shareLeadTicketDecision: number;
  shareLeadDiscountDecision: number;
};

/**
 * State type
 */
export interface State {
  setup: {
    redirectLink: string;
    currentStep: number;
    completed: boolean;
    stepOne: SharebusStepOne;
    stepTwo: SharebusStepTwo;
    stepThree: SharebusStepThree;
  };
}

interface Getters {
  getStepOneData: () => SharebusStepOne;
  getStepTwoData: () => SharebusStepTwo;
  getStepThreeData: () => SharebusStepThree;
}
interface Actions {
  setStepOneData: (stepOnePayload: SharebusStepOne) => void;
  setStepTwoData: (stepTwoPayload: SharebusStepTwo) => void;
  setStepThreeData: (stepTwoPayload: SharebusStepThree) => void;
  setStep3DataSpecific: (key: string, value: string | number) => void;
  createSharebus: (payload: CreateShareBus) => void;
  publishSharebus: (payload: publishSharebus) => void;
  cancelSharebus: (tripId: string, type: string) => void;
  downLoadTickets: (tripId: string) => Promise<object>;
}

/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"sharebus", State, Getters, Actions>
>;
