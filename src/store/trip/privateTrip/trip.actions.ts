import { useApolloQueryAsync } from "@/composables/useApolloQueryAsync";
import { getShareLeadTripListQuery } from "@/services/graphql/query";
import {
  GET_JOINER_TRIP_LIST,
  GET_JOINER_TRIP_LIST_ARCHIVED,
  GET_JOINER_TRIP_LIST_BOOKING_CANCELLED,
} from "@/services/graphql/query/joiner.query";
import {
  getSalesActiveTripList,
  getSalesArchivedTripList,
  getSalesUnpublishTripList,
  getSearchTrip,
} from "@/services/graphql/query/sales.query";
import { GET_TRIP } from "@/services/graphql/query/sharebus/getTrip.query";

import { useLoaderStore } from "@/store";
import { TripEditor } from "@/store/salesConsole/types";
import { useQuery } from "@vue/apollo-composable";
import { StoreContext, TripFilterSharelead, TripFilterUpdate } from "./types";
import { CountryFilter } from "../types";

export default {
  /**
   * Get the sharebus configuration from backend endpoint.
   * @param {StoreContext} this
   * @param {string} tripID - eg. "329595b6-cb54-421e-b1f3-8148078b2646"
   */
  getTrip(
    this: StoreContext,
    tripID: string,
    unitTestCB?: () => void,
    cb?: () => void
  ) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });

    const { apolloQuery } = useApolloQueryAsync(GET_TRIP(tripID), () => ({}));

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.currentTrip = {
          ...this.$state.currentTrip,
          ...res.data.getTrip,
        };
        this.$state.currentTrip.ticket = res.data.listTickets.items;
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
  /**
   * Get the trip list for sharelead
   * .
   * @param {StoreContext} this
   */
  async getTripListShareLead(
    this: StoreContext,
    filter = {
      event_status: { between: ["OPEN", "UNPUBLISHED"] },
      country: null,
    } as TripFilterSharelead,
    nextToken: string | null = null
  ): Promise<object> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const variables = {
      filter: filter,
      nextToken: nextToken || null,
    };
    const { onResult, error, loading, onError } = useQuery(
      getShareLeadTripListQuery,
      variables,
      {
        errorPolicy: "all",
      }
    );

    onResult((queryResult) => {
      loader.changeLoadingStatus({ isLoading: false });
      this.$state.tripList.nextToken =
        queryResult.data.listShareleadBusses.nextToken;
      if (nextToken) {
        this.$state.tripList.items = [
          ...this.$state.tripList.items,
          ...queryResult.data.listShareleadBusses.items,
        ];
      } else {
        this.$state.tripList.items = [
          ...queryResult.data.listShareleadBusses.items,
        ];
      }
      return queryResult.data.listShareleadBusses;
    });

    onError((error) => {
      this.$reset();
      console.log(error);
    });
    return { error, loading };
  },

  /**
   * Get the trip list for joiner
   * .
   * @param {StoreContext} this
   */
  async getTripListJoiner(
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
      GET_JOINER_TRIP_LIST,
      () => variables,
      {
        errorPolicy: "all",
      }
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.tripList.nextToken = res.data.listJoinerTrips.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.listJoinerTrips.items,
          ];
        } else {
          this.$state.tripList.items = [...res.data.listJoinerTrips.items];
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
   * Get the trip list for joiner
   * .
   * @param {StoreContext} this
   */
  async getTripListJoinerArchived(
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
      GET_JOINER_TRIP_LIST_ARCHIVED,
      () => variables,
      {
        errorPolicy: "all",
      }
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.tripList.nextToken =
          res.data.listJoinerArchivedTrips.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.listJoinerArchivedTrips.items,
          ];
        } else {
          this.$state.tripList.items = [
            ...res.data.listJoinerArchivedTrips.items,
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
   * Get the trip list for joiner
   * .
   * @param {StoreContext} this
   */
  async getTripListJoinerCancelledBooking(
    this: StoreContext,
    filter: CountryFilter,
    nextToken: string | null = null
  ): Promise<object> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });

    const variables = {
      input: { nextToken, country: filter.country },
    };

    const { apolloQuery } = useApolloQueryAsync(
      GET_JOINER_TRIP_LIST_BOOKING_CANCELLED,
      () => variables,
      {
        errorPolicy: "all",
      }
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.tripList.nextToken =
          res.data.cancelTicketJoinerHistory.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.cancelTicketJoinerHistory.items,
          ];
        } else {
          this.$state.tripList.items = [
            ...res.data.cancelTicketJoinerHistory.items,
          ];
        }
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        console.log(err);
        return err;
      });
  },

  getSalesActiveTrips(
    this: StoreContext,
    filter: CountryFilter,
    nextToken: string | null = null
  ): Promise<void> {
    const loader = useLoaderStore();

    loader.changeLoadingStatus({ isLoading: true });

    const { apolloQuery } = useApolloQueryAsync(getSalesActiveTripList, () => ({
      nextToken,
      filter,
    }));

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });

        this.$state.tripList.nextToken =
          res.data.listSalesActiveTrips.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.listSalesActiveTrips.items,
          ];
        } else {
          this.$state.tripList.items = res.data.listSalesActiveTrips.items;
        }
        // return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$reset();
        console.log(err);
        // return err;
      });
  },

  getSalesUnpublishTrips(
    this: StoreContext,
    filter: CountryFilter,
    nextToken: string | null = null
  ): Promise<void> {
    const loader = useLoaderStore();

    loader.changeLoadingStatus({ isLoading: true });

    const { apolloQuery } = useApolloQueryAsync(
      getSalesUnpublishTripList,
      () => ({
        nextToken,
        filter,
      })
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });

        this.$state.tripList.nextToken =
          res.data.listSalesUnpublishTrips.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.listSalesUnpublishTrips.items,
          ];
        } else {
          this.$state.tripList.items = res.data.listSalesUnpublishTrips.items;
        }
        // return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$reset();
        console.log(err);
        // return err;
      });
  },

  getSalesArchivedTrips(
    this: StoreContext,
    filter: CountryFilter,
    nextToken: string | null = null
  ): Promise<void> {
    const loader = useLoaderStore();

    loader.changeLoadingStatus({ isLoading: true });

    const { apolloQuery } = useApolloQueryAsync(
      getSalesArchivedTripList,
      () => ({
        nextToken,
        filter,
      })
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });

        this.$state.tripList.nextToken =
          res.data.listSalesArchivedTrips.nextToken;

        if (nextToken) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...res.data.listSalesArchivedTrips.items,
          ];
        } else {
          this.$state.tripList.items = res.data.listSalesArchivedTrips.items;
        }
        // return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$reset();
        console.log(err);
        // return err;
      });
  },

  setEditor(this: StoreContext, editor: TripEditor) {
    this.$state.currentTrip.update_history.updated_by_ferdia_sales = editor;
  },

  /**
   * Get the trip list for Sales
   * .
   * @param {StoreContext} this - store context
   */
  async getTripListForSalesBySearch(
    this: StoreContext,
    filter: TripFilterUpdate
  ): Promise<void> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { apolloQuery } = useApolloQueryAsync(getSearchTrip, () => ({
      filter,
    }));
    return apolloQuery()
      .then((queryResult) => {
        if (filter.page == 1) {
          this.$reset();
        }
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.tripList.total = queryResult.data.searchTrip.total;
        const nextPageExist =
          Math.ceil(queryResult.data.searchTrip.total / filter.limit) >=
            filter.page &&
          filter.page !== 1 &&
          filter.page != null;
        if ((filter.query_string?.length && nextPageExist) || nextPageExist) {
          this.$state.tripList.items = [
            ...this.$state.tripList.items,
            ...queryResult.data.searchTrip.items,
          ];
        }
        if (filter.page == 1) {
          this.$state.tripList.items = queryResult.data.searchTrip.items;
        }
        return queryResult.data.searchTrip;
      })
      .catch((err) => err);
  },
};
