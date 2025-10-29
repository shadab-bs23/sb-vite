import { string } from "yup";
import { t } from "@/locales";

export const phoneNumberRule = (isPhoneValid: boolean) =>
  string()
    .required(
      t("form.validation.field_required", {
        field_name: t("auth.common.phone_number"),
      })
    )
    .test("valid", "Phone number is not valid.", () => isPhoneValid);
