import {
  RouteStepData,
  OrganizationStepData,
  PassengerGoalAndPriceStepData,
  TripInfoData,
  PublishStepData,
  State,
} from "./types";

export default {
  /*
   * Get route step data
   */
  getRouteStepData(state: State): RouteStepData {
    return state.setup.routeStep;
  },

  /*
   * Get organization step data
   */
  getOrganizationStepData(state: State): OrganizationStepData {
    return state.setup.organizationStep;
  },

  /*
   * Get passenger goal and price step data
   */ getPassengerGoalAndPriceStepData(
    state: State
  ): PassengerGoalAndPriceStepData {
    return state.setup.passengerGoalAndPriceStep;
  },

  /**
   * Get trip info data
   * @param {State} state
   * @returns {TripInfoData}
   */
  getTripInfoData(state: State): TripInfoData {
    return (
      state.setup.tripInfoStep || {
        trip_organizer: "",
        name: "",
        website_url: "",
        image_url: "",
        category: "",
        info_to_travellers: "",
      }
    );
  },

  /**
   * Get publish step data
   * @param {State} state
   * @returns {PublishStepData | undefined}
   */
  getPublishStepData(state: State): PublishStepData | undefined {
    return state.setup.publishStep;
  },
};
