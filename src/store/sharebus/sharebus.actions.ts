import {
  cancelSharebusMutation,
  createSharebusMutation,
  publishSharebusMutation,
} from "@/services/graphql/query";
import { DOWNLOAD_TICKETS } from "@/services/graphql/query/downloadTickets.query";
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  CreateShareBus,
  publishSharebus,
} from "types/sharebus/ShareBusCreationProcess";
import useLoaderStore from "../loader/loader.store";
import {
  RouteStepData,
  OrganizationStepData,
  PassengerGoalAndPriceStepData,
  TripInfoData,
  PublishStepData,
  StoreContext,
  TicketPricing,
  TicketDiscount,
} from "./types";

export default {
  /**
   * Set route step data
   * @param {RouteStepData} routeStepData
   */
  setRouteStepData(this: StoreContext, routeStepData: RouteStepData) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        routeStep: { ...routeStepData },
      },
    };
  },

  /**
   * Set organization step data
   * @param {OrganizationStepData} organizationStepData
   */
  setOrganizationStepData(
    this: StoreContext,
    organizationStepData: OrganizationStepData
  ) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        organizationStep: { ...organizationStepData },
      },
    };
  },

  /**
   * Set passenger goal and price step data
   * @param {PassengerGoalAndPriceStepData} passengerGoalAndPriceStepData
   */
  setPassengerGoalAndPriceStepData(
    this: StoreContext,
    passengerGoalAndPriceStepData: PassengerGoalAndPriceStepData
  ) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        passengerGoalAndPriceStep: {
          ...this.$state.setup.passengerGoalAndPriceStep,
          ...passengerGoalAndPriceStepData,
        },
      },
    };
  },

  /**
   * Set trip info data
   * @param {TripInfoData} tripInfoData
   */
  setTripInfoData(this: StoreContext, tripInfoData: TripInfoData) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        tripInfoStep: {
          ...this.$state.setup.tripInfoStep,
          ...tripInfoData,
        },
      },
    };
  },

  /**
   * Set publish step data
   * @param {PublishStepData} publishStepData
   */
  setPublishStepData(this: StoreContext, publishStepData: PublishStepData) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        publishStep: {
          ...this.$state.setup.publishStep,
          ...publishStepData,
        },
      },
    };
  },

  /**
   * Set specific data for passenger goal and price step
   * @param {string} key - where in obj where need to set specific value
   * @param {string|number|unknown} value - where in obj need to set specific value
   *
   * @returns{void} -returning void
   */
  setPassengerGoalAndPriceStepDataSpecific(
    this: StoreContext,
    key: keyof PassengerGoalAndPriceStepData,
    value: string | number | unknown
  ): void {
    this.$state.setup.passengerGoalAndPriceStep[key as string] = value;
  },

  async createSharebus(this: StoreContext, payload: CreateShareBus) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(createSharebusMutation);
    return sendData({
      input: payload,
    })
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((err) => {
        return err;
      });
  },

  async publishSharebus(this: StoreContext, payload: publishSharebus) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(publishSharebusMutation);
    return sendData({
      input: payload,
    }).then((result) => {
      loader.changeLoadingStatus({ isLoading: false });
      return result;
    });
  },

  async cancelSharebus(this: StoreContext, tripId: string, type = "") {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(cancelSharebusMutation);
    return sendData({
      input: { id: tripId, type: type },
    }).then((result) => {
      loader.changeLoadingStatus({ isLoading: false });
      if (!result?.data.cancelTrip.status) {
        throw new Error("error");
      }
      return result;
    });
  },
  /**
   * fetching bus info
   */
  async downLoadTickets(this: StoreContext, tripId: string): Promise<object> {
    const { onResult, error, loading } = useQuery(
      DOWNLOAD_TICKETS(tripId),
      null,
      {
        errorPolicy: "all",
      }
    );

    return { error, loading, onResult };
  },

  /**
   * Generate API payload from current step data
   */
  generateApiPayload(this: StoreContext): {
    suggested_ticket_price: number;
    ticket_pricing: TicketPricing;
    discounts: Record<string, { value: number }>;
  } {
    const stepData = this.$state.setup.passengerGoalAndPriceStep;

    return {
      suggested_ticket_price:
        stepData.suggested_ticket_price || stepData.ticketPrice || 0,
      ticket_pricing: {
        categories: stepData.ticket_pricing?.categories || [
          { name: "Adult", enabled: true },
          { name: "Child", enabled: true },
          { name: "Senior", enabled: false },
        ],
        via_points: stepData.ticket_pricing?.via_points || [],
      },
      discounts: stepData.discounts || {},
    };
  },

  /**
   * Update ticket pricing categories
   */
  updateTicketPricingCategories(
    this: StoreContext,
    categories: TicketPricing["categories"]
  ): void {
    if (!this.$state.setup.passengerGoalAndPriceStep.ticket_pricing) {
      this.$state.setup.passengerGoalAndPriceStep.ticket_pricing = {
        categories: [],
        via_points: [],
      };
    }
    this.$state.setup.passengerGoalAndPriceStep.ticket_pricing.categories =
      categories;
  },

  /**
   * Update via points pricing
   */
  updateViaPointsPricing(
    this: StoreContext,
    viaPoints: TicketPricing["via_points"]
  ): void {
    if (!this.$state.setup.passengerGoalAndPriceStep.ticket_pricing) {
      this.$state.setup.passengerGoalAndPriceStep.ticket_pricing = {
        categories: [],
        via_points: [],
      };
    }
    this.$state.setup.passengerGoalAndPriceStep.ticket_pricing.via_points =
      viaPoints;
  },

  /**
   * Update discounts
   */
  updateDiscounts(
    this: StoreContext,
    discounts: Record<string, { value: number }>
  ): void {
    this.$state.setup.passengerGoalAndPriceStep.discounts = discounts;
  },

  /**
   * Update ticket discounts
   */
  updateTicketDiscounts(
    this: StoreContext,
    ticketDiscounts: TicketDiscount[]
  ): void {
    this.$state.setup.passengerGoalAndPriceStep.ticket_discounts =
      ticketDiscounts;
  },
};
