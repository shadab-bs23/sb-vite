import { useMutation } from "@vue/apollo-composable";
import useLoaderStore from "../loader/loader.store";

import updateAttribute from "../../services/graphql/query/updateAttribute.mutation.gql";
import unpublishTrip from "../../services/graphql/query/unpublishTrip.mutation.gql";
import {
  ConfirmTripStatus,
  CopyTripStatus,
  GetPassengersResponse,
  SalesEditGroup,
  StoreContext,
  TripSetType,
  UnpublishTripStatus,
  salesConsoleEditTrip,
} from "./types";
import { salesMockData } from "../../../tests/testData/sales/salesData";
import {
  CONFIRM_TRIP,
  COPY_TRIP,
  GET_PASSENGERS_LIST,
} from "@/services/graphql/query/sales.query";
import { useApolloQueryAsync } from "@/composables/useApolloQueryAsync";

export default {
  /**
   *
   * @param this
   * @param payload
   */
  setSalesConsoleTripChangeRequest(this: StoreContext, payload: TripSetType) {
    const tripId = Object.keys(payload)[0];
    const payloadValue = Object.values(payload)[0];
    const isTripKeyExist = Object.keys(this.$state.salesEditTrip).includes(
      tripId
    );
    const defaultValue = { ...Object.values(salesMockData)[0] };
    const existTripValue = isTripKeyExist
      ? this.$state.salesEditTrip[tripId]
      : defaultValue;
    this.$state.salesEditTrip = { [tripId]: existTripValue };
    for (const [key, value] of Object.entries(payloadValue)) {
      if (key == SalesEditGroup.UPDATE_HISTORY) {
        this.$state.salesEditTrip[tripId][key] = {
          ...this.$state.salesEditTrip[tripId][key],
          ...value,
        };
      } else {
        this.$state.salesEditTrip[tripId][key] = value;
      }
    }
  },
  /**
   *
   * @param this
   * @returns
   */
  getSalesConsoleTrip(this: StoreContext): salesConsoleEditTrip {
    return this.$state.salesEditTrip;
  },
  /**
   *
   * @param this
   * @param payload
   * @returns
   */
  async updateTripAttribute(
    this: StoreContext,
    payload: object
  ): Promise<salesConsoleEditTrip> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(updateAttribute);
    return sendData({
      input: payload,
    })
      .then((result) => {
        return result?.data.updateAttribute;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },

  /**
   * Unpublish a trip using tripID
   * @param this
   * @param payload
   * @returns
   */
  async unpublishTrip(
    this: StoreContext,
    payload: object
  ): Promise<UnpublishTripStatus> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(unpublishTrip);
    return sendData({
      input: payload,
    })
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result?.data.unpublishTrip;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },

  /**
   * Confirm a trip using tripID
   * @param this
   * @param payload
   * @returns
   */
  async confirmTrip(
    this: StoreContext,
    payload: object
  ): Promise<ConfirmTripStatus> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(CONFIRM_TRIP);
    return sendData({
      input: payload,
    })
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result?.data.confirmTripBySales;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },

  /**
   * Copy a trip using tripID
   * @param this
   * @param payload
   * @returns
   */
  async copyTripAction(
    this: StoreContext,
    payload: object
  ): Promise<CopyTripStatus> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(COPY_TRIP);
    return sendData({
      input: payload,
    })
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result?.data.copyTrip;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error);
      });
  },

  /**
   * Get passengers list of a trip using tripID
   * @param this
   * @param payload
   * @returns
   */
  async getPassengersAction(
    this: StoreContext,
    tripID: string,
    unitTestCB?: () => void,
    cb?: () => void
  ): Promise<GetPassengersResponse> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { apolloQuery } = useApolloQueryAsync(GET_PASSENGERS_LIST, () => ({
      trip_id: tripID,
    }));

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        cb && cb();
        unitTestCB && unitTestCB();
        return res.data;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        console.log(err);
        return err;
      });
  },
};
