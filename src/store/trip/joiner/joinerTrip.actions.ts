import {
  CANCEL_TICKETS,
  getPublicTripList,
} from "@/services/graphql/query/joiner.query";
import { useLoaderStore } from "@/store";
import { GET_PUBLIC_TRIP } from "@/services/graphql/query/sharebus/getPublicTrip.query";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { CountryFilter, PublicTrip, StoreContext } from "./types";
import { useApolloQueryAsync } from "@/composables/useApolloQueryAsync";
import { TripFilterUpdate } from "../privateTrip/types";
import { getSearchTrip } from "@/services/graphql/query/sales.query";

export default {
  async getPublicTrip(
    this: StoreContext,
    tripID: string,
    bookingReference?: string,
    unitTestCB?: () => void,
    cb?: () => void
  ): Promise<PublicTrip> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { onResult, onError } = useQuery(GET_PUBLIC_TRIP(tripID), null, {
      errorPolicy: "all",
      clientId: "api_key",
    });
    return new Promise((resolve, reject) => {
      onResult((queryResult) => {
        this.$state.trip = {
          ...queryResult.data.getPublicTrip.items[0],
        };
        loader.changeLoadingStatus({ isLoading: false });
        cb && cb();
        unitTestCB && unitTestCB();
        resolve(queryResult.data.getPublicTrip.items[0]);
      });
      onError((error) => {
        reject(error);
      });
    });
  },

  setCurrentStep(this: StoreContext, step: number) {
    this.currentStep = step;
  },

  /**
   * Get the trip list for joiner homepage
   * .
   * @param {StoreContext} this - store context
   */
  async fetchPublicTripListForJoiner(
    this: StoreContext,
    filter: CountryFilter,
    nextToken: string | null = null
  ): Promise<object> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const variables = {
      nextToken,
      filter,
    };

    const { apolloQuery } = useApolloQueryAsync(
      getPublicTripList,
      () => variables,
      {
        errorPolicy: "all",
        clientId: "api_key",
      }
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.availablePublicTrips.nextToken =
          res.data.listPublicTrips.nextToken;

        if (nextToken) {
          this.$state.availablePublicTrips.items = [
            ...this.$state.availablePublicTrips.items,
            ...res.data.listPublicTrips.items,
          ];
        } else {
          this.$state.availablePublicTrips.items = [
            ...res.data.listPublicTrips.items,
          ];
        }
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$reset();
        console.log(err);
        return err;
      });
  },

  /**
   * Cancel ticket action for joiner.
   *
   * @param {StoreContext} this
   * @param {string} tripID
   *
   */
  async cancelTickets(this: StoreContext, tripID: string) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(CANCEL_TICKETS);
    return sendData({
      input: { id: tripID },
    })
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((err: Error) => {
        loader.changeLoadingStatus({ isLoading: false });
        return err;
      });
  },

  /**
   * Get the trip list for Sales
   * .
   * @param {StoreContext} this - store context
   */
  async getTripListForJoinerBySearch(
    this: StoreContext,
    filter: TripFilterUpdate
  ): Promise<void> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { apolloQuery } = useApolloQueryAsync(
      getSearchTrip,
      () => ({
        filter,
      }),
      {
        errorPolicy: "all",
        clientId: "api_key",
      }
    );
    return apolloQuery()
      .then((queryResult) => {
        if (filter.page == 1) {
          this.$reset();
        }
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.availablePublicTrips.total =
          queryResult.data.searchTrip.total;
        const nextPageExist =
          Math.ceil(queryResult.data.searchTrip.total / filter.limit) >=
            filter.page &&
          filter.page !== 1 &&
          filter.page != null;
        if ((filter.query_string?.length && nextPageExist) || nextPageExist) {
          this.$state.availablePublicTrips.items = [
            ...this.$state.availablePublicTrips.items,
            ...queryResult.data.searchTrip.items,
          ];
        }
        if (filter.page == 1) {
          this.$state.availablePublicTrips.items =
            queryResult.data.searchTrip.items;
        }
        return queryResult.data.searchTrip;
      })
      .catch((err) => err);
  },
};
