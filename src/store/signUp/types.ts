import { StoreDefinition } from "pinia";
import { UserSignUpProcess } from "types/auth/user.type";

export type ForgotPassword = {
  step?: number;
  userName?: string;
  code?: string | null;
};

export interface State {
  signUp: UserSignUpProcess;
  isSocialSignUp: boolean;
  forgotPassword: ForgotPassword;
}

interface Getters {
  getSignUpInfo: () => State;
}
interface Actions {
  handleSignUpInfo: (
    payload: UserSignUpProcess,
    isSocialSignUp: boolean
  ) => void;
  handleForGotPasswordInfo: (payload: object) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"signup", State, Getters, Actions>
>;
