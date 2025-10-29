import { UserSignUpProcess } from "types/auth/user.type";
import { ForgotPassword, StoreContext } from "./types";

export default {
  /**
   * handle signup info
   *
   * @param {UserSignUpProcess} payload -signup info
   * @param {false} isSocialSignUp -is signup is social
   */
  handleSignUpInfo(
    this: StoreContext,
    payload: UserSignUpProcess,
    isSocialSignUp = false
  ) {
    this.$state.signUp = payload;
    this.$state.isSocialSignUp = isSocialSignUp;
  },
  /**
   * Change loading status action
   * @param {ForgotPassword} payload
   */
  handleForGotPasswordInfo(this: StoreContext, payload: ForgotPassword) {
    this.$state.forgotPassword = { ...this.$state.forgotPassword, ...payload };
  },
};
