import { StoreContext } from "./types";
import { BUS_PRICE } from "@/services/graphql/query";
import useLoaderStore from "../loader/loader.store";
import { useApolloQueryAsync } from "@/composables/useApolloQueryAsync";

export default {
  /**
   * fetching bus info
   */
  async fetchBusInfoData(
    this: StoreContext,
    queryPayload,
    unitTestCB?: () => void
  ): Promise<object> {
    const loader = useLoaderStore();
    this.$reset();
    loader.changeLoadingStatus({ isLoading: true });
    const { apolloQuery } = useApolloQueryAsync(BUS_PRICE, () => ({
      input: queryPayload,
    }));

    return apolloQuery()
      .then((res) => {
        this.$state.busData = res.data.getBusPrice;

        unitTestCB && unitTestCB();
        loader.changeLoadingStatus({ isLoading: false });
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        this.$state.busData = {
          total: 200,
          order_type: "oneway",
          bus_availability: "available",
          vat_percent: 10,
        };
        // this.$reset();
        return err;
      });
  },
};
