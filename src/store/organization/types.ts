import { StoreDefinition } from "pinia";
import { OrganizationType } from "types/organization/organization.type";

export interface State {
  organizationData: OrganizationType[];
}

interface Getters {
  getOrganizationData: () => OrganizationType[];
}
interface Actions {
  fetchOrganizationData: (
    filter: object,
    nextToken?: string,
    unitTestCB?: () => void
  ) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"organization", State, Getters, Actions>
>;
