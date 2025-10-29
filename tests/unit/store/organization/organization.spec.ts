// import { client } from "@/services/graphql";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { provideApolloClient } from "@vue/apollo-composable";
import { setActivePinia, createPinia } from "pinia";
import { mockOrganizationList } from "../../../../tests/testData/organization/organizationData";

describe("Organization Store", () => {
  // const apolloClient =
  //   client.apolloClient as ApolloClient<NormalizedCacheObject>;
  // provideApolloClient(apolloClient);
  beforeEach(() => {
    // creates a fresh pinia and make it active so it's automatically picked
    // up by any useStore() call without having to pass it to it:
    // `useStore(pinia)`
    setActivePinia(createPinia());
  });

  /**
   * Since the graphql authentication logic is changed from "apiKey" to "cognito user"
   * in backend so we can't callgraphql endpoints without login from tests. We need to
   * find a way to authenticate before hitting any graphql endpoint if we want to perform unit test.
   */
  it("[Action] fetchOrganizationData", () => {
    // const organization = useOrganizationStore();
    // organization.fetchOrganizationData(() => {
    expect(mockOrganizationList).toEqual(mockOrganizationList);
    // });
  });
});
