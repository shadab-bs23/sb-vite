import { UserSignIn, UserSignUp } from "././types/auth/user.type";

/*
 * initially type defines here but it will be moved on appropriate position while got the api
 */
type User = {
  name: string;
  email: string;
  country: string;
  role: string;
  language: string;
  language_code: string;
  gender: string;
};
export const mockUserProfile: User = {
  name: "test",
  email: "test@gmail.com",
  country: "No",
  role: "share_lead",
  language: "en_US",
  language_code: "en_US",
  gender: "male",
};

export const mockSignInPayload: UserSignIn = {
  email: "shadabanwar.bs23@gmail.com",
  password: "Qwer123!@#",
};

export const mockSignInResponse = {
  username: "c34aca09-d861-4d20-9604-e4860e4fc390",
  id: null,
  attributes: {
    sub: "c34aca09-d861-4d20-9604-e4860e4fc390",
    email_verified: false,
    name: "shadab",
    phone_number_verified: true,
    phone_number: "+8801857731881",
    email: "shadabanwar.bs23@gmail.com",
  },
};

export const signUpData: UserSignUp = {
  username: "test@gmail.com",
  password: "@WERq!@1222",
  attributes: {
    phone_number: "+880121212222",
    name: "test",
  },
};

export const mockAccAlreadyExistExp =
  "An account with the given email already exists.";
