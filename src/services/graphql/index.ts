import { handleErrorResponse } from "@/core/http/graphql/handleResponse";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
  DefaultOptions,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { provideApolloClients } from "@vue/apollo-composable";
import { createAuthLink, AuthOptions } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { getAuthJWTToken } from "../auth/auth.service";
/*
 * initializing global hooks
 */
const is_in_mode_mock = import.meta.env.VITE_APP_MOCK === "true";
const url = import.meta.env.VITE_APP_APPSYNC_URL as string;

const httpLink = new HttpLink({ uri: is_in_mode_mock ? "/" : url });

const cache = new InMemoryCache();
/*
 * handling error
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  /*
   * response, operation, forward, those also can be extracted from onError
   * ref link 'https://www.apollographql.com/docs/react/data/error-handling/#advanced-error-handling-with-apollo-link'
   */

  if (graphQLErrors) {
    handleErrorResponse(graphQLErrors);
  }

  if (networkError) console.log(`[Network error]: ${networkError}`);
});
const region = import.meta.env.VITE_APP_APPSYNC_REGION as string;
const cognito_auth = {
  type: import.meta.env.VITE_APP_APPSYNC_AUTHENTICATION,
  jwtToken: getAuthJWTToken, // Required
} as AuthOptions;

const default_auth: AuthOptions = {
  type: "API_KEY",
  apiKey: import.meta.env.VITE_APP_APPSYNC_API_KEY as string,
};

const apollo_link_cognito = ApolloLink.from([
  createAuthLink({ url, region, auth: { ...cognito_auth } }),
  createSubscriptionHandshakeLink(
    { url, region, auth: { ...cognito_auth } },
    httpLink
  ),
]);
const apollo_link_deafult = ApolloLink.from([
  createAuthLink({ url, region, auth: { ...default_auth } }),
  createSubscriptionHandshakeLink(
    { url, region, auth: { ...default_auth } },
    httpLink
  ),
]);
/*
 * non cache obj provided
 */
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
  mutate: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};
/*
 * exporting global hook
 */
export const apolloClientCognito = new ApolloClient({
  link: errorLink.concat(apollo_link_cognito),
  cache,
  defaultOptions: defaultOptions,
});
export const apolloClientDefault = new ApolloClient({
  link: errorLink.concat(apollo_link_deafult),
  cache,
  defaultOptions: defaultOptions,
});
// multiple client provided for .ts file uses
provideApolloClients({
  default: apolloClientCognito,
  api_key: apolloClientDefault,
});
