import { State } from "./types";
/*
 * define state here
 */
export default (): State => ({
  signUp: {
    username: "",
    attributes: {
      phone_number: "",
      name: "",
    },
  },
  isSocialSignUp: false,
  forgotPassword: {
    step: 1,
    userName: "",
    code: null,
  },
});
