// inspired from: https://stackoverflow.com/a/70155761

import { ApolloQueryResult, OperationVariables } from "@apollo/client";
import { useQuery } from "@vue/apollo-composable";
import {
  DocumentParameter,
  VariablesParameter,
  OptionsParameter,
} from "@vue/apollo-composable/dist/useQuery";

export function useApolloQueryAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResult = any, //any is defined by Apollo
  TVariables extends OperationVariables = OperationVariables
>(
  document: DocumentParameter<TResult, TVariables>,
  variables: () => VariablesParameter<TVariables>,
  options: OptionsParameter<TResult, VariablesParameter<TVariables>> = {
    errorPolicy: "all",
  }
) {
  const {
    onResult,
    loading: queryLoading,
    error,
    onError,
  } = useQuery(document, variables, options);

  const apolloQuery = () =>
    new Promise<ApolloQueryResult<TResult>>((resolve, reject) => {
      onResult((res) => {
        if (!res.loading) {
          if (!res.data) {
            reject(res);
          }
          resolve(res);
        }
      });
      onError((err) => {
        console.error(err);
        reject(err);
      });
    });

  return {
    apolloQuery,
    queryLoading,
    error,
  };
}
