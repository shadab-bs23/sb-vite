import { TripList } from "../types";
import { PublicTrip, State } from "./types";

export default {
  /**
   *
   * @param {State} - state
   * @returns {PublicTrip} - Current public Trip
   */
  getCurrentTrip(state: State): PublicTrip {
    return state.trip;
  },
  /**
   *
   * @param {State} - state
   * @returns {string} - public trips next token
   */
  getPublicTripListNextToken(state: State): string {
    return state.availablePublicTrips.nextToken;
  },
  /**
   *
   * @param {State} - state
   * @returns {PublicTrip[]} - list of public trips
   */
  getPublicTripList(state: State): TripList[] {
    return state.availablePublicTrips.items;
  },

  /**
   *
   * @param {State} - state
   */
  getCurrentStep(state: State): number {
    return state.currentStep;
  },
};
