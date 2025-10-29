import { ROLE } from "@/components/common/enums/enums";
import { User } from "././types/auth/user.type";
import { State } from "./types";
export default {
  /**
   * getting user info from getter
   *
   * @returns {User}
   */
  getUserInfo: (state: State): User => {
    return state.data;
  },
  /**
   * getting user authentication info
   *
   * @returns {boolean}
   */
  getAuthenticationInfo: (state: State): boolean => {
    return state.isAuthenticated;
  },

  getSalesPermission: (state: State): boolean => {
    return state.roles.indexOf(ROLE.FERDIA_SALES) > -1;
  },

  getShareleadPermission: (state: State): boolean => {
    return state.roles.indexOf(ROLE.SHARELEAD) > -1;
  },
  getPartnerShareleadPermission: (state: State): boolean => {
    const partnerRole = state.roles.some(
      (role) => role.split("-")[1] === ROLE.SHARELEAD
    );
    return partnerRole;
  },
};
