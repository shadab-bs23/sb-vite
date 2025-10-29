import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  setupSharebus: {
    BusCapacity: 0,
    MinimumPassengerGoal: 0,
    DefaultPassengerGoal: 0,
    EarlyBirdSeatNumber: 0,
    TicketPriceVatRate: 0,
    CutPriceDiscountLimit: 0,
    EarlyBirdDiscountLimit: 0,
    ClubBonusShare: 0.33,
    TicketPriceLogic: {
      ticket_price_logic: {},
      club_share_per_extra_ticket_logic: {},
      price_for_subsidizing_logic: {},
    },
    TripEventCategoryString: "",
    Domain: "",
    MinimumDaysBeforeBooking: 0,
    HideUserRegistrationLink: false,
    HideUserLoginLink: false,
    PassengerGoalDeadlineDays: 0,
    ShowNotificationBanner: false,
    NotificationBannerText: "",
    country_iso_codes: {},
  },
  loading: true,
});
