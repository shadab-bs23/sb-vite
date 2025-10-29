import { CopyTrip, State } from "./types";

export default {
  /**
   * gettin copy trip data
   * @returns {CopyTrip}
   */
  getCopyTripData(state: State): CopyTrip {
    return state.copy_trip;
  },
};
