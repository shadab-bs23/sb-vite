import { StoreDefinition } from "pinia";
import { User, UserSignIn } from "types/auth/user.type";
import { UserSignUp } from "types/auth/user.type";
import type { ApolloQueryResult } from "@apollo/client";
// import { GeneralError } from "types/errors/errors.type";
export interface State {
  data: User;
  isAuthenticated: boolean;
  roles: string[];
  currentRole: string;
  partner: string;
  isLoading: boolean;
}

export type ForgotPassword = {
  username: string;
  code: string;
  new_password: string;
};

interface Getters {
  getUserInfo: (state: State) => User;
  getAuthenticationInfo: (state: State) => boolean;
  getSalesPermission: (state: State) => boolean;
  getShareleadPermission: (state: State) => boolean;
}
interface Actions {
  signInAction: (signInData: UserSignIn) => void;
  signOutAction: () => void;
  setUserRoleAction: (role: string) => Promise<void>;
  setCognitoUserRoles: () => void;
  handleSignUp: (payload: UserSignUp) => void;
  handleConfirmSignUp: (username: string, code: string) => void;
  handleGoogleSignUp: () => void;
  fetchingUserInfo: () => void;
  handleUpdateUser: (payload: object) => void;
  handleResendConfirmationCode: (username: string) => void;
  handleUserUnverifiedAttribute: (attribute: string, code: string) => void;
  handleVerifyUserAttribute(attribute: string);
  handleForgotPasswordCode(userName: string): Promise<object>;
  handleForgotPasswordSubmit(payload: ForgotPassword);
  fetchUserById(
    userId: string
  ): Promise<ApolloQueryResult<{ getUserInfo: string }>>;
  deleteUser(): void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"user", State, Getters, Actions>
>;
