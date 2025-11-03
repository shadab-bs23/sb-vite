import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  salesEditTrip: {
    "": {
      trip_location_time: {},
      trip_goal: {},
      trip_ticket_pricing: {
        ticket_pricing: {},
      },
      show_available_seats: false,
      trip_deadline_passenger_goal: {},
      max_pax: 0,
      trip_general_info: {},
      trip_ticket_discounts: {
        ticket_discounts: [],
      },
      update_history: {
        trip_location_time: "",
        trip_goal: "",
        trip_ticket_pricing: "",
        trip_ticket_discounts: "",
        trip_pax: "",
        show_trip_available_seats: "",
        trip_general_info: "",
        trip_deadline_passenger_goal: "",
        trip_republish: "",
        updated_by_ferdia_sales: "",
        updated_by_sharelead: "",
        // date includes time
      },
    },
  },
  editing_mode: false,
  showRouteChangeAlert: false,
  copy_trip: {
    id: "",
    name: "",
  },
});
