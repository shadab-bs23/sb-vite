import { string } from "yup";
import { t } from "@/locales";

export const phoneNumberRule = (isPhoneValid: boolean) =>
  string()
    .required("This field is required.")
    .test("valid", "Phone number is not valid.", () => isPhoneValid);
