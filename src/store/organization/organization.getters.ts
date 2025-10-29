import { OrganizationType } from "types/organization/organization.type";
import { State } from "./types";

export default {
  /**
   * getting the organization data
   *
   * @returns {OrganizationType[]} -getting organization list
   */
  getOrganizationData(state: State): OrganizationType[] {
    return state.organizationData;
  },
};
