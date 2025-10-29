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
    HideUserRegistrationLink: false,
    HideUserLoginLink: false,
    ShowNotificationBanner: false,
    NotificationBannerText: "",
    country_iso_codes: {},

    MinimumDaysBeforeBooking: 0,
    TripPublishReminderDays: 0,
    TripPublishReminderTimeOfDay: "",
    TripPublishWeeklyReminderDayOfWeek: 0,
    TripPublishDeadlineDays: 0,
    TripPublishDeadlineTimeOfDay: "",
    PassengerGoalDeadlineDays: 5,
    PassengerGoalDeadlineTimeOfDay: "",
    PassengerGoalReminderDays: 0,
    PassengerGoalReminderTimeOfDay: "",
    TripReminderDays: 0,
    TripReminderTimeOfDay: "",
    TicketSalesDeadlineDays: 0,
    TicketSalesDeadlineTimeOfDay: "",
    FerdiaSupportTripReminderDays: 0,
    FerdiaSupportTripReminderTimeOfDay: "",
    FerdiaSupportEmail: "",
  },
  loading: true,
});
