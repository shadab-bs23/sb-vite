import {
  signIn,
  signUp,
  googleSingIn,
  getUser,
  updateUser,
  resendConfirmationCode,
  confirmSignUp,
  signOut,
  confirmUnverifiedAttribute,
  verifyUserAttribute,
  forgotPasswordSubmit,
  getAuthenticatedUser,
} from "@/services/auth/auth.service";
import { UserSignUp } from "types/auth/user.type";
import { showToast } from "@/services/toast/toast.service";
import { UserSignIn } from "types/auth/user.type";
import { GeneralError } from "types/errors/errors.type";
import useLoaderStore from "../loader/loader.store";
import { ForgotPassword, StoreContext } from "./types";
import {
  DELETE_USER_INFO,
  RESET_PASSWORD,
  getUserInfo,
} from "@/services/graphql/query";
import { useApolloQueryAsync } from "@/composables/useApolloQueryAsync";
import { ROLE } from "@/components/common/enums/enums";
import { useMutation } from "@vue/apollo-composable";
import type { ApolloQueryResult } from "@apollo/client";

export default {
  /**
   * Attempt to sign in a user
   * @param {UserSignIn} signInData
   * @param {Function} successCallback
   * @param {Function} errorCallback
   */
  signInAction(this: StoreContext, signInData: UserSignIn) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });

    return signIn(signInData.email, signInData.password)
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw err;
      });
  },

  async handleResendConfirmationCode(this: StoreContext, username: string) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    return resendConfirmationCode(username)
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw error;
      });
  },
  async handleUserUnverifiedAttribute(
    this: StoreContext,
    attribute: string,
    code: string
  ) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    return confirmUnverifiedAttribute(attribute, code)
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw error;
      });
  },
  /**
   * send otp to verify a user attribute
   *
   * @param {StoreContext} this - the state
   * @param {string} attribute - the attributes that need to be verify
   */
  async handleVerifyUserAttribute(this: StoreContext, attribute: string) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    return verifyUserAttribute(attribute)
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw error;
      });
  },
  /**
   * send otp to verify a user attribute
   *
   * @param {StoreContext} this - the state
   * @param {string} userName - the username of users
   */
  async handleForgotPasswordCode(
    this: StoreContext,
    userName: string
  ): Promise<object> {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });

    const variables = {
      email: userName,
    };

    const { apolloQuery } = useApolloQueryAsync(
      RESET_PASSWORD(variables),
      () => ({}),
      {
        errorPolicy: "all",
        clientId: "api_key",
      }
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        return err;
      });
  },
  /**
   * send otp to verify a user attribute
   *
   * @param {StoreContext} this - the state
   * @param {ForgotPassword} payload - payload for forgot password
   */
  async handleForgotPasswordSubmit(
    this: StoreContext,
    payload: ForgotPassword
  ) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    return forgotPasswordSubmit(payload)
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        return result;
      })
      .catch((error) => {
        loader.changeLoadingStatus({ isLoading: false });
        throw error;
      });
  },
  async signOutAction(this: StoreContext) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    try {
      this.$reset();
      this.$state.isLoading = false;
      await signOut().then(() =>
        loader.changeLoadingStatus({ isLoading: false })
      );
    } catch (err) {
      loader.changeLoadingStatus({ isLoading: false });
      showToast("error", (err as GeneralError).message, 1800, "top-right");
    }
  },

  /**
   * Set current user's role
   * @param {string} username
   */
  setUserRoleAction(this: StoreContext, role: string) {
    this.$state = {
      ...this.$state,
      currentRole: role,
    };
    localStorage.setItem("userRole", role);
  },

  /**
   * register a  user
   * @param {UserSignUp} payload
   */
  async handleSignUp(this: StoreContext, payload: UserSignUp) {
    return signUp(payload)
      .then((result) => {
        return result;
      })
      .catch(function (error) {
        throw error;
      });
  },
  /**
   * register a  user
   * @param {UserSignUp} object
   */
  async handleUpdateUser(this: StoreContext, payload: object) {
    return updateUser(payload)
      .then((result) => {
        return result;
      })
      .catch(function (error) {
        throw error;
      });
  },
  /**
   * confirming signup a  user
   * @param {string} username username of users
   * @param {string} code code of users
   */
  async handleConfirmSignUp(
    this: StoreContext,
    username: string,
    code: string
  ) {
    return confirmSignUp(username, code)
      .then((result) => {
        return result;
      })
      .catch(function (error) {
        throw error;
      });
  },
  /**
   * handling google signup a  user
   */
  async handleGoogleSignUp(this: StoreContext) {
    this.$reset();
    return googleSingIn()
      .then((result) => {
        return result;
      })
      .catch(function (error) {
        throw new Error(error.message);
      });
  },
  /**
   * fetching user info
   */
  async fetchingUserInfo(this: StoreContext) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    return await getUser()
      .then((result) => {
        loader.changeLoadingStatus({ isLoading: false });
        if (result) {
          this.$state.data = result;
          this.$state.isAuthenticated =
            this.$state.data.attributes.phone_number_verified === true &&
            this.$state.data.attributes.email_verified === true;
          this.setCognitoUserRoles();
          return result;
        } else {
          this.$state.isAuthenticated = false;
          this.$state.isLoading = false;
          return result;
        }
      })
      .catch((error) => {
        this.$state.isLoading = false;
        loader.changeLoadingStatus({ isLoading: false });
        throw new Error(error.message);
      });
  },

  setCognitoUserRoles(this: StoreContext) {
    this.$state.currentRole = localStorage.getItem("userRole") as string;
    getAuthenticatedUser().then((data) => {
      const roles =
        data.signInUserSession.accessToken.payload["cognito:groups"];

      if (roles && roles.length) {
        this.$patch({
          roles,
        });
      }

      const partner = this.$state.roles.find((role) => {
        if (role.split("-")[1] === ROLE.SHARELEAD) return role;
      });

      if (partner) this.$patch({ partner: partner.split("-")[0] });

      this.$state.isLoading = false;
    });
  },

  fetchUserById(
    this: StoreContext,
    userId: string
  ): Promise<ApolloQueryResult<{ getUserInfo: string }>> {
    const loader = useLoaderStore();

    loader.changeLoadingStatus({ isLoading: true });

    const { apolloQuery } = useApolloQueryAsync<{ getUserInfo: string }>(
      getUserInfo,
      () => ({
        id: userId,
      })
    );

    return apolloQuery()
      .then((res) => {
        loader.changeLoadingStatus({ isLoading: false });
        return res;
      })
      .catch((err) => {
        loader.changeLoadingStatus({ isLoading: false });
        console.log(err);
        return err;
      });
  },

  /**
   * Delete user action
   *
   */
  deleteUser(this: StoreContext) {
    const loader = useLoaderStore();
    loader.changeLoadingStatus({ isLoading: true });
    const { mutate: sendData } = useMutation(DELETE_USER_INFO);
    return sendData().then((result) => {
      loader.changeLoadingStatus({ isLoading: false });
      return result;
    });
  },
};
