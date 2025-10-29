import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  salesEditTrip: {
    "": {
      trip_location_time: {},
      trip_goal: {},
      trip_pricing: {},
      trip_deadline_passenger_goal: {},
      trip_general_info: {},
      update_history: {
        trip_location_time: "",
        trip_goal: "",
        trip_pricing: "",
        trip_general_info: "",
        trip_deadline_passenger_goal: "",
        trip_republish: "",
        updated_by_ferdia_sales: "",
        updated_by_sharelead: "",
      },
    },
  },
  editing_mode: false,
  copy_trip: {
    id: "",
    name: "",
  },
});
