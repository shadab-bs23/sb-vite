import { Trips } from "../types";
import { State, Trip } from "./types";

export default {
  /*
   * getting Trip List
   */
  getTripList(state: State): Trips {
    return state.tripList;
  },

  /**
   *
   * @param {State} - state
   * @returns {string} - public trips next token
   */
  getTripListNextToken(state: State): string {
    return state.tripList.nextToken;
  },

  /**
   *
   * @param {State} - state
   * @returns {Trip} - Current Trip
   */
  getCurrentTrip(state: State): Trip {
    return state.currentTrip;
  },
};
