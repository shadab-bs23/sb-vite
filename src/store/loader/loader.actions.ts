import { State, StoreContext } from "./types";

export default {
  /**
   * Change loading status action
   * @param {UserSignIn} signInData
   */
  changeLoadingStatus(this: StoreContext, payload: State) {
    this.$state = {
      ...this.$state,
      isLoading: payload.isLoading,
    };
  },
};
