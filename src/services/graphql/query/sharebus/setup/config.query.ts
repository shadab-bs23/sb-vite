import gql from "graphql-tag";

export const SETUP_SHAREBUS_CONFIG = (configId) => gql`
  query getConfiguration {
    getConfiguration(configuration_id: "${configId}")
  }
`;
