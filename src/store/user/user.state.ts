import { ROLE } from "@/components/common/enums/enums";
import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  data: {
    username: "",
    id: "",
    attributes: {
      sub: "",
      identities: "",
      email_verified: false,
      name: "",
      phone_number_verified: false,
      isProfileComplete: "",
      email: "",
    },
  },
  currentRole: ROLE.JOINER,
  partner: "",
  isAuthenticated: false,
  roles: [],
  isLoading: true,
});
