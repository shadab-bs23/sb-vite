import { StoreContext } from "./types";
import { useQuery } from "@vue/apollo-composable";
import { ORGANIZATION_LIST } from "@/services/graphql/query";

export default {
  /*
   * fetching organization
   */
  fetchOrganizationData(
    this: StoreContext,
    filter: object,
    nextToken: string | null = null,
    unitTestCB?: () => void
  ) {
    const variables = {
      filter,
      nextToken,
    };
    const { onResult } = useQuery(ORGANIZATION_LIST, variables, {
      errorPolicy: "all",
    });

    onResult((queryResult) => {
      this.$state.organizationData = queryResult.data.listOrganizations.items;
      unitTestCB && unitTestCB();
    });
  },
};
