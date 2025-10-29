import { StoreDefinition } from "pinia";

/**
 * Setup types
 */
export type SetupSharebusConfig = {
  BusCapacity: number;
  MinimumPassengerGoal: number;
  DefaultPassengerGoal: number;
  EarlyBirdSeatNumber: number;
  TicketPriceVatRate: number;
  CutPriceDiscountLimit: number;
  EarlyBirdDiscountLimit: number;
  ClubBonusShare: number;
  TripEventCategoryString: string;
  TicketPriceLogic: {
    ticket_price_logic: object;
    price_for_subsidizing_logic: object;
    club_share_per_extra_ticket_logic: object;
  }; // json logic rule
  Domain: string;
  MinimumDaysBeforeBooking: number;
  HideUserRegistrationLink: boolean;
  HideUserLoginLink: boolean;
  PassengerGoalDeadlineDays: number;
  ShowNotificationBanner: boolean;
  NotificationBannerText: string;
  country_iso_codes: object;
};

/**
 * State type
 */
export interface State {
  setupSharebus: SetupSharebusConfig;
  loading: boolean;
}

interface Getters {
  getSharebusSetupConfig: () => SetupSharebusConfig;
}
interface Actions {
  fetchSetupSharebusConfig: () => void;
}

/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"config", State, Getters, Actions>
>;
