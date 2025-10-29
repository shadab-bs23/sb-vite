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
} from "./types/sharebus/ShareBusCreationProcess";
import useLoaderStore from "../loader/loader.store";
import {
  SharebusStepOne,
  SharebusStepThree,
  SharebusStepTwo,
  StoreContext,
} from "./types";

export default {
  /**
   * Set trip details step 1 form data
   * @param {SharebusStepOne} stepOnePayload
   */
  setStepOneData(this: StoreContext, stepOnePayload: SharebusStepOne) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        stepOne: { ...stepOnePayload },
      },
    };
  },

  /**
   * Set trip details step 2 form data
   * @param {SharebusStepTwo} stepTwoPayload
   */
  setStepTwoData(this: StoreContext, stepTwoPayload: SharebusStepTwo) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        stepTwo: { ...stepTwoPayload },
      },
    };
  },

  /**
   * Set trip details step 3 form data
   * @param {SharebusStepThree} stepThreePayload
   */
  setStepThreeData(this: StoreContext, stepThreePayload: SharebusStepThree) {
    this.$state = {
      ...this.$state,
      setup: {
        ...this.$state.setup,
        stepThree: { ...this.$state.setup.stepThree, ...stepThreePayload },
      },
    };
  },
  /**
   * Set trip details step 3 form data
   * @param {string} key - where in obj where need to set specific value
   * @param {string|number} value - where in obj need to set specific value
   *
   * @returns{void} -returning void
   */
  setStep3DataSpecific(
    this: StoreContext,
    key: string,
    value: string | number
  ): void {
    this.$state.setup.stepThree[key] = value;
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
};
