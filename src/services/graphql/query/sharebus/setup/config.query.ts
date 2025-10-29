import { SHAREBUS_CONFIG } from "@/services/graphql/enums/sharebus-config";
import gql from "graphql-tag";

export const SETUP_SHAREBUS_CONFIG = gql`
  query getConfiguration {
    getConfiguration(configuration_id: "${SHAREBUS_CONFIG.SETUP}")
  }
`;
