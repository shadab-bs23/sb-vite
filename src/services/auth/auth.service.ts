import { Auth, Amplify, Storage } from "aws-amplify";
import { UserSignUp } from "types/auth/user.type";
import { showToast } from "../toast/toast.service";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { ForgotPassword } from "@/store/user/types";
/**
 *
 * limitation @link https://github.com/aws-amplify/amplify-flutter/issues/1902
 */

export const initAmplify = () => {
  Amplify.configure({
    Auth: {
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: import.meta.env.VITE_APP_AUTH_IDENTITY_POOL_ID,

      // REQUIRED - Amazon Cognito Region
      region: import.meta.env.VITE_APP_AUTH_REGION,

      // OPTIONAL - Amazon Cognito Federated Identity Pool Region
      // Required only if it's different from Amazon Cognito Region
      identityPoolRegion: import.meta.env.VITE_APP_AUTH_IDENTITY_POOL_REGION,

      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: import.meta.env.VITE_APP_AUTH_USER_POOL_ID,

      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolWebClientId: import.meta.env.VITE_APP_AUTH_CLIENT_ID,

      oauth: {
        redirectSignIn: import.meta.env.VITE_APP_AUTH_REDIRECT_SIGN_IN_URL,
        redirectSignOut: import.meta.env.VITE_APP_AUTH_REDIRECT_SIGN_OUT_URL,
        domain: import.meta.env.VITE_APP_AUTH_DOMAIN,
        scope: ["phone", "email", "openid", "aws.cognito.signin.user.admin"],

        responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
      },
    },

    Storage: {
      AWSS3: {
        bucket: import.meta.env.VITE_APP_S3_BUCKET,
        // level: "public",
        region: import.meta.env.VITE_APP_AUTH_REGION,
        customPrefix: {
          public: "assets/",
        },
      },
    },
  });
  Auth.configure();
  Storage.configure();
};

export const signIn = async (email: string, password: string) => {
  return await Auth.signIn(email, password);
};

export const signUp = (payload: UserSignUp) => {
  return Auth.signUp(payload);
};

export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    showToast("error", "Can't sign out right now!", 1000);
  }
};

export const googleSingIn = () => {
  return Auth.federatedSignIn({
    provider: CognitoHostedUIIdentityProvider.Google,
  });
};

export const getUser = async () => {
  return await Auth.currentUserInfo();
};
export const getAuthenticatedUser = () => {
  return Auth.currentAuthenticatedUser();
};

export const updateUser = async (attributes) => {
  const user = await Auth.currentAuthenticatedUser();
  return await Auth.updateUserAttributes(user, attributes);
};

export const confirmSignUp = (username: string, code: string) => {
  return Auth.confirmSignUp(username, code);
};

export const confirmUnverifiedAttribute = async (
  attribute: string,
  code: string
) => {
  const user = await Auth.currentAuthenticatedUser();
  return Auth.verifyUserAttributeSubmit(user, attribute, code);
};

export const verifyUserAttribute = async (attribute: string) => {
  return Auth.verifyCurrentUserAttribute(attribute);
};

export const resendConfirmationCode = (username: string) => {
  return Auth.resendSignUp(username);
};

export const getAuthJWTToken = async () => {
  const session = await Auth.currentSession();

  return session.getAccessToken().getJwtToken();
};
export const refreshToken = async () => {
  return Auth.currentSession();
};
export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const user = await Auth.currentAuthenticatedUser();
  return Auth.changePassword(user, oldPassword, newPassword);
};

export const forgotPassword = async (userName: string) => {
  return Auth.forgotPassword(userName);
};
export const forgotPasswordSubmit = async (payload: ForgotPassword) => {
  return Auth.forgotPasswordSubmit(
    payload.username,
    payload.code,
    payload.new_password
  );
};
