export type UserSignUp = {
  username: string;
  password: string;
  attributes: {
    phone_number?: string;
    name: string;
  };
};
export type UserSignUpProcess = {
  username: string;
  password?: string;
  attributes: {
    phone_number: string;
    name: string;
  };
};

export type UserSignIn = {
  email: string;
  password: string;
};

export type signUpProcess = {
  isTermsAccepted?: boolean;
};

export type User = {
  id: string;
  username: string;
  attributes: TypeUserAttribute;
};

export type TypeUserAttribute = {
  sub: string;
  identities: string;
  email_verified: boolean;
  name: string;
  phone_number?: string;
  phone_number_verified: boolean;
  email: string;
  isProfileComplete?: string;
};

export type PasswordValidation = {
  min8Character: PasswordValidationData;
  upperCase: PasswordValidationData;
  lowerCase: PasswordValidationData;
  number: PasswordValidationData;
  specialCharacter: PasswordValidationData;
};
export type PasswordValidationData = {
  value: boolean;
  validationMessage: string;
};

export type countryObject = {
  dialCode: string;
  code: number;
  iso2: string;
};
