import { SETUP_SHAREBUS_CONFIG } from "@/services/graphql/query/sharebus/setup/config.query";
import { useQuery } from "@vue/apollo-composable";
import { StoreContext } from "./types";

export default {
  /**
   * Get the sharebus configuration from backend endpoint.
   * @param {StoreContext} this
   */
  fetchSetupSharebusConfig(this: StoreContext, unitTestCB?: () => void) {
    const { onResult } = useQuery(SETUP_SHAREBUS_CONFIG, null, {
      errorPolicy: "all",
      clientId: "api_key",
    });

    onResult((queryResult) => {
      this.$state.setupSharebus = {
        ...this.$state.setupSharebus,
        ...JSON.parse(queryResult.data.getConfiguration),
      };
      this.$state.loading = false;
      unitTestCB && unitTestCB();
    });
  },
};
